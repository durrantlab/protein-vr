// This module handles all things navigation related.

// import * as NavTargetMesh from "./NavTargetMesh";
import * as Navigation from "./Navigation";
import * as Vars from "./Vars";
import * as VRCamera from "./VRCamera";

declare var BABYLON;
declare var jQuery;

enum ClickAction { None, Teleport, GrowHeight }
let clickAction: ClickAction = ClickAction.Teleport;

export enum NavMode { VRWithControllers, VRNoControllers, NoVR }

interface IStarePointInf {
    point: any;  // BABYLON.Vector3
    targetMesh: any;  // The mesh you're staring at.
}

// ***** TODO: WORK ON THIS:
// export let interactingObjs = [];
// export function addInteractingObj(mesh) { interactingObjs.push(mesh); }

let currentlyTeleporting = false;

export let curStarePointInfo: IStarePointInf;
let pointWayOffScreen = new BABYLON.Vector3(-1000, 1000, 1000);

// When using a VR camera, the vrHelper automatically positions
// vrCameraGazeTrackerMesh at the stare location. Putting it here because it's
// navigation relevant.
export let vrCameraGazeTrackerMesh;
export function setVRCameraGazeTrackerMesh(val) { vrCameraGazeTrackerMesh = val; }

export function setup() {
    // Allways collide with a floor mesh, which must be hidden.
    Vars.vars.floorMesh = Vars.vars.scene.getMeshByID(Vars.vars.floorMeshName);
    if (Vars.vars.floorMesh === null) { alert("No mesh named " + Vars.vars.floorMeshName); }
    Vars.vars.floorMesh.checkCollisions = true;
    Vars.vars.floorMesh.visibility = 0;

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
        Vars.vars.navTargetMesh.position = curStarePointInfo.point;  // .clone();
    });
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
export function setStarePointInfo(): IStarePointInf {
    // This function runs with ever turn of the render loop. Set's information
    // about what you're looking/pointing at. Info saved to curStarePointInfo

    switch (Vars.vars.navMode) {
        case NavMode.NoVR:
            // No VR yet. So it's outside the realm of the VRHelper. Calculate
            // it using the looking direction.

            // Get a ray extending out in the direction of the stare.
            const ray = Vars.vars.scene.activeCamera.getForwardRay();

            // Determines where that ray intersects the floor.
            const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
                return (mesh.id === Vars.vars.floorMeshName);  // TODO: Also buttons and proteins.
            });

            // Get the results.
            if (pickingInfo.hit) {
                // It does hit the floor. Return the point.
                curStarePointInfo = {
                    point: pickingInfo.pickedPoint,
                    targetMesh: pickingInfo.pickedMesh,
                };
            } else {
                // It doesn't hit the floor, so return null.
                curStarePointInfo = { point: pointWayOffScreen, targetMesh: null };
            }
            break;
        case NavMode.VRNoControllers:
            // No controllers yet. So tracking the params.navTargetMesh.
            // newLoc = NavTargetMesh.navTrgtMeshBeingTracked.position.clone();
            // dist = BABYLON.Vector3.Distance(Vars.vars.scene.activeCamera.position, newLoc);
            // decideWhichClickAction(dist, newLoc);
            // return newLoc;
            curStarePointInfo = { point: vrCameraGazeTrackerMesh.position, targetMesh: null };
            break;
        case NavMode.VRWithControllers:
            // There are controllers.
            // newLoc = NavTargetMesh.navTrgtMeshBeingTracked.position.clone();
            // newLoc = vrCameraGazeTrackerMesh.position; ** **
            // dist; = BABYLON.Vector3.Distance(Vars.vars.scene.activeCamera.position, newLoc);
            // decideWhichClickAction(dist, newLoc);
            // return newLoc;
            curStarePointInfo = { point: vrCameraGazeTrackerMesh.position, targetMesh: null };
            break;
        default:
            console.log("Error occurred!");
            return;
            break;
    }
}

function cancelStareIfFarAway() {
    let dist = BABYLON.Vector3.Distance(
        Vars.vars.scene.activeCamera.position,
        curStarePointInfo.point,
    );
    if (dist > 5) {
        curStarePointInfo = { point: pointWayOffScreen, targetMesh: null };
    }
}

export function actOnStareTrigger() {
    // Click, space, or something. You need to decide how to act.
    if (curStarePointInfo.targetMesh.name === "ground") {
        // It's the ground, so teleport there.
        teleport();
    }
}

/**
 * Teleport to a given location.
 * @param  {IStarePointInf} starePt The location to transport to (BABYLON.Vector3).
 * @returns void
 */
function teleport(): void {
    if (clickAction === ClickAction.None) {
        // TODO: Maybe buzz the controller or something?
        return;
    }

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

    const newLoc = new BABYLON.Vector3(
        curStarePointInfo.point.x,
        curStarePointInfo.point.y + Vars.vars.cameraHeight,
        curStarePointInfo.point.z,
    );

    console.log("New Loc:", newLoc);
    const activeCamera = Vars.vars.scene.activeCamera;
    const animationCameraTeleportationKeys = [
        {
            frame: 0,
            value: activeCamera.position,
        },
        {
            frame: 5,
            value: newLoc,
        },
    ];
    animationCameraTeleportation.setKeys(animationCameraTeleportationKeys);

    activeCamera.animations = [];
    activeCamera.animations.push(animationCameraTeleportation);

    Vars.vars.scene.beginAnimation(activeCamera, 0, 11, false, 1, () => {
        // Animation finished callback.

        currentlyTeleporting = false;
        VRCamera.vrHelper.gazeTrackerMesh.isVisible = true;
        // Erase animation
        activeCamera.animations = [];
    });
}


function decideWhichClickAction(dist: number, newLoc: any) {

    if ((currentlyTeleporting) || (dist > 5)) {
        // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = false;
        clickAction = ClickAction.None;
    } else {
        // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = true;
        // NavTargetMesh.navTrgtMeshBeingTrackedBigger.position = newLoc;
        clickAction = ClickAction.Teleport;
    }
}
