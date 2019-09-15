// A place to put variables that need to be accessed from multiple places.
// This module is a place to store "global" variables.

import * as Navigation from "../Navigation/Navigation";
import * as UrlVars from "./UrlVars";

declare var BABYLON: any;

export interface IVRSetup {
    groundMesh?: any;  // The actual mesh
    navTargetMesh?: any;            // The mesh that appears where you're
                                    // gazing. Always on, even during
                                    // teleportation. This is also used to
                                    // determine the location of the gaze. If
                                    // not set, an empty is used for tracking.
    navMode?: Navigation.NavMode;
    menuActive?: boolean;
}

export let canvas: any;
export let engine: any;
export let scene: any;
export let vrHelper: any;
export let sceneName = "environs/day/";

/**
 * Setter for sceneName variable.
 * @param  {string} val  The value to set.
 */
export function setSceneName(val: string) { sceneName = val; }

// From scene_info.json
export let sceneInfo = {
    positionOnFloor: false,
    infiniteDistanceSkyBox: true,
    transparentGround: false
};

/** @type {number} */
export let cameraHeight: number;

// Also some constants
/** @const {number} */
export const TRANSPORT_DURATION = 11;

/** @const {number} */
export const MAX_DIST_TO_MOL_ON_TELEPORT = 1.5;

/** @const {number} */
export const MIN_DIST_TO_MOL_ON_TELEPORT = 1.0;

/** @const {number} */
export const MAX_VERTS_PER_SUBMESH = 2000;  // This is kind of an arbitrary number.

/** @const {number} */
export const BUTTON_SPHERE_RADIUS = 1.2;  // the radius of the spheres around buttons used to detect clicks.

/** @const {number} */
export const MENU_RADIUS = 2.5;  // 3 is comfortable, but doesn't work in crowded environments.

/** @const {number} */
export const MENU_MARGIN = 0.05;  // 0.15;  // 0.1;

/** @const {number} */
export const PAD_MOVE_SPEED = 0.01;

/** @const {number} */
export const VR_CONTROLLER_TRIGGER_DELAY_TIME = 500;  // time to wait between triggers.

/** @const {number} */
export const VR_CONTROLLER_PAD_ROTATION_DELAY_TIME = 750;  // time to wait between triggers.

/** @const {number} */
export const VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET = 0.1;

/** @const {number} */
export const MAX_TELEPORT_DIST = 15;

/** @const {number} */
export const TRANSPARENT_FLOOR_ALPHA = 0.05;  // 0.02;

// IOS doesn't support a lot of features!
/** @const {*} */
// export const IOS: boolean = false;  // TODO: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window["MSStream"];

// Variables that can change.
export let vrVars: IVRSetup = {};

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

    // For debugging...
    window["scene"] = scene;
}

/**
 * Determines the camera height from the active camera.
 * @returns void
 */
export function determineCameraHeightFromActiveCamera(): void {
    // Get the camera height. But I don't think this variable is every
    // actually used anywhere...
    if (cameraHeight === undefined) {
        // Calculate the camera height from it's position.
        /** @const {*} */
        const ray = new BABYLON.Ray(
            scene.activeCamera.position, new BABYLON.Vector3(0, -1, 0), 50,
        );

        /** @const {*} */
        const pickingInfo = scene.pickWithRay(ray, (mesh: any) => {
            return (mesh.name === "ground");
        });

        cameraHeight = pickingInfo.distance;
    }
}

/**
 * Sets the camera height.
 * @param  {number} height  The height.
 * @returns void
 */
export function setCameraHeight(height: number): void {
    cameraHeight = height;
}

/**
 * Modifies the parameters, adding in default values where values are missing,
 * for example. Also saves the updated params to the module-level params
 * variable.
 * @param  {Object<string,*>} initParams The initial parameters.
 */
export function setupVR(initParams: IVRSetup): void {
    // Save the parameter to params (module-level variable).
    vrVars = initParams;

    // If running in Student mode, do not set up VR camera... But good to
    // define vrVars first (above) so you can hide the nav sphere elsewhere.
    if (UrlVars.checkWebrtcInUrl()) {
        return;
    }

    // Create the vr helper. See http://doc.babylonjs.com/how_to/webvr_helper
    const params = {
        // "createDeviceOrientationCamera": false,  // This makes phone ignore motion sensor. No good.
        "createDeviceOrientationCamera": true,
        "useMultiview": false
    };
    if (scene.getEngine().getCaps().multiview) {
        // Much faster according to
        // https://doc.babylonjs.com/how_to/multiview, but not supported in
        // all browsers.
        params["useMultiview"] = true;
    }
    vrHelper = scene.createDefaultVRExperience(params);

    // Hide the vrHelper icon initially.
    const babylonVRiconbtn = document.getElementById("babylonVRiconbtn");
    if (babylonVRiconbtn !== null) {
        babylonVRiconbtn.style.opacity = "0.0";  // Non IE;
        babylonVRiconbtn.style.filter = "alpha(opacity=0)";  // IE;
    }

    // For debugging....
    // window["vrHelper"] = vrHelper;

    // Whether the menu system is active. True by default.
    vrVars.menuActive = true;
}
