// This module handles all things navigation related.

// import * as NavTargetMesh from "./NavTargetMesh";
import * as CommonCamera from "./CommonCamera";
import * as Navigation from "./Navigation";
import * as Pickables from "./Pickables";
import * as Vars from "./Vars";
import * as VRCamera from "./VRCamera";

declare var BABYLON;
declare var jQuery;

// enum ClickAction { None, Teleport, GrowHeight }
// let clickAction: ClickAction = ClickAction.Teleport;

export enum NavMode { VRWithControllers, VRNoControllers, NoVR }

// interface IStarePointInf {
//     point: any;  // BABYLON.Vector3
//     targetMesh: any;  // The mesh you're staring at.
// }

// ***** TODO: WORK ON THIS:
// export let interactingObjs = [];
// export function addInteractingObj(mesh) { interactingObjs.push(mesh); }

let currentlyTeleporting = false;

export let curStarePt = new BABYLON.Vector3(0, 0, 0);  // : IStarePointInf;
export function setCurStarePt(pt) {
    curStarePt.copyFrom(pt);
}

export let pointWayOffScreen = new BABYLON.Vector3(-1000, 1000, 1000);

// When using a VR camera, the vrHelper automatically positions
// vrCameraGazeTrackerMesh at the stare location. Putting it here because it's
// navigation relevant.
// export let vrCameraGazeTrackerMesh;
// export function setVRCameraGazeTrackerMesh(val) { vrCameraGazeTrackerMesh = val; }

export function setup() {
    // Allways collide with a floor mesh, which must be hidden.
    Vars.vars.groundMesh = Vars.vars.scene.getMeshByID(Vars.vars.groundMeshName);
    if (Vars.vars.groundMesh === null) { alert("No mesh named " + Vars.vars.groundMeshName); }
    Vars.vars.groundMesh.checkCollisions = true;
    Vars.vars.groundMesh.visibility = 0;

    // Initially, no VR.
    Vars.vars.navMode = Navigation.NavMode.NoVR;
    // Vars.vars.navMode = Navigation.NavMode.VRNoControllers;

    // Setup triggers.
    setupTriggers();

    // Constantly update the stare point info. Also, position the tracking
    // mesh.
    Vars.vars.scene.registerBeforeRender(() => {
        setStarePointInfo();
        cancelStareIfFarAway();
        Vars.vars.navTargetMesh.position.copyFrom(curStarePt);
        // fixPointHeightAboveGround();

        // if (Pickables.curPickedMesh === undefined) {
            // console.log(undefined);
        // } else {
            // console.log(Pickables.curPickedMesh.name);
            // console.log(curStarePt, Vars.vars.navTargetMesh.position.clone());
        // }
    });

    // setInterval(() => {
        // console.log(curStarePt, Vars.vars.navTargetMesh.position.clone(), vrCameraGazeTrackerMesh.position);
        // console.log(Pickables.curPickedMesh.name);
    // }, 2000);
}

function setupTriggers() {
    // Space always triggers
    jQuery("body").keypress((e) => {
        if (e.charCode === 32) {
            // Space bar
            actOnStareTrigger();
        }
    });

    // TODO: Click should trigger too?
}

/**
 * Gets the point on the floor where the user is looking (or pointing with
 * controllers).
 * @returns IStarePointInf The point and target. Target is null if if not
 *                         looking/pointing at anything.
 */
