import * as Navigation from "../Navigation/Navigation";
import * as Pickables from "../Navigation/Pickables";
import * as Points from "../Navigation/Points";
import * as Vars from "../Vars/Vars";
import * as CommonCamera from "./CommonCamera";
import * as VRCamera from "./VRCamera";

declare var BABYLON: any;

let lastTriggerTime = 0;
let lastPadRotationTime = 0;

let padMoveSpeedFactor = 0.0;
let padRotateSpeedFactor = 0.0;
let padPressed = false;

/**
 * Sets up the enter and exit functions when controllers load. No unload
 * function, though I'd like one.
 * @returns void
 */
export function setup(): void {
    // Put a cube around the camera. This is to receive picker for pad-based
    // navigation, even if you're not pointing at a protein.
    Pickables.makePadNavigationSphereAroundCamera();

    // Use various controller detected functions to cover your bases...

    let onControllerLoaded = (webVRController: any) => {
        Vars.vrVars.navMode = Navigation.NavMode.VRWithControllers;
        VRCamera.setupGazeTracker();
        setupTrigger(webVRController);
        setupPad(webVRController);
    }

    // onControllersAttachedObservable doesn't work. I'd prefer that one...
    Vars.vrHelper.webVRCamera.onControllerMeshLoadedObservable.add((webVRController: any) => {
        onControllerLoaded(webVRController);
    });

    Vars.vrHelper.onControllerMeshLoaded.add((webVRController: any) => {
        onControllerLoaded(webVRController);
    });

    // Doesn't appear to be a detach function...
}

/**
 * Sets up the trigger button.
 * @param  {*} webVRController The web controller object.
 * @returns void
 */
function setupTrigger(webVRController: any): void {
    // Monitor for triggers. Only allow one to fire every once in a while.
    // When it does, teleport to that location.
    webVRController.onTriggerStateChangedObservable.add((state: any) => {
        if (!state["pressed"]) {
            // Only trigger if it's pressed.
            return;
        }

        /** @const {number} */
        const curTime = new Date().getTime();

        if (curTime - lastTriggerTime > Vars.VR_CONTROLLER_TRIGGER_DELAY_TIME) {
            // Enough time has passed...
            lastTriggerTime = curTime;
            Navigation.actOnStareTrigger();
        }
    });
}

/**
 * Sets up the VR controller pads.
 * @param  {*} webVRController
 * @returns void
 */
function setupPad(webVRController: any): void {
    // Also allow navigation via the pad (non teleporting).
    webVRController.onPadStateChangedObservable.add((state: any) => {
        padPressed = state["pressed"];

        if ((padPressed) &&
            (Math.abs(padMoveSpeedFactor) < Vars.VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET) &&
            (Math.abs(padRotateSpeedFactor) < Vars.VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET)) {
            console.log("Would reset camera view if you didn't get an error below...");
            return;
        }
    });

    webVRController.onPadValuesChangedObservable.add((state: any) => {
        // If it's not a press right in the middle, then save the y value for
        // moving foward/backward.
        /** @type {number} */
        padMoveSpeedFactor = state["y"];

        // Also save the x for turning. But here you can make people really
        // sick, so only trigger if on outer 4ths of pad (no accidents).
        /** @type {number} */
        padRotateSpeedFactor = state["x"];

        // First check if it's right in the middle. That's reset camera zone,
        // so cancel.
        if ((Math.abs(padRotateSpeedFactor) < Vars.VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET) &&
            (Math.abs(padMoveSpeedFactor) < Vars.VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET)) {

            padMoveSpeedFactor = 0;
            padRotateSpeedFactor = 0;
            return;
        }

        // Unless you're pretty far to the left or right, don't count it.
        if (Math.abs(padRotateSpeedFactor) < 0.5) {
            padRotateSpeedFactor = 0.0;
        } else {
            // Scale the rotation speed factor
            padRotateSpeedFactor = padRotateSpeedFactor + ((padRotateSpeedFactor > 0) ? -0.5 : 0.5);
            padRotateSpeedFactor = 2.0 * padRotateSpeedFactor;
        }
    });

    // Check the pad state at every render and act accordingly.
    Vars.scene.registerBeforeRender(() => {
        if (padPressed) {
            moveCamera();
            rotateCamera();
        }
    });
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
    let cameraPos = CommonCamera.getCameraPosition();
    let vecStarePtCamera = Points.curStarePt.subtract(cameraPos);
    vecStarePtCamera.normalize();
    let deltaVec = vecStarePtCamera.scale(
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

    let nowTime = new Date().getTime();
    if (nowTime - lastPadRotationTime < Vars.VR_CONTROLLER_PAD_ROTATION_DELAY_TIME) {
        // Avoid rapid/continuous rotations. I tested this. It makes people
        // want to vomit.
        return;
    }

    lastPadRotationTime = nowTime;

    // Get the camera's current rotation.
    let curAngles = Vars.vrHelper.webVRCamera.rotationQuaternion.toEulerAngles();

    // Rotate it slightly about up axis.
    // curAngles.y += 0.1 * padRotateSpeedFactor * Vars.PAD_MOVE_SPEED * Vars.scene.getAnimationRatio();
    // curAngles.y = curAngles.y + Math.sign(padRotateSpeedFactor) * 0.0625 * Math.PI;

    // Rotates 45 degrees for rapid reorientation.
    curAngles.y = curAngles.y + Math.sign(padRotateSpeedFactor) * 0.25 * Math.PI;

    // Set camera to this new rotation.
    Vars.vrHelper.webVRCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(curAngles);
}
