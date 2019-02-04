// This sets up the non vr camera. Not everyone has a vr headset.

import * as Navigation from "./Navigation";
import * as Vars from "./Vars";

declare var BABYLON;
declare var jQuery;

let nonVRCamera;
let lastCameraPosAboveGroundMesh = new BABYLON.Vector3(0, 0, 0);

/**
 * Sets up the nonVR camera (not everyone has a VR headset).
 */
export function setup() {
    // lastCameraPosAboveGroundMesh = null;
    // const timeOfLastCameraPosCheck = null;

    setupNonVRCameraObj();

    // Periodically check the camera position, must be over the floor.
    // setInterval(fixPointHeightAboveGround, 1);
    // Vars.vars.scene.registerBeforeRender(fixPointHeightAboveGround);
}

function setupNonVRCameraObj() {
    // The VRHelper already created a camera. Need to set it up.
    // nonVRCamera = new BABYLON.FreeCamera("nonVRCamera",
    //                                      new BABYLON.Vector3(0, params.cameraHeight, 0),
    //                                      params.scene);
    nonVRCamera = Vars.vars.scene.activeCamera;

    // Enable navigation via both WASD and the arrows keys.
    nonVRCamera.keysUp = [87, 38];
    nonVRCamera.keysDown = [83, 40];
    nonVRCamera.keysLeft = [65, 37];
    nonVRCamera.keysRight = [68, 39];

    // Turn on gravity
    Vars.vars.scene.gravity = new BABYLON.Vector3(0, -9.81, 0);
    nonVRCamera.applyGravity = true;

    // Enable collision detection. Note that the second paramerter is a
    // radius.
    nonVRCamera.ellipsoid = new BABYLON.Vector3(1.0, 0.5 * Vars.vars.cameraHeight, 1.0);

    // Turn on collisions as appropriate. Note that groundMesh collisions are
    // enabled in Navigation.
    // scene.workerCollisions = true;
    Vars.vars.scene.collisionsEnabled = true;
    nonVRCamera.checkCollisions = true;

    // Slow the camera.
    nonVRCamera.speed = 0.1;

    // Make sure orientation is default
    // nonVRCamera.rotation = new BABYLON.Vector3(0, 0, 0);

    nonVRCamera.attachControl(Vars.vars.canvas, true);

    // Position the camera on the floor. See
    // http://www.html5gamedevs.com/topic/30837-gravity-camera-stops-falling/
    nonVRCamera._updatePosition();
}
