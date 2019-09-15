// This module has functions for storing various important points in the
// scene. Note that the camera location is in CommonCamera, not here.

import * as CommonCamera from "../Cameras/CommonCamera";
import * as Vars from "../Vars/Vars";
import * as Navigation from "./Navigation";
import * as Pickables from "./Pickables";
import * as Menu3D from "../UI/Menu3D/Menu3D";

declare var BABYLON: any;

export let pointWayOffScreen = new BABYLON.Vector3(-1000, 1000, 1000);
export let groundPointBelowCamera = new BABYLON.Vector3(0, 0, 0);
export let groundPointBelowStarePt = new BABYLON.Vector3(0, 0, 0);
export let curStarePt = new BABYLON.Vector3(0, 0, 0);

/**
 * Sets the curStarePt variable externally.
 * @param {*} pt
 * @returns void
 */
export function setCurStarePt(pt: any): void {
    curStarePt.copyFrom(pt);
}

/**
 * Sets up the key points detection. Stare point, point below the camera, etc.
 * @returns void
 */
export function setup(): void {
    // Hide menu button if clsoer than this
    const CLOSE_TO_GROUND_DIST = Vars.BUTTON_SPHERE_RADIUS * 1.5;

    // Constantly update the stare point info. Also, position the tracking
    // mesh.
    Vars.scene.registerBeforeRender(() => {
        // Get the stare point. Here because it should be updated with every
        // frame.
        setStarePointInfo();
        cancelStareIfFarAway();
        Vars.vrVars.navTargetMesh.position.copyFrom(curStarePt);

        // Hide Vars.vrVars.navTargetMesh if it's on padNavSphereAroundCamera.
        if (Pickables.curPickedMesh !== undefined) {
            Vars.vrVars.navTargetMesh.isVisible = Pickables.curPickedMesh !== Pickables.padNavSphereAroundCamera;
        }

        // Also the point on the ground below the camera should be updated
        // every turn of the render loop (to position the menu button).
        const camPos = CommonCamera.getCameraPosition();
        let pickedGroundPt = groundPointPickingInfo(camPos).pickedPoint;
        if (pickedGroundPt) {
            groundPointBelowCamera = pickedGroundPt;

            // If the pickedgroundPt is close, hide the navigation menu button (to
            // prevent user from getting trapped).
            const heightOffGround = camPos.y - pickedGroundPt.y;
            if (heightOffGround < CLOSE_TO_GROUND_DIST) {
                Menu3D.openMainMenuFloorButton.button.isVisible = false;
                Menu3D.openMainMenuFloorButton.containingMesh.isVisible = false;
            } else {
                Menu3D.openMainMenuFloorButton.button.isVisible = true;
                Menu3D.openMainMenuFloorButton.containingMesh.isVisible = true;
            }
        }

        // Also the point on the ground below the stare point.
        pickedGroundPt = groundPointPickingInfo(curStarePt).pickedPoint;
        if (pickedGroundPt) { groundPointBelowStarePt = pickedGroundPt; }
    });
}

/**
 * Gets the point where the user is looking (or pointing with controllers).
 * @returns void
 */
export function setStarePointInfo(): void {
    // This function runs with ever turn of the render loop. Set's information
    // about what you're looking/pointing at. Info saved to curStarePt
    /** @type {*} */
    let ray: any;

    if (Vars.vrVars.navMode === Navigation.NavMode.NoVR) {
        // No VR yet. So it's outside the realm of the VRHelper. Calculate
        // it using the looking direction.

        // Get a ray extending out in the direction of the stare.
        ray = Vars.scene.activeCamera.getForwardRay();
    } else if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
               (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {


        // Find the valid gazetracker mesh.
        /** @type {*} */
        let gazeTrackerMesh;
        if (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers) {
            gazeTrackerMesh = Vars.vrHelper.rightControllerGazeTrackerMesh;
            if (!gazeTrackerMesh) { gazeTrackerMesh = Vars.vrHelper.leftControllerGazeTrackerMesh; }
        } else if (Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) {
            gazeTrackerMesh = Vars.vrHelper.gazeTrackerMesh;
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
        /** @type {*} */
        const camPos = CommonCamera.getCameraPosition();
        ray = new BABYLON.Ray(camPos, curStarePt.subtract(camPos));
    } else {
        console.log("Unexpected error.");
    }

    setPickPointAndObjInScene(ray);
}

/**
 * Cancel the stare point if it's very far away.
 * @returns void
 */
function cancelStareIfFarAway(): void {
    if (curStarePt === undefined) {
        setCurStarePt(pointWayOffScreen);
        Pickables.setCurPickedMesh(undefined);
    } else {
        /** @type {number} */
        const dist = BABYLON.Vector3.Distance(
            CommonCamera.getCameraPosition(), curStarePt,
        );
        if (dist > 10) {
            setCurStarePt(pointWayOffScreen);
            Pickables.setCurPickedMesh(undefined);
        }
    }
}

/**
 * Sets the pick point and object currently looking at.
 * @param  {*}       ray	          The looking ray.
 * @param  {boolean} [updatePos=true] Whether to update the position.
 * @returns void
 */
function setPickPointAndObjInScene(ray: any, updatePos = true): void {
    // Determines where the specified ray intersects a pickable object.
    /** @const {*} */
    const pickingInfo = Vars.scene.pickWithRay(ray, (mesh: any) => {
        return Pickables.checkIfMeshPickable(mesh);
    });

    /** @type {number} */
    const pickingInfoDist = pickingInfo.distance;

    if ((pickingInfo.hit) && (pickingInfoDist < Vars.MAX_TELEPORT_DIST)) {
        // It does hit the floor or some other pickable object. Return the
        // point.
        if (updatePos) { setCurStarePt(pickingInfo.pickedPoint); }
        Pickables.setCurPickedMesh(pickingInfo.pickedMesh);
    } else {
        // It doesn't hit the floor or is too far away, so return null.
        setCurStarePt(pointWayOffScreen);
        Pickables.setCurPickedMesh(undefined);
    }
}

/**
 * Gets the picking info for the point on the ground below a specified point.
 * @param   {*}              pt  The specified point.
 * @returns Object<string,*> The picking info, projected onto the ground.
 */
export function groundPointPickingInfo(pt: any): any {
    /** @const {*} */
    const ray = new BABYLON.Ray(
        pt, new BABYLON.Vector3(0, -1, 0), 50,
    );

    /** @const {*} */
    const pickingInfo = Vars.scene.pickWithRay(ray, (mesh: any) => {
        return (mesh.id === Vars.vrVars.groundMesh.id);
    });

    return pickingInfo;
}
