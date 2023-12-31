// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as Vars from "../Vars/Vars";
import * as NonVRCamera from "./NonVRCamera";
import * as PromiseStore from "../PromiseStore";
import { Camera, DeviceOrientationCamera, Quaternion, UniversalCamera } from "@babylonjs/core";

export let cameraFromBabylonFile: UniversalCamera;

/**
 * This function runs after the babylon scene is loaded.
 * @returns void
 */
export function runSetupCamera(): void {
    PromiseStore.setPromise(
        "SetupCamera", ["LoadBabylonScene"],
        (resolve) => {
            // Make sure the active camera is the one loaded from the babylon
            // file. Should be the only one without the string VR in it.
            // Vars.scene.activeCamera = Vars.scene.cameras.filter((c: any) => c.name.indexOf("VR") === -1)[0];

            // For debugging
            // window["scene"] = Vars.scene;

            // You need to make the camera from the babylon file active. First, get
            // the babylon camera. It's the one that doesn't have "VR" in its name,
            // because VR cameras are added programatically.
            cameraFromBabylonFile = Vars.scene.cameras.filter(
                (c: Camera) => c.name.indexOf("XR") === -1 &&
                            c.name.indexOf("VR") === -1 &&
                            c.name !== "",
            )[0] as UniversalCamera;

            // If true, sets up device orientation camera. Otherwise, just use one in
            // babylonjs file. A toggle for debugging.
            if (true) {
                // Create a device orientation camera that matches the one loaded from
                // the babylon file.
                const devOrCamera = new DeviceOrientationCamera(
                    "DevOr_camera",
                    cameraFromBabylonFile.position.clone(),
                    Vars.scene,

                    // @ts-ignore
                    true,
                );
                devOrCamera.rotation = cameraFromBabylonFile.rotation.clone();

                // For debugging.
                // window["cameraFromBabylonFile"] = cameraFromBabylonFile;
                // window["devOrCamera"] = devOrCamera;

                // Update the active camera to be the device orientation one.
                Vars.scene.activeCamera = devOrCamera; // cameraFromBabylonFile

                // Make sure device orientation camera pointing in direction of
                // original camera.
                (Vars.scene.activeCamera as UniversalCamera).rotationQuaternion = Quaternion.FromEulerVector(
                    cameraFromBabylonFile.rotation,
                );
            } else {
                Vars.scene.activeCamera = cameraFromBabylonFile;
            }

            // Get the camera height (now handled elsewhere).
            // Vars.determineCameraHeightFromActiveCamera();

            // Setup the default (nonVR) camera.
            NonVRCamera.setup();

            resolve();
        }
    )
}
