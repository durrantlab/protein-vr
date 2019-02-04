// These functions include camera functions common to all kinds of cameras.
define(["require", "exports", "./Navigation", "./Vars", "./VRCamera"], function (require, exports, Navigation, Vars, VRCamera) {
    "use strict";
    exports.__esModule = true;
    // let activeCamPos = new BABYLON.Vector3(0, 0, 0);
    function getCameraPosition() {
        // If it's a VR camera, you need to make an adjustment.
        var activeCam = Vars.vars.scene.activeCamera;
        var activeCamPos = activeCam.position.clone();
        if ((Vars.vars.navMode === Navigation.NavMode.VRNoControllers) ||
            (Vars.vars.navMode === Navigation.NavMode.VRWithControllers)) {
            // VR camera, so get eye position.
            if (activeCam.leftCamera) {
                // Adapted from BABYLON.js code (teleportCamera func in
                // vrExperienceHelper.ts). You need to adjust the new location a
                // bit if you're using a new camera. It's because the actual
                // location of your eye might differ from the location of the
                // camera.
                // deltaVec.copyFrom(activeCam.leftCamera.globalPosition);
                // deltaVec.subtractInPlace(activeCamPos);
                // deltaVec.copyFrom(getVecFromEyeToCamera());
                // activeCamPos.addInPlace(
                // getVecFromEyeToCamera(),
                // );
                activeCamPos.copyFrom(activeCam.leftCamera.globalPosition);
            }
            else {
                console.log("Prob here");
            }
        }
        return activeCamPos;
    }
    exports.getCameraPosition = getCameraPosition;
    function setCameraPosition(pt) {
        // Not ever tested... not sure it works...
        var activeCam = VRCamera.vrHelper.webVRCamera;
        if (Vars.vars.navMode === Navigation.NavMode.NoVR) {
            // A regular camera. Just move it there.
            activeCam.position.copyFrom(pt);
        }
        else if ((Vars.vars.navMode === Navigation.NavMode.VRNoControllers) ||
            (Vars.vars.navMode === Navigation.NavMode.VRWithControllers)) {
            // A VR camera. Need to account for the fact that the eye might not be
            // at the same place as the camera.
            // deltaVec.copyFrom(activeCam.leftCamera.globalPosition);
            // deltaVec.subtractInPlace(activeCamPos);
            // activeCam.position.copyFrom(
            // activeCamPos.subtract(getVecFromEyeToCamera()),  // or minus???
            // );
            activeCam.position.copyFrom(pt.subtract(getVecFromEyeToCamera()));
            // let activeCamPos = activeCam.position.clone();
            // activeCamPos.copyFrom;
        }
    }
    exports.setCameraPosition = setCameraPosition;
    // let deltaVec = new BABYLON.Vector3(0, 0, 0);
    function getVecFromEyeToCamera() {
        if (Vars.vars.navMode === Navigation.NavMode.NoVR) {
            // Not in VR mode? Then there is no eye.
            return new BABYLON.Vector3(0, 0, 0);
        }
        var activeCam = VRCamera.vrHelper.webVRCamera;
        var leftEyePos = activeCam.leftCamera.globalPosition;
        var deltaVec = leftEyePos.subtract(activeCam.position);
        // deltaVec.copyFrom(
        // return activeCam.leftCamera.globalPosition.subtract(
        // activeCam.position.clone(),
        // );
        // );
        return deltaVec;
    }
    exports.getVecFromEyeToCamera = getVecFromEyeToCamera;
});
