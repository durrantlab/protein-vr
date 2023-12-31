// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// This sets up the non vr camera. Not everyone has a vr headset.

import { UniversalCamera, Vector3 } from "@babylonjs/core";
import { setPromise } from "../PromiseStore";
import * as Vars from "../Vars/Vars";

/** @type {*} */
export let nonVRCamera: UniversalCamera;

/**
 * Sets up the nonVR camera (not everyone has a VR headset).
 * @returns void
 */
export function setup(): void {
    setupNonVRCameraObj();
}

/**
 * Sets up the camera object.
 * @returns void
 */
function setupNonVRCameraObj(): void {
    // The VRHelper already created a camera. Need to set it up.
    nonVRCamera = Vars.scene.activeCamera as UniversalCamera;
    
    // Enable navigation via both WASD and the arrows keys.
    nonVRCamera.keysUp = [87, 38];
    nonVRCamera.keysDown = [83, 40];
    nonVRCamera.keysLeft = [65, 37];
    nonVRCamera.keysRight = [68, 39];

    // Turn on gravity. Note: Turning this on causes problems, and it doesn't
    // seem to be necessary. Well, it does help with arrow/wsad navigation
    // (can't fly off).
    // Vars.scene.gravity = new Vector3(0, -9.81, 0);
    Vars.scene.gravity = new Vector3(0, -0.1, 0);
    nonVRCamera.applyGravity = true;

    // Turn on collisions as appropriate. Note that groundMesh collisions are
    // enabled in Navigation.
    // scene.workerCollisions = true;
    setNonVRCameraCollisionElipsoid();

    // Slow the camera.
    nonVRCamera.speed = 0.1;

    nonVRCamera.attachControl(Vars.canvas, true);

    // Position the camera on the floor. See
    // http://www.html5gamedevs.com/topic/30837-gravity-camera-stops-falling/
    nonVRCamera._updatePosition();

    // Use ref to engine to get canvas' Tab Index and set it
    Vars.canvas.tabIndex = Vars.engine.canvasTabIndex;
    Vars.canvas.focus();
}

/**
 * Sets up the elipsoid/collisions on the camera (for non-VR camera).
 * @returns void
 */
export function setNonVRCameraCollisionElipsoid(): void {
    Vars.determineCameraHeightFromActiveCamera(true);

    // Enable collision detection. Note that the second paramerter is a
    // radius.
    setCameraElipsoid();

    Vars.scene.collisionsEnabled = true;
    nonVRCamera.checkCollisions = true;
}

/**
 * Sets up the collision elipsoid around the non-VR camera.
 * @returns void
 */
export function setCameraElipsoid(): void {
    // Depends on camera height.
    nonVRCamera.ellipsoid = new Vector3(1.0, 0.5 * Vars.cameraHeight, 1.0);
}
