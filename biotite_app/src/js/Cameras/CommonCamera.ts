// These functions include camera functions common to all kinds of cameras.

import * as Navigation from "../Navigation/Navigation";
import * as Points from "../Navigation/Points";
import * as Vars from "../Vars";
import * as VRCamera from "./VRCamera";

declare var BABYLON;

let forwardVec = new BABYLON.Vector3(1, 0, 0);
let upVec = new BABYLON.Vector3(1, 0, 0);

// let activeCamPos = new BABYLON.Vector3(0, 0, 0);

/**
 * Gets the location of the camera. If VR camera, gets the left eye.
 * @returns * The camera location.
 */
export function getCameraPosition(): any {
    // If it's a VR camera, you need to make an adjustment.
    let activeCam = Vars.scene.activeCamera;
    let activeCamPos = activeCam.position.clone();

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
export function setCameraPosition(pt): void {
    if (Vars.vrVars.navMode === Navigation.NavMode.NoVR) {
        // A regular camera. Just move it there.
        let activeCam = Vars.scene.activeCamera;
        activeCam.position.copyFrom(pt);
    } else if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
               (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {
        // Not ever tested... not sure it works...
        let activeCam = Vars.vrHelper.webVRCamera;

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
 * Gets the camera rotation
 * @returns * The rotation.
 */
export function getCameraRotationY(): any {
    if ((Vars.vrVars.navMode === Navigation.NavMode.VRNoControllers) ||
        (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers)) {

        // Complicated in the case of a VR camera.
        let groundPtVec = Points.groundPointBelowStarePt.subtract(Points.groundPointBelowCamera);
        let angle = BABYLON.Vector3.GetAngleBetweenVectors(groundPtVec, forwardVec, upVec);

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
        let activeCam = Vars.scene.activeCamera;
        let activeCamRot = activeCam.rotation.clone();
        return activeCamRot.y;  // + Math.PI * 0.5;
    }
}

/**
 * Gets the vector from the camera location to the eye location. For a VR
 * camera, these can be different.
 * @returns * The vector.
 */
export function getVecFromEyeToCamera(): any {
    if (Vars.vrVars.navMode === Navigation.NavMode.NoVR) {
        // Not in VR mode? Then there is no eye.
        return new BABYLON.Vector3(0, 0, 0);
    }

    // Note that some VR cameras don't track position, only orientation.
    // Google cardboard is an example.
    let activeCam = Vars.vrHelper.webVRCamera;
    let deltaVec;
    if (activeCam.leftCamera) {
        let leftEyePos = activeCam.leftCamera.globalPosition;
        deltaVec = leftEyePos.subtract(activeCam.position);
    } else {
        deltaVec = new BABYLON.Vector3(0, 0, 0);
    }

    return deltaVec;
}
