// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


// This module handles all things navigation related.

import * as CommonCamera from "../Cameras/CommonCamera";
import * as NonVRCamera from "../Cameras/NonVRCamera";
import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars/Vars";
import * as Navigation from "./Navigation";
import * as Pickables from "./Pickables";
import * as Points from "./Points";
import * as UrlVars from "../Vars/UrlVars";
import * as Menu3D from "../UI/Menus/Menu3D/Menu3D";
import * as ModalComponent from "../UI/Vue/Components/OpenPopup/ModalComponent";
import * as Arrow from "../Navigation/Arrow";
import * as PromiseStore from "../PromiseStore";
import * as VRCamera from "../Cameras/VRCamera";

declare var BABYLON: any;
declare var jQuery: any;

export const enum NavMode {
    // Note: const enum needed for closure-compiler compatibility.
    VRWithControllers = 1,
    VRNoControllers = 2,
    NoVR = 3,
}

let currentlyTeleporting = false;

/**
 * Setup the navigation system.
 * @returns void
 */
export function runSetupNavigation(): void {
    PromiseStore.setPromise(
        "SetupNavigation", ["LoadBabylonScene"],
        (resolve) => {
            if (UrlVars.checkIfWebRTCInUrl()) {
                // Initially, no VR.
                Vars.vrVars.navMode = Navigation.NavMode.NoVR;

                // Also, make sure ground is not visible.
                const groundMesh = Vars.scene.getMeshByID("ground");
                groundMesh.visibility = 0;

                // Also hide navigation sphere.
                Vars.vrVars.navTargetMesh.isVisible = false;

                resolve();
                return;
            }

            // Start loading the floor arrow.
            Arrow.loadArrow();

            // Allways collide with a floor mesh.
            Vars.vrVars.groundMesh = Vars.scene.getMeshByID("ground");
            if (Vars.vrVars.groundMesh === null) { alert("No mesh named ground"); }
            Vars.vrVars.groundMesh.checkCollisions = true;

            // The ground should generally be hidden. There's a chance it could be
            // turned into glass too. See Mols.
            Vars.vrVars.groundMesh.visibility = 0;

            Optimizations.optimizeMeshPicking(Vars.vrVars.groundMesh);
            Pickables.makeMeshMouseClickable({
                callBack: actOnStareTrigger,
                mesh: Vars.vrVars.groundMesh,
            });

            // Initially, no VR.
            Vars.vrVars.navMode = Navigation.NavMode.NoVR;

            // Setup triggers.
            setupTriggers();

            // Keep track up critical points in the scene (like stare points).
            Points.setup();

            // Create a div to intercept clicks if needed. Add clear div over canvas.
            setupCaptureMouseClicksOutsideBabylon();

            // Constantly monitor the position of the camera. If it's no longer over
            // the floor, move it back to its previous position.
            keepCameraOverFloor();

            resolve();
        }
    )
}

/** @type {*} */
let lastCameraPt: any;

/** @type {string} */
let lastCameraName = "";

/**
 * Check and make sure the camera is over the ground. If not, move it back so
 * it is over the ground.
 * @returns void
 */
function keepCameraOverFloor(): void {
    lastCameraPt = CommonCamera.getCameraPosition();
    Vars.scene.registerBeforeRender(() => {
        const cameraPt = CommonCamera.getCameraPosition();  // cloned pt.
        const groundPointBelowCamera = Points.groundPointPickingInfo(cameraPt);
        if ((groundPointBelowCamera.pickedMesh === null) && (lastCameraName === Vars.scene.activeCamera.id)) {
            // You're not above the ground! This shouldn't happen, but it can
            // occasionally. Return the camera to its previous position. One
            // example is if you're using the controllers on a HTC vive to
            // navigate (forward/backward).

            CommonCamera.setCameraPosition(lastCameraPt);
        } else {
            lastCameraPt = cameraPt;
            lastCameraName = Vars.scene.activeCamera.id;
        }
    });
}

/**
 * Sets up additional triggers.
 * @returns void
 */
function setupTriggers(): void {
    // Space always triggers
    const body = jQuery("body");
    body.keydown((e: any) => {
        if (ModalComponent.modalCurrentlyOpen === false) {
            let charCode = (typeof e.which == "undefined") ? e.keyCode : e.which;
            if (charCode === 32) {
                // Space bar
                actOnStareTrigger();
            } else if (charCode === 77) { // 109?
                // M (open 3d menu).
                Menu3D.openMainMenuFloorButton.toggled();
            } else if (charCode === 27) {
                VRCamera.exitVRAndFS();
            }
        }
    });

    // Mouse clicks are handled elsewhere...
}

