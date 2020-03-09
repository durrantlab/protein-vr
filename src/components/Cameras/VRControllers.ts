// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


import * as Navigation from "../Navigation/Navigation";
import * as Pickables from "../Navigation/Pickables";
import * as Points from "../Navigation/Points";
import * as Vars from "../Vars/Vars";
import * as CommonCamera from "./CommonCamera";
import * as VRCamera from "./VRCamera";
// import * as DebugMsg from "../UI/DebugMsg";

declare var BABYLON: any;

let lastTriggerTime = 0;
let lastPadRotationTime = 0;

let padMoveSpeedFactor = 0.0;
let padRotateSpeedFactor = 0.0;
let padPressed = false;

let inputSources = {
    "left": undefined,
    "right": undefined,
    "other": undefined  // in case not specified.
};

let currentInputSourceType = "";

// let startedCheckingForControllers = false;

/**
 * Sets up the enter and exit functions when controllers load. No unload
 * function, though I'd like one.
 * @returns void
 */
export function setup(): void {
    Vars.vrHelper.input.onControllerAddedObservable.add((inputSource) => {
        // https://doc.babylonjs.com/how_to/webxr_controllers_support#how-to-get-a-model

        inputSource.onMeshLoadedObservable.add((controllerMesh: any) => {
            // Unfortunately, controllers are PBR materials by default, which
            // require more advanced lighting:
            // https://doc.babylonjs.com/how_to/physically_based_rendering#light-setup.
            // Switch all materials on controllers to be standard materials.

            let meshes = [controllerMesh];
            let meshIdx = 0;
            while (meshIdx < meshes.length) {
                let mesh = meshes[meshIdx];
                if (mesh.material && mesh.material.albedoTexture) {
                    const newMat = new BABYLON.StandardMaterial(
                        mesh.name + "Material",
                        Vars.scene
                    );

                    newMat.diffuseTexture = mesh.material.albedoTexture;

                    mesh.material = newMat;
                }

                meshes = meshes.concat(mesh.getChildren());
                meshIdx++;
            }
        });

        // Set gaze point using motion controller.
        inputSource.onMotionControllerInitObservable.add((motionController) => {
            // Save input sources so they can be access elsewhere.
            inputSources[getSourceType(motionController.handness)] = inputSource;

            switchNavigationControl(motionController);

            // Put a cube around the camera. This is to receive picker for pad-based
            // navigation, even if you're not pointing at a protein.
            Pickables.makePadNavigationSphereAroundCamera();

            Vars.vrVars.navMode = Navigation.NavMode.VRWithControllers;
            setupMotionControllerTrigger(motionController);
            setupMotionPad(motionController);
        });

        // Need to set it up separately for gaze controller.
        setupGazeTrackingButtonClick();
    });

    // // onControllersAttachedObservable doesn't work. I'd prefer that one...
    // Vars.vrHelper.input.onControllerAddedObservable.add((webXRController /* WebXRController instance */ ) => {
    //     // WAS: Vars.vrHelper.webVRCamera.onControllerMeshLoadedObservable.add((webVRController: any) => {
    //     onControllerLoaded(webXRController);  // JDDJDD. webXRController != webVRController. Could be additional changes needed.
    // });

    // JDDJDD
    // Vars.vrHelper.onControllerMeshLoaded.add((webVRController: any) => {
    //     onControllerLoaded(webVRController);
    // });

    // Vars.vrHelper.webVRCamera.onControllersAttachedObservable.add((v) => {
    //     Vars.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
    // });

    // Doesn't appear to be a detach function...
}

export function setupGazeTrackingButtonClick(): void {
    Vars.vrHelper.input.onControllerAddedObservable.add((inputSource) => {
        Vars.vrHelper.baseExperience.sessionManager.session.onselect = (inputSource) => {
            // Note that this gets triggered by any selection, including those
            // made with motion-controller buttons. But those buttons are
            // dealt with elsewhere, so let's check for gaze here. Otherwise,
            // when using a motion controller the actOnStareTrigger function
            // will get called twice.

            if (inputSource.inputSource.targetRayMode.toUpperCase().indexOf("GAZE") !== -1) {
                Navigation.actOnStareTrigger();
            }
        };
    });
}

