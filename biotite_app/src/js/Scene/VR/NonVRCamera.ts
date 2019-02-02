// This sets up the non vr camera. Not everyone has a vr headset.

import * as Navigation from "./Navigation";
import * as Vars from "./Vars";

declare var BABYLON;
declare var jQuery;

let nonVRCamera;
let lastCameraPosAboveFloorMesh;

/**
 * Sets up the nonVR camera (not everyone has a VR headset).
 */
export function setup() {
    lastCameraPosAboveFloorMesh = null;
    // const timeOfLastCameraPosCheck = null;

    setupNonVRCameraObj();

    // Periodically check the camera position, must be over the floor.
    // setInterval(keepCameraOverFloorMesh, 1);
    Vars.vars.scene.registerBeforeRender(keepCameraOverFloorMesh);
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

    // Turn on collisions as appropriate. Note that floorMesh collisions are
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

function ptProjectedToFloor(pt) {
    const ray = new BABYLON.Ray(
        pt, new BABYLON.Vector3(0, -1, 0), 50,
    );
    const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
        return (mesh.id === Vars.vars.floorMesh.id);
    });
    return pickingInfo;
}

/**
 * A function to make sure the camera is always over the floor mesh.
 */
function keepCameraOverFloorMesh() {
    // Don't check if recently checked.
    // const nowTime = new Date().getTime();
    // if (nowTime - timeOfLastCameraPosCheck < 100) {
    //     return;
    // }
    // timeOfLastCameraPosCheck = nowTime;

    // Every once in a while, check if you're over the floor mesh. Cast a ray
    // directly down from the camera.
    const activeCameraPos = Vars.vars.scene.activeCamera.position;

    // Check if the ray hit the floor.
    if (ptProjectedToFloor(activeCameraPos).hit) {
        // It hit the floor. Save the current camera coordiantes.
        lastCameraPosAboveFloorMesh = activeCameraPos.clone();
    } else {
        // It's not over the floor anymore. Move the camera to the last
        // place that was above the floor. Do it axis by axis to allow for
        // sliding along walls.

        // let pt = new BABYLON.Vector3(
            // lastCameraPosAboveFloorMesh.x, lastCameraPosAboveFloorMesh.y, activeCameraPos.z
        // );
        // if (ptProjectedToFloor(pt).hit) {
        //     activeCameraPos = pt.clone();
        // }

        // pt = new BABYLON.Vector3(
            // activeCameraPos.x, lastCameraPosAboveFloorMesh.y, lastCameraPosAboveFloorMesh.z
        // );
        // if (ptProjectedToFloor(pt).hit) {
        //     activeCameraPos = pt.clone();
        // }

        // pt = new BABYLON.Vector3(
            // lastCameraPosAboveFloorMesh.x, activeCameraPos.y, lastCameraPosAboveFloorMesh.z
        // );
        // if (ptProjectedToFloor(pt).hit) {
        //     activeCameraPos = pt.clone();
        // }

        Vars.vars.scene.activeCamera.position = lastCameraPosAboveFloorMesh.clone();
    }
}