let lastTrigger = 0;

/**
 * Triggers an action, based on the mesh you're currently looking at.
 * @returns void
 */
export function actOnStareTrigger(): void {
    if (UrlVars.checkIfWebRTCInUrl()) {
        // If in leader mode, don't ever trigger.
        return;
    }

    // There is a refractory period to prevent rapid trigger fires.
    const curTime = new Date().getTime();
    if (curTime - lastTrigger < 250) {
        return;
    } else {
        lastTrigger = curTime;
    }

    // Click, space, or something. You need to decide how to act.
    switch (Pickables.getCategoryOfCurMesh()) {
        case Pickables.PickableCategory.Ground:
            // It's the ground, so teleport there.
            teleport();
            break;
        case Pickables.PickableCategory.Molecule:
            // It's a molecule, so increase the height.
            grow();
            break;
        case Pickables.PickableCategory.Button:
            // It's a button. Click function is attached to the mesh (see
            // GUI.ts).
            Pickables.curPickedMesh.clickFunc();
        default:
            // None.
            break;
    }
}

/**
 * Teleport to a given location.
 * @param  {*}         [newLoc=undefined] The new location. Uses stare point
 *                                        if no location given.
 * @param  {Function}  [callBack=]        The callback function once teleport
 *                                        is done.
 * @returns void
 */