export function setStarePointInfo() {
    // This function runs with ever turn of the render loop. Set's information
    // about what you're looking/pointing at. Info saved to curStarePt
    let ray;

    if (Vars.vars.navMode === NavMode.NoVR) {
        // No VR yet. So it's outside the realm of the VRHelper. Calculate
        // it using the looking direction.

        // Get a ray extending out in the direction of the stare.
        ray = Vars.vars.scene.activeCamera.getForwardRay();
    } else if ((Vars.vars.navMode === NavMode.VRNoControllers) ||
               (Vars.vars.navMode === NavMode.VRWithControllers)) {
        // No controllers yet. So tracking the params.navTargetMesh.
        // newLoc = NavTargetMesh.navTrgtMeshBeingTracked.position.clone();
        // dist = BABYLON.Vector3.Distance(getCameraPosition(), newLoc);
        // decideWhichClickAction(dist, newLoc);
        // return newLoc;

        // Find the valid gazetracker mesh.
        let gazeTrackerMesh;
        if (Vars.vars.navMode === NavMode.VRWithControllers) {
            gazeTrackerMesh = VRCamera.vrHelper.rightControllerGazeTrackerMesh;
            if (!gazeTrackerMesh) { gazeTrackerMesh = VRCamera.vrHelper.leftControllerGazeTrackerMesh; }
        } else if (Vars.vars.navMode === NavMode.VRNoControllers) {
            gazeTrackerMesh = VRCamera.vrHelper.gazeTrackerMesh;
        }
        if (!gazeTrackerMesh) {
            console.log("error!");
            return;
        }

        if (!gazeTrackerMesh.isVisible) {
            setCurStarePt(pointWayOffScreen);
        } else {
            setCurStarePt(gazeTrackerMesh.absolutePosition);
        }

        // Construct a ray from the camera to the stare obj
        let camPos = CommonCamera.getCameraPosition();
        ray = new BABYLON.Ray(camPos, curStarePt.subtract(camPos));
    } else {
        console.log("Unexpected error.");
    }

    setPickPointAndObjInScene(ray);
}

function setPickPointAndObjInScene(ray, updatePos = true) {
    // Determines where that ray intersects the floor.
    const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
        return Pickables.checkIfMeshPickable(mesh);
    });

    // Get the results.
    // if (pickingInfo.pickedMesh) {
        // console.log(pickingInfo.pickedMesh.name);
    // }

    if (pickingInfo.hit) {
        // It does hit the floor. Return the point.
        if (updatePos) { setCurStarePt(pickingInfo.pickedPoint); }
        Pickables.setCurPickedMesh(pickingInfo.pickedMesh);
    } else {
        // It doesn't hit the floor, so return null.
        setCurStarePt(pointWayOffScreen);
        Pickables.setCurPickedMesh(undefined);
    }
}

function cancelStareIfFarAway() {
    if (curStarePt === undefined) {
        setCurStarePt(pointWayOffScreen);
        Pickables.setCurPickedMesh(undefined);
    } else {
        let dist = BABYLON.Vector3.Distance(
            CommonCamera.getCameraPosition(), curStarePt,
        );
        if (dist > 10) {
            setCurStarePt(pointWayOffScreen);
            Pickables.setCurPickedMesh(undefined);
        }
    }
}

export function actOnStareTrigger() {
    // Click, space, or something. You need to decide how to act.
    switch (Pickables.getCategoryOfCurMesh()) {
        case Pickables.PickableCategory.Ground:
            // It's the ground, so teleport there.
            teleport();
            break;
        case Pickables.PickableCategory.Molecule:
            // It's a molecule, so increase the height.
            break;
        default:
            // None.
            break;
    }
}

/**
 * Teleport to a given location.
 * @param  {IStarePointInf} starePt The location to transport to (BABYLON.Vector3).
 * @returns void
 */
