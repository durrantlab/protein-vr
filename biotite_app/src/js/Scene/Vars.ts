// A place to put variables that need to be accessed from multiple places.
// This module is a place to store "global" variables.

import * as Navigation from "./VR/Navigation";

declare var BABYLON;

export interface IVRSetup {
    groundMeshName: string;  // The name of the floor mesh
    groundMesh?: any;  // The actual mesh
    navTargetMesh?: any;            // The mesh that appears where you're
                                    // gazing. Always on, even during
                                    // teleportation. This is also used to
                                    // determine the location of the gaze. If
                                    // not set, an empty is used for tracking.
    cameraHeight?: number;          // For some nav states (NoVR), you need to
                                    // define the height.
    navMode?: Navigation.NavMode;
    menuActive?: boolean;
}

export let canvas;
export let engine;
export let scene;
export let vrHelper;

// Also some constants
export const TRANSPORT_DURATION = 11;
export const MAX_DIST_TO_MOL_ON_TELEPORT = 1.5;
export const MIN_DIST_TO_MOL_ON_TELEPORT = 1.0;
export const MAX_VERTS_PER_SUBMESH = 2000;  // This is kind of an arbitrary number.
export const BUTTON_SPHERE_RADIUS = 1.2;  // the radius of the spheres around buttons used to detect clicks.
export const MENU_RADIUS = 2.5;  // 3 is comfortable, but doesn't work in crowded environments.
export const MENU_MARGIN = 0.1;
export const PAD_MOVE_SPEED = 0.01;
export const VR_CONTROLLER_TRIGGER_DELAY_TIME = 500;  // time to wait between triggers.
export const VR_CONTROLLER_PAD_ROTATION_DELAY_TIME = 750;  // time to wait between triggers.
export const VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET = 0.1;
export const MAX_TELEPORT_DIST = 15;
export const TRANSPARENT_FLOOR_ALPHA = 0.02;

// Variables that can change.
export let vrVars: IVRSetup;

/**
 * Setup the Vars.
 * @returns void
 */
export function setup(): void {
    canvas = document.getElementById("renderCanvas");

    // Generate the BABYLON 3D engine
    engine = new BABYLON.Engine(canvas, true);

    if (true) {  // true means use manifest files.
        BABYLON.Database.IDBStorageEnabled = true;
    } else {
        engine.enableOfflineSupport = false;
    }

    scene = new BABYLON.Scene(engine);

    // For debugging
    window["scene"] = scene;
}

/**
 * Modifies the parameters, adding in default values where values are missing,
 * for example. Also saves the updated params to the module-level params
 * variable.
 * @param  {Object<string,*>} initParams The initial parameters.
 */
export function setupVR(initParams: IVRSetup): void {
    // Create the vr helper. See http://doc.babylonjs.com/how_to/webvr_helper
    let params = {
        // "createDeviceOrientationCamera": false,  // This makes phone ignore motion sensor. No good.
    };
    if (scene.getEngine().getCaps().multiview) {
        // Much faster according to
        // https://doc.babylonjs.com/how_to/multiview, but not supported in
        // all browsers.
        params["useMultiview"] = true;
    }
    vrHelper = scene.createDefaultVRExperience(params);

    // Make sure params.cameraHeight is defined.
    if (initParams.cameraHeight === undefined) {
        // Calculate the camera height from it's position.
        const ray = new BABYLON.Ray(
            scene.activeCamera.position, new BABYLON.Vector3(0, -1, 0), 50,
        );
        const pickingInfo = scene.pickWithRay(ray, (mesh) => {
            return (mesh.name === "ground");
        });
        initParams.cameraHeight = pickingInfo.distance;
    }

    // Save the parameter to params (module-level variable).
    vrVars = initParams;

    // Whether the menu system is active. True by default.
    vrVars.menuActive = true;

}
