import * as Vars from "../Vars";
import * as NonVRCamera from "./NonVRCamera";

declare var BABYLON: any;

export let cameraFromBabylonFile: any;

// Runs after the babylon scene is loaded.
export function setup() {
    // You need to make the camera from the babylon file active. First, get
    // the babylon camera.
    cameraFromBabylonFile = Vars.scene.cameras.filter(
        (c: any) => c.name.indexOf("VR") === -1,
    )[0];

    // If true, sets up device orientation camera. Otherwise, just use one in
    // babylonjs file. A toggle for debugging.
    if (true) {
        // Create a device orientation camera that matches the one loaded from
        // the babylon file.
        let DevOrCamera = new BABYLON.DeviceOrientationCamera(
            "DevOr_camera",
            cameraFromBabylonFile.position.clone(),
            Vars.scene,
            true,
        );
        DevOrCamera.rotation = cameraFromBabylonFile.rotation.clone();
        // DevOrCamera.resetToCurrentRotation();

        // For debugging.
        // window["cameraFromBabylonFile"] = cameraFromBabylonFile;
        // window["DevOrCamera"] = DevOrCamera;

        // Update the active camera to be the device orientation one.
        Vars.scene.activeCamera = DevOrCamera; // cameraFromBabylonFile

        // Make sure device orientation camera pointing in direction of
        // original camera.
        Vars.scene.activeCamera.rotationQuaternion = BABYLON.Quaternion.FromEulerVector(
            cameraFromBabylonFile.rotation,
        );
    } else {
        Vars.scene.activeCamera = cameraFromBabylonFile;
    }

    // Get the camera height.
    Vars.determineCameraHeightFromActiveCamera();

    // Setup the default (nonVR) camera.
    NonVRCamera.setup();
}