function getSourceType(handness: string): string {
    switch (handness) {
        case "left":
            return "left";
        case "right":
            return "right";
        default:
            return "other";
    }
}

/**
 * Gets the controller components with ids that match any of the provided
 * keywords (case insensitive).
 * @param  {string[]} keywords    An array of the keywords.
 * @param  {any} webXRController  The XR controller object to examine.
 * @returns any[]  The matching components, in an array.
 */
function getComponents(keywords: string[], webXRController: any): any[] {
    keywords = keywords.map(k => k.toUpperCase());
    let idsToKeep: string[] = webXRController.getComponentIds().filter((componentName: string) => {
        const keywordsLen = keywords.length;
        for (let i = 0; i < keywordsLen; i++) {
            const keyword = keywords[i];
            if (componentName.toUpperCase().indexOf(keyword) !== -1) {
                // Matches.
                return true;
            }
        }
        return false;
    });
    // Make sure unique. See
    // https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript.
    idsToKeep = idsToKeep.sort().filter(function(value, index, array) {
        return (index === 0) || (value !== array[index-1]);
    });

    let components: any[] = idsToKeep.map(n => webXRController.getComponent(n));

    if (components.length === 0) {
        console.log("WARNING: No controller components matched keyword(s). Keywords: " + keywords.join(" ") +  ". Components detected: " + webXRController.getComponentIds().join(" "));
    }

    return components;
}

/**
 * Sets up the trigger button.
 * @param  {*} webVRController The web controller object.
 * @returns void
 */
function setupMotionControllerTrigger(webXRController: any): void {
    let triggerComponents = getComponents(["TRIGGER", "BUTTON", "SQUEEZE"], webXRController);
    const triggerComponentsLen = triggerComponents.length;
    for (let i = 0; i < triggerComponentsLen; i++) {
        const triggerComponent = triggerComponents[i];
        triggerComponent.onButtonStateChangedObservable.add((component /* WebXRControllerComponent */ ) => {
            // check for changes: pressed changed?
            if (component.changes.pressed) {
                if (component.pressed) {
                    if (!switchNavigationControl(webXRController)) {
                        /** @const {number} */
                        const curTime = new Date().getTime();

                        if (curTime - lastTriggerTime > Vars.VR_CONTROLLER_TRIGGER_DELAY_TIME) {
                            // Enough time has passed...
                            lastTriggerTime = curTime;
                            Navigation.actOnStareTrigger();
                        }
                    }
                }
            }
        });
    }
}

function resetPadState(): void {
    padMoveSpeedFactor = 0;
    padRotateSpeedFactor = 0;
    padPressed = false;
}

/**
 * Sets up the VR controller pads.
 * @param  {*} webXRController
 * @returns void
 */
function setupMotionPad(webXRController: any): void {
    let padComponents = getComponents(["PAD", "STICK"], webXRController);
    const padComponentsLen = padComponents.length;
    for (let i = 0; i < padComponentsLen; i++) {
        const padComponent = padComponents[i];
        padComponent.onAxisValueChangedObservable.add((values) => {
            // Will trigger when axes of the touchpad changed. For rapid
            // touchpad changes. Here, it will detect forward and backward
            // refined movement

            if (!switchNavigationControl(webXRController)) {
                // You haven't switched control, so use to navigate.

                // First check if it's right in the middle. That's reset
                // camera rotation zone, so cancel movement.
                if ((Math.abs(values.x) > Vars.VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET) &&
                   (Math.abs(values.y) < Vars.VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET)) {
                    // resetPadState()
                    return;
                }

                // If it's not a press right in the middle, then save the y
                // value for moving foward/backward. Note that you must
                // rescale so that
                /** @type {number} */
                padMoveSpeedFactor = values.y * 3.0;  // TODO: 3.0 chosen by trial and error. Good to make user definable param?

                padPressed = true;
            }
        })

        padComponent.onButtonStateChangedObservable.add((component /* WebXRControllerComponent */ ) => {
            // will trigger when the touchpad is touched or pressed.
            if (!switchNavigationControl(webXRController)) {
                // You haven't switched control, so use to navigate.
                if ((component.changes.pressed) && (component.pressed)) {
                    // Also save the x for turning. But here you can make people
                    // really sick, so only trigger if on outer 4ths of pad (no
                    // accidents).
                    /** @type {number} */
                    padRotateSpeedFactor = component.axes.x;

                    // Scale the rotation speed factor (if button pressed).
                    padRotateSpeedFactor = padRotateSpeedFactor + ((padRotateSpeedFactor > 0) ? -0.5 : 0.5);
                    padRotateSpeedFactor = 2.0 * padRotateSpeedFactor;
                    padPressed = true;
                }
            }
        });
    }

    // Check the pad state at every render and act accordingly.
    Vars.scene.registerBeforeRender(() => {
        if (padPressed) {
            moveCamera();
            rotateCamera();
            resetPadState();  // Sets padPressed = false, amoung other things.
        }
    });
}

