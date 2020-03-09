// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


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

// setInterval(() => { console.log(groundPointBelowCamera);}, 500);

/**
 * Sets the curStarePt variable externally.
 * @param {*} pt
 * @returns void
 */
export function setCurStarePt(pt: any): void {
    curStarePt.copyFrom(pt);
}

// Read position and rotation from this to position teleportation sphere.
let rayFuncToCalcNavMeshPos;

export function setRayFuncToCalcNavMeshPos(func: Function): void {
    rayFuncToCalcNavMeshPos = func;
}

export function useGazeForNavMeshPos(): void {
    setRayFuncToCalcNavMeshPos(() => {
        return Vars.scene.activeCamera.getForwardRay();
    });
}

/**
 * Sets up the key points detection. Stare point, point below the camera, etc.
 * @returns void
 */
export function setup(): void {
    // Hide menu button if closer than this.
    const CLOSE_TO_GROUND_DIST = Vars.BUTTON_SPHERE_RADIUS * 1.5;

    // Initially, move the nav sphere to where starting.
    useGazeForNavMeshPos();

    // Constantly update the stare point info. Also, position the tracking
    // mesh.
    Vars.scene.registerBeforeRender(() => {
        // Get the stare point. Here because it should be updated with every
        // frame.
        setPickPointAndObjInScene();
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
                window["btn"] = Menu3D.openMainMenuFloorButton;  // For debugging
            }
        }

        // Also the point on the ground below the stare point.
        pickedGroundPt = groundPointPickingInfo(curStarePt).pickedPoint;
        if (pickedGroundPt) { groundPointBelowStarePt = pickedGroundPt; }
    });
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
x * @param  {boolean} [updatePos=true] Whether to update the position.
 * @returns void
 */
export function setPickPointAndObjInScene(updatePos = true): void {
    // The looking ray.
    let ray = rayFuncToCalcNavMeshPos();

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