function teleport(newLoc = undefined): void {
    currentlyTeleporting = true;

    // Hide the bigger nav mesh. It will appear again elsewhere.
    // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = false;
    VRCamera.vrHelper.gazeTrackerMesh.isVisible = false;

    // Animate the transition to the new location.
    const animationCameraTeleportation = new BABYLON.Animation(
        "animationCameraTeleportation", "position", 90,
        BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
        BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT,
    );

    // Get the new location.
    if (newLoc === undefined) {
        newLoc = new BABYLON.Vector3(
            curStarePt.x,
            curStarePt.y + Vars.vars.cameraHeight,
            curStarePt.z,
        );
    }

    // Correct if VR camera.
    newLoc = newLoc.subtract(
        CommonCamera.getVecFromEyeToCamera(),
    );


    // Adjust for eye-to-camera distance if VR.
    // newLoc.subtractInPlace(CommonCamera.getVecFromEyeToCamera());
    // newLoc.addInPlace(CommonCamera.getVecFromEyeToCamera());

    // newLoc = fixPointHeightAboveGround(newLoc);

    // console.log(curStarePt, newLoc);

    // Vars.vars.scene.getCameraPosition() = newLoc;
    // getCameraPosition() = newLoc.clone();

    // CommonCamera.setCameraPosition(newLoc);

    // return;

    // Animate to new location.
    let animationSteps = 11;
    const startLoc = CommonCamera.getCameraPosition();
    const animationCameraTeleportationKeys = [
        { frame: 0, value: startLoc },
        { frame: animationSteps, value: newLoc },
    ];
    animationCameraTeleportation.setKeys(animationCameraTeleportationKeys);

    const activeCamera = Vars.vars.scene.activeCamera;
    activeCamera.animations = [];
    activeCamera.animations.push(animationCameraTeleportation);

    Vars.vars.scene.beginAnimation(activeCamera, 0, animationSteps, false, 1, () => {
        // Animation finished callback.

        currentlyTeleporting = false;
        VRCamera.vrHelper.gazeTrackerMesh.isVisible = true;
        // Erase animation
        activeCamera.animations = [];
    });
}

// function decideWhichClickAction(dist: number, newLoc: any) {

//     if ((currentlyTeleporting) || (dist > 5)) {
//         // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = false;
//         clickAction = ClickAction.None;
//     } else {
//         // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = true;
//         // NavTargetMesh.navTrgtMeshBeingTrackedBigger.position = newLoc;
//         clickAction = ClickAction.Teleport;
//     }
// }

/**
 * A function to make sure the camera is always over the floor mesh.
 */
// function fixPointHeightAboveGround(pt) {
//     // Don't check if recently checked.
//     // const nowTime = new Date().getTime();
//     // if (nowTime - timeOfLastCameraPosCheck < 100) {
//     //     return;
//     // }
//     // timeOfLastCameraPosCheck = nowTime;

//     // Every once in a while, check if you're over the floor mesh. Cast a ray
//     // directly down from the camera.
//     // const activeCameraPos = Navigation.getCameraPosition();
//     // const ray = new BABYLON.Ray(activeCameraPos, new BABYLON.Vector3(0, -1, 0), 50);
//     const ray = new BABYLON.Ray(pt, new BABYLON.Vector3(0, -1, 0), 50);

//     // Look for hits on the ground.
//     const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
//         return (mesh.id === Vars.vars.groundMesh.id);
//     });

//     // If there's a hit on the ground...
//     if (pickingInfo.hit) {
//         // Calculate the distance.
//         // let dist = BABYLON.Vector3.Distance();
//         let deltaHeight = pickingInfo.distance - Vars.vars.cameraHeight;
//         let newPt = pt.clone();
//         newPt.y = newPt.y - deltaHeight;
//         // Vars.vars.scene.activeCamera.position.y = Vars.vars.scene.activeCamera.position.y - deltaHeight;
//     }

//     return pt;

//     // Check if the ray hit the floor.
//     // if (ptProjectedToGround(activeCameraPos).hit) {
//         // It hit the floor. Save the current camera coordiantes.
//         // lastCameraPosAboveGroundMesh.copyFrom(activeCameraPos);
//     // }
//     // else {
//         // TODO: VR camera?
//         // Vars.vars.scene.activeCamera.position.copyFrom(lastCameraPosAboveGroundMesh);
//     // }
// }

// function ptProjectedToGround(pt) {
//     const ray = new BABYLON.Ray(
//         pt, new BABYLON.Vector3(0, -1, 0), 50,
//     );
//     const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
//         return (mesh.id === Vars.vars.groundMesh.id);
//     });
//     return pickingInfo;
// }
