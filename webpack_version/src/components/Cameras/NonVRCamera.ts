// This sets up the non vr camera. Not everyone has a vr headset.

import * as Navigation from "../Navigation/Navigation";
import * as Vars from "../Vars";

declare var BABYLON: any;

/** @type {*} */
let nonVRCamera: any;

let lastCameraPosAboveGroundMesh: any = new BABYLON.Vector3(0, 0, 0);

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
    nonVRCamera = Vars.scene.activeCamera;

    // Enable navigation via both WASD and the arrows keys.
    nonVRCamera.keysUp = [87, 38];
    nonVRCamera.keysDown = [83, 40];
    nonVRCamera.keysLeft = [65, 37];
    nonVRCamera.keysRight = [68, 39];

    // Turn on gravity. Note: Turning this on causes problems, and it doesn't
    // seem to be necessary. Well, it does help with arrow/wsad navigation
    // (can't fly off).
    // Vars.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    Vars.scene.gravity = new BABYLON.Vector3(0, -0.1, 0);
    nonVRCamera.applyGravity = true;

    // Enable collision detection. Note that the second paramerter is a
    // radius.
    setCameraElipsoid();

    // Turn on collisions as appropriate. Note that groundMesh collisions are
    // enabled in Navigation.
    // scene.workerCollisions = true;
    Vars.scene.collisionsEnabled = true;
    nonVRCamera.checkCollisions = true;

    // Slow the camera.
    nonVRCamera.speed = 0.1;

    // Make sure orientation is default
    // nonVRCamera.rotation = new BABYLON.Vector3(0, 0, 0);

    nonVRCamera.attachControl(Vars.canvas, true);

    // Position the camera on the floor. See
    // http://www.html5gamedevs.com/topic/30837-gravity-camera-stops-falling/
    nonVRCamera._updatePosition();
}

/**
 * Sets up the collision elipsoid around the non-VR camera.
 * @returns void
 */
export function setCameraElipsoid(): void {
    // Depends on camera height.
    nonVRCamera.ellipsoid = new BABYLON.Vector3(1.0, 0.5 * Vars.cameraHeight, 1.0);
}
