// This module handles all things navigation related.

// import * as NavTargetMesh from "./NavTargetMesh";
// import { jQuery } from "../jQuery";
import * as CommonCamera from "../Cameras/CommonCamera";
import * as NonVRCamera from "../Cameras/NonVRCamera";
import * as VRCamera from "../Cameras/VRCamera";
import * as Vars from "../Vars";
import * as Navigation from "./Navigation";
import * as Optimizations from "./Optimizations";
import * as Pickables from "./Pickables";
import * as Points from "./Points";

declare var BABYLON;
declare var jQuery;

export const enum NavMode {
    // Note: const enum needed for closure-compiler compatibility.
    VRWithControllers = 1,
    VRNoControllers = 2,
    NoVR = 3,
}

// ***** TODO: WORK ON THIS:
// export let interactingObjs = [];
// export function addInteractingObj(mesh) { interactingObjs.push(mesh); }

let currentlyTeleporting = false;

/**
 * Setup the navigation system.
 * @returns void
 */
export function setup(): void {
    // Allways collide with a floor mesh.
    Vars.vrVars.groundMesh = Vars.scene.getMeshByID(Vars.vrVars.groundMeshName);
    if (Vars.vrVars.groundMesh === null) { alert("No mesh named " + Vars.vrVars.groundMeshName); }
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
}

let lastCameraPt;

/**
 * Check and make sure the camera is over the ground. If not, move it back so
 * it is over the ground.
 * @returns void
 */
function keepCameraOverFloor(): void {
    // lastCameraPt = Vars.scene.activeCamera.position.clone();
    lastCameraPt = CommonCamera.getCameraPosition();
    Vars.scene.registerBeforeRender(() => {
        // let cameraPt = Vars.scene.activeCamera.position.clone();
        let cameraPt = CommonCamera.getCameraPosition();  // cloned pt.
        let groundPointBelowCamera = Points.groundPointPickingInfo(cameraPt);
        if (groundPointBelowCamera.pickedMesh === null) {
            // You're not above the ground! This shouldn't happen, but it can
            // occasionally. Return the camera to its previous position. One
            // example is if you're using the controllers on a HTC vive to
            // navigate (forward/backward).

            // console.log("Reverting camera position..");
            // Vars.scene.activeCamera.position = lastCameraPt;
            CommonCamera.setCameraPosition(lastCameraPt);
        } else {
            lastCameraPt = cameraPt;
        }
        // console.log(groundPointBelowCamera);
    });
}

/**
 * Sets up additional triggers.
 * @returns void
 */
function setupTriggers(): void {
    // Space always triggers
    let body = jQuery("body");
    body.keypress((e) => {
        if (e.charCode === 32) {
            // Space bar
            actOnStareTrigger();
        }
    });

    // Mouse clicks are handled elsewhere...
}

let lastTrigger: number = 0;

/**
 * Triggers an action, based on the mesh you're currently looking at.
 * @returns void
 */
export function actOnStareTrigger(): void {
    // There is a refractory period to prevent rapid trigger fires.
    let curTime = new Date().getTime();
    if (curTime - lastTrigger < 250) {
        return;
    } else {
        lastTrigger = curTime;
    }

    console.log("hi");

    // Click, space, or something. You need to decide how to act.
    switch (Pickables.getCategoryOfCurMesh()) {
        case Pickables.PickableCategory.Ground:
            // It's the ground, so teleport there.
            console.log("teleport");
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
 * @param  {*}          [newLoc=undefined] The new location. Uses stare point
 *                                         if no location given.
 * @param  {function()} [callBack=]        The callback function once teleport
 *                                         is done.
 * @returns void
 */
function teleport(newLoc = undefined, callBack = undefined): void {
    currentlyTeleporting = true;

    if (callBack === undefined) {
        callBack = () => { return; };
    }

    // Hide the bigger nav mesh. It will appear again elsewhere.
    Vars.vrHelper.gazeTrackerMesh.isVisible = false;

    // Animate the transition to the new location.
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
    let eyeToCamVec = CommonCamera.getVecFromEyeToCamera();
    newLoc = newLoc.subtract(eyeToCamVec);
    startLoc = startLoc.subtract(eyeToCamVec);

    // Animate to new location.
    const animationCameraTeleportationKeys = [
        { "frame": 0, "value": startLoc },
        { "frame": Vars.TRANSPORT_DURATION, "value": newLoc },
    ];
    animationCameraTeleportation.setKeys(animationCameraTeleportationKeys);

    const activeCamera = Vars.scene.activeCamera;
    activeCamera.animations = [];
    activeCamera.animations.push(animationCameraTeleportation);

    Vars.scene.beginAnimation(activeCamera, 0, Vars.TRANSPORT_DURATION, false, 1, () => {
        // Animation finished callback.
        currentlyTeleporting = false;
        Vars.vrHelper.gazeTrackerMesh.isVisible = true;

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
    // let ptBelowStarePt = Points.groundPointPickingInfo(Points.curStarePt).pickedPoint;
    let ptBelowStarePt = Points.groundPointBelowStarePt;

    // Get the vector form the stare point to the camera.
    let cameraPos = CommonCamera.getCameraPosition();
    let vecStarePtCamera = Points.curStarePt.subtract(cameraPos);
    let vecStarePtDist = vecStarePtCamera.length();

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

let captureMouseClicksDiv = undefined;
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
    // captureMouseClicksDiv = jQuery("#renderCanvas");

    // Make it clickable.
    captureMouseClicksDiv.click(() => {
        console.log("clicked!");
        actOnStareTrigger();
    });
    // captureMouseClicksDiv.on("pointerdown", () => {
    //     alert("hello!");
    // });

    Vars.scene.registerBeforeRender(() => {
        checkCaptureMouseClicksOutsideBabylon();
    });
}

/**
 * Checks if you should currently be capturing clicks. TODO: Should you be
 * checking this with every render? I don't know that it can change, so maybe
 * you just need to check it once?
 * @returns void
 */
function checkCaptureMouseClicksOutsideBabylon(): void {
    let deviceOrientation = Vars.scene.activeCamera.inputs.attached.deviceOrientation;
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
        // console.log("show");
    } else if (!deviceBeingOriented && currentlyCapturingMouseClicks) {
        currentlyCapturingMouseClicks = false;
        captureMouseClicksDiv.hide();
        // console.log("hide");
    } else {
        // console.log("confused");
        // console.log(deviceBeingOriented);
        // console.log(currentlyCapturingMouseClicks);
    }
}
