// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.


// These functions include camera functions common to all kinds of cameras.

import { UniversalCamera, Vector3, Quaternion } from '@babylonjs/core';
import * as Navigation from "../Navigation/Navigation";
import * as Points from "../Navigation/Points";
import * as Vars from "../Vars/Vars";

/** @const {*} */
const forwardVec = new Vector3(1, 0, 0);

/** @const {*} */
const upVec = new Vector3(1, 0, 0);

// let activeCamPos = new Vector3(0, 0, 0);

/**
 * Gets the location of the camera. If VR camera, gets the left eye.
 * @returns * The camera location.
 */
export function getCameraPosition(): Vector3 {
    // If it's a VR camera, you need to make an adjustment.

    /** @const {*} */
    const activeCam = Vars.scene.activeCamera;

    const activeCamPos = activeCam.position.clone();

    if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
        (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {

        // VR camera, so get eye position.
        if (activeCam.leftCamera) {
            activeCamPos.copyFrom(activeCam.leftCamera.globalPosition);
        } else {
            console.log("Prob here");
        }
    }

    return activeCamPos;
}

/**
 * Sets the camera location. Accounts for difference between eye and camera
 * pos if VR camera.
 * @param  {*} pt The new location.
 * @returns void
 */
export function setCameraPosition(pt: Vector3): void {
    if (Vars.vrVars.navMode === Navigation.NavMode.NoVR) {
        // A regular camera. Just move it there.
        const activeCam = Vars.scene.activeCamera;
        activeCam.position.copyFrom(pt);
    } else if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
               (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {
        // Not ever tested... not sure it works...
        const activeCam = Vars.scene.activeCamera;

        // A VR camera. Need to account for the fact that the eye might not be
        // at the same place as the camera.
        activeCam.position.copyFrom(
            pt.subtract(
                getVecFromEyeToCamera(),
            ),
        );
    }
}

/**
 * Gets the rotation quaternion of the current camera, whether Universal,
 * DeviceOrientation, or VR.
 * @returns * The quaternion.
 */
export function getCameraRotationQuaternion(): Quaternion {
    if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
        (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {

        // Cover all devices using the below... (Android, Chrome, Carboard)
        // const quat = Vars.vrHelper.webVRCamera.deviceRotationQuaternion;
        const quat = Vars.vrHelper.baseExperience.camera.rotationQuaternion;  // JDD right?
        return (quat.x !== 0) ? quat : (Vars.scene.activeCamera as UniversalCamera).rotationQuaternion;
    } else {
        // Regular (Universal) camera.
        return (Vars.scene.activeCamera as UniversalCamera).rotationQuaternion;
    }
}

/**
 * Sets the rotation quaternion of the camera. As currently implemented,
 * assumes Universal camera (i.e., this function should only be called in
 * Student mode).
 * @param  {*} rotQua The rotation quaternion.
 * @returns void
 */
export function setCameraRotationQuaternion(rotQua: Quaternion): void {
    if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
    (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {
        console.log("PROBLEM!");
    } else {
        // Update the quaternion
        (Vars.scene.activeCamera as UniversalCamera).rotationQuaternion = rotQua.clone();

        // Update the rotation vector accordingly. See
        // http://www.html5gamedevs.com/topic/16160-retrieving-rotation-after-meshlookat/
        (Vars.scene.activeCamera as UniversalCamera).rotation = (Vars.scene.activeCamera as UniversalCamera).rotationQuaternion.toEulerAngles();
    }
}

/**
 * Gets the camera rotation.
 * @returns * The rotation.
 */
export function getCameraRotationY(): number {
    if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
        (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {

        // Complicated in the case of a VR camera.
        const groundPtVec = Points.groundPointBelowStarePt.subtract(Points.groundPointBelowCamera);

        /** @type {number} */
        let angle = Vector3.GetAngleBetweenVectors(groundPtVec, forwardVec, upVec);

        if (groundPtVec.z < 0) {
            angle = -angle;
        }

        // Make sure the angle is between 0 and 2 * Math.PI
        while (angle < 0) {
            angle = angle + 2 * Math.PI;
        }
        while (angle > 2 * Math.PI) {
            angle = angle - 2 * Math.PI;
        }

        angle = angle + Math.PI * 0.5;

        return angle;
    } else {
        // This is much simplier with a non-VR camera.
        const activeCam = Vars.scene.activeCamera;
        const activeCamRot = (activeCam as UniversalCamera).rotation.clone();
        return activeCamRot.y;  // + Math.PI * 0.5;
    }
}

/**
 * Gets the vector from the camera location to the eye location. For a VR
 * camera, these can be different.
 * @returns * The vector.
 */
export function getVecFromEyeToCamera(): Vector3 {
    if (Vars.vrVars.navMode === Navigation.NavMode.NoVR) {
        // Not in VR mode? Then there is no eye.
        return new Vector3(0, 0, 0);
    }

    // Note that some VR cameras don't track position, only orientation.
    // Google cardboard is an example.
    const activeCam = Vars.scene.activeCamera;
    let deltaVec;
    if (activeCam.leftCamera) {
        const leftEyePos = activeCam.leftCamera.globalPosition;
        deltaVec = leftEyePos.subtract(activeCam.position);
    } else {
        deltaVec = new Vector3(0, 0, 0);
    }

    return deltaVec;
}