/**
 * Checks if navigation control needs to switch to a new controller. If so,
 * performs the switch.
 * @param  {*} webXRController  The webcontroller where some interaction has
 *                              occurred.
 * @returns boolean             True if a switch to a new controller happened.
 *                              False otherwise.
 */
function switchNavigationControl(webXRController: any): boolean {
    if (currentInputSourceType === webXRController.handness) {
        // It hasn't changed, so no need to update anything.
        return false;
    }

    // Switch navigation control to this controller.
    let inputSource = inputSources[getSourceType(webXRController.handness)];

    Points.setRayFuncToCalcNavMeshPos(() => {
        var ray = new BABYLON.Ray(new BABYLON.Vector3(), new BABYLON.Vector3())
        inputSource.getWorldPointerRayToRef(ray)
        return ray;
    });

    currentInputSourceType = webXRController.handness;

    return true;
}

/**
 * Moves the camera slightly forward.
 * @returns void
 */
function moveCamera(): void {
    // No point in proceeding if you don't have a stare point.
    if (Points.curStarePt.equals(Points.pointWayOffScreen)) {
        return;
    }

    // Get the vector form the stare point to the camera. TODO: This is also
    // calculated elsewhere. Could put it in its own function or even cache it
    // for speed.
    const cameraPos = CommonCamera.getCameraPosition();
    const vecStarePtCamera = Points.curStarePt.subtract(cameraPos);
    vecStarePtCamera.normalize();
    const deltaVec = vecStarePtCamera.scale(
        padMoveSpeedFactor * Vars.PAD_MOVE_SPEED * Vars.scene.getAnimationRatio(),
    );

    CommonCamera.setCameraPosition(cameraPos.subtract(deltaVec));
}

/**
 * Rotates the VR camera slightly.
 * @returns void
 */
function rotateCamera(): void {
    if (padRotateSpeedFactor === 0) {
        // Why proceed if there is no rotation?
        return;
    }

    const nowTime = new Date().getTime();
    if (nowTime - lastPadRotationTime < Vars.VR_CONTROLLER_PAD_ROTATION_DELAY_TIME) {
        // Avoid rapid/continuous rotations. I tested this. It makes people
        // want to vomit.
        return;
    }

    lastPadRotationTime = nowTime;

    // Old rotation code that no longer works in WebXR.

    // Get the camera's current rotation.
    // const curAngles = Vars.vrHelper.webVRCamera.rotationQuaternion.toEulerAngles();
    // const curAngles = Vars.scene.activeCamera.rotationQuaternion.toEulerAngles();

    // Rotate it slightly about up axis.
    // curAngles.y += 0.1 * padRotateSpeedFactor * Vars.PAD_MOVE_SPEED * Vars.scene.getAnimationRatio();
    // curAngles.y = curAngles.y + Math.sign(padRotateSpeedFactor) * 0.0625 * Math.PI;

    // Rotates 45 degrees for rapid reorientation.
    // curAngles.y = curAngles.y + Math.sign(padRotateSpeedFactor) * 0.25 * Math.PI;
    // curAngles.z = 0;  // So always horizontal when looking?

    // Set camera to this new rotation.
    // Vars.vrHelper.webVRCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(curAngles);
    // Vars.scene.activeCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(curAngles);

    // Above rotation code produced problems. This seems to work better in WebXR:
    Vars.scene.activeCamera.rotationQuaternion.multiplyInPlace(BABYLON.Quaternion.FromEulerAngles(0, Math.sign(padRotateSpeedFactor) * 0.25 * Math.PI, 0));
}