function teleport(newLoc: any = undefined, callBack: any = undefined): void {
    currentlyTeleporting = true;

    if (callBack === undefined) {
        callBack = () => { return; };
    }

    // Hide the bigger nav mesh. It will appear again elsewhere.
    Vars.vrVars.navTargetMesh.isVisible = false;

    // Animate the transition to the new location.
    /** @const {*} */
    const animationCameraTeleportation = new BABYLON.Animation(
        "animationCameraTeleportation", "position", 90,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    // The start location.
    let startLoc = CommonCamera.getCameraPosition();

    // Get the new location.
    if (newLoc === undefined) {
        // If it's not defined, use the current stare point.
        newLoc = new BABYLON.Vector3(
            Points.curStarePt.x,
            Points.curStarePt.y + Vars.cameraHeight,
            Points.curStarePt.z,
        );
    }

    // Correct if VR camera.
    const eyeToCamVec = CommonCamera.getVecFromEyeToCamera();
    newLoc = newLoc.subtract(eyeToCamVec);
    startLoc = startLoc.subtract(eyeToCamVec);

    // Animate to new location.
    /** @const {Array<Object<string, *>>} */
    const animationCameraTeleportationKeys = [
        { "frame": 0, "value": startLoc },
        { "frame": Vars.TRANSPORT_DURATION, "value": newLoc },
    ];
    animationCameraTeleportation.setKeys(animationCameraTeleportationKeys);

    /** @const {*} */
    const activeCamera = Vars.scene.activeCamera;

    activeCamera.animations = [];
    activeCamera.animations.push(animationCameraTeleportation);

    Vars.scene.beginAnimation(activeCamera, 0, Vars.TRANSPORT_DURATION, false, 1, () => {
        // Animation finished callback.
        currentlyTeleporting = false;
        Vars.vrVars.navTargetMesh.isVisible = true;

        // Erase animation
        activeCamera.animations = [];

        callBack();
    });
}

/**
 * Teleport and grow. Fires if you click on a molecular mesh.
 * @returns void
 */
function grow(): void {
    const ptBelowStarePt = Points.groundPointBelowStarePt;

    // Get the vector form the stare point to the camera.
    const cameraPos = CommonCamera.getCameraPosition();
    const vecStarePtCamera = Points.curStarePt.subtract(cameraPos);

    /** @type {number} */
    const vecStarePtDist = vecStarePtCamera.length();

    let newPt;
    if (0.1 * vecStarePtDist < Vars.MIN_DIST_TO_MOL_ON_TELEPORT) {
        // Teleporting 90% of the way would put you too close to the target.
        newPt = Points.curStarePt.subtract(
            vecStarePtCamera.normalize().scale(
                Vars.MIN_DIST_TO_MOL_ON_TELEPORT,
            ),
        );
    } else if (0.1 * vecStarePtDist > Vars.MAX_DIST_TO_MOL_ON_TELEPORT) {
        // Teleporting 90% of the way would put you too far from the target.
        newPt = Points.curStarePt.subtract(
            vecStarePtCamera.normalize().scale(
                Vars.MAX_DIST_TO_MOL_ON_TELEPORT,
            ),
        );
    } else if (0.1 * vecStarePtDist < Vars.MAX_DIST_TO_MOL_ON_TELEPORT) {
        // Teleporting 90% of the way would put you in the sweet spot. Do
        // that.
        newPt = cameraPos.add(
            vecStarePtCamera.scale(0.9),
        );
    }

    // Now tweak the height to match the point exactly (not on the line
    // between camera and point).
    newPt.y = Points.curStarePt.y;

    // You need to make sure the new point isn't within the button sphere at
    // your feet. If not, you could get trapped.
    if (newPt.y - ptBelowStarePt.y < 0.5 * Vars.BUTTON_SPHERE_RADIUS + 0.1) {
        newPt.y = ptBelowStarePt.y + 0.5 * Vars.BUTTON_SPHERE_RADIUS + 0.1;
    }

    // Set the new height. 0.01 is important so elipse doesn't get caught on
    // new ground.
    Vars.setCameraHeight(Points.curStarePt.y - ptBelowStarePt.y);

    teleport(newPt, () => {
        // Make sure the collision elipsoid surrounding the non-VR camera
        // matches the new height.
        NonVRCamera.setCameraElipsoid();
    });
}

let captureMouseClicksDiv: any = undefined;
let currentlyCapturingMouseClicks = false;

/**
 * Setup the ability to capture clicks.
 * @returns void
 */
function setupCaptureMouseClicksOutsideBabylon(): void {
    // Unfortunately, when you click on phones it takes away control from the
    // orientation sensor. Babylon.js claims to have fixed this, but I don't
    // think it is fixed: https://github.com/BabylonJS/Babylon.js/pull/6042
    // I'm going to detect if it's currently reading from the orientation
    // sensor and throw up a div to capture clicks if it is. A hackish
    // solution that works.

    // Setup div to intercept clicks if needed. Add clear div over canvas.
    captureMouseClicksDiv = jQuery("#capture-clicks");

    // Make it clickable.
    captureMouseClicksDiv.click(() => {
        // console.log("clicked!");
        actOnStareTrigger();
    });

    // Check periodically to see if a device orientation sensor is every
    // picked up. If so, make the window clickable.
    setInterval(checkCaptureMouseClicksOutsideBabylon, 500);
}

/**
 * Checks if you should currently be capturing clicks. TODO: Should you be
 * checking this with every render? I don't know that it can change, so maybe
 * you just need to check it once? Maybe could be in setTimeout.
 * @returns void
 */
function checkCaptureMouseClicksOutsideBabylon(): void {
    if (currentlyCapturingMouseClicks === true) {
        // Once you've detected a device orientation sensor, never "undetect"
        // it. This makes it so the mouse teleports, rather than rotating via
        // drag and drop. Because the rotation is now handled by the device
        // orientations sensor.
        return;
    }

    const deviceOrientation = Vars.scene.activeCamera.inputs.attached.deviceOrientation;
    let deviceBeingOriented;

    if (!deviceOrientation) {
        // On htc vive, deviceOrientation does not exist.
        deviceBeingOriented = false;
    } else {
        // Check other devices (whether in browser or in cardboard, etc).
        deviceBeingOriented = (deviceOrientation._alpha !== 0) ||
                              (deviceOrientation._beta !== 0) ||
                              (deviceOrientation._gamma !== 0);
    }

    if (deviceBeingOriented && !currentlyCapturingMouseClicks) {
        currentlyCapturingMouseClicks = true;
        captureMouseClicksDiv.show();
        console.log("Device orientation sensor detected...");
    } else if (!deviceBeingOriented && currentlyCapturingMouseClicks) {
        currentlyCapturingMouseClicks = false;
        captureMouseClicksDiv.hide();
    } else {
        // console.log("confused");
    }
}

// NOTE THAT THE TRACKPAD-CONTROLED FORWARD MOVEMENTS AND ROTATIONS USED IN XR
// MODE ARE LOCATED IN VRControllers.ts.
