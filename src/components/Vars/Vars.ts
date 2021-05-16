// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// A place to put variables that need to be accessed from multiple places.
// This module is a place to store "global" variables.

import * as Navigation from "../Navigation/Navigation";
import * as UrlVars from "./UrlVars";
import * as PromiseStore from "../PromiseStore";
import { AbstractMesh, Database, Engine, Mesh, Ray, Scene, Vector3, VRExperienceHelper, WebXRDefaultExperience, WebXRMotionControllerManager } from "@babylonjs/core";
import { addMessage } from "../UI/Vue/Components/MessagesComponent";
// import WebXRPolyfill from 'webxr-polyfill';

export interface IVRSetup {
    groundMesh?: Mesh;             // The actual mesh
    navTargetMesh?: AbstractMesh;  // The mesh that appears where you're
                                   // gazing. Always on, even during
                                   // teleportation. This is also used to
                                   // determine the location of the gaze. If
                                   // not set, an empty is used for tracking.
    navMode?: Navigation.NavMode;
    menuActive?: boolean;
}

export const VERSION = "1.0.7";

export let canvas: HTMLCanvasElement;
export let engine: Engine;
export let scene: Scene;
export let vrHelper: WebXRDefaultExperience;
export let sceneName = "environs/simple/";

/**
 * Setter for sceneName variable.
 * @param  {string} val  The value to set.
 */
export function setSceneName(val: string): void { sceneName = val; }

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
export const VR_CONTROLLER_PAD_RATIO_OF_MIDDLE_FOR_CAMERA_RESET = 0.5;

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
    canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;

    // window["canvas"] = canvas;  // debugging

    // Generate the BABYLON 3D engine
    engine = new Engine(canvas, true);

    if (true) {  // true means use manifest files.
        Database.IDBStorageEnabled = true;
    } else {
        engine.enableOfflineSupport = false;
    }

    scene = new Scene(engine);

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
        const ray = new Ray(
            scene.activeCamera.position, new Vector3(0, -1, 0), 50,
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
export function runInitVR(initParams: IVRSetup): void {
    PromiseStore.setPromise(
        "InitVR", [],
        (resolve) => {
            // Save the parameter to params (module-level variable).
            vrVars = initParams;

            // If running in Student mode, do not set up VR camera... But good to
            // define vrVars first (above) so you can hide the nav sphere elsewhere.
            if (UrlVars.checkIfWebRTCInUrl()) {
                resolve();
                return;
            }

            // Create the xr helper.
            const params = {
                // Previous when using WebVR:
                // "createDeviceOrientationCamera": false,  // This makes phone ignore motion sensor. No good.
                // "createDeviceOrientationCamera": true,
                // "useMultiview": false,

                "disableTeleportation": true,  // because using your own system.
                "ignoreNativeCameraTransformation": false,
                "createDefaultXRExperienceAsync": {
                    "canvasElement": canvas,
                    "canvasOptions": {
                        "framebufferScaleFactor": 1,  // https://github.com/immersive-web/webxr/issues/349
                        "antialias": true
                    }
                }
            };

            // TODO: No multiview for now because causes errors on latest FireFox.
            // Good to revist this in the future as WebXR progresses.
            // if (scene.getEngine().getCaps().multiview) {
            //     // Much faster according to
            //     // https://doc.babylonjs.com/how_to/multiview, but not
            //     // supported in all browsers.
            //     params["useMultiview"] = true;
            // }

            // WebXR shiv now loaded in index.html.
            // const polyfill = new WebXRPolyfill();

            // Use a local copy of part of the repo at
            // https://github.com/immersive-web/webxr-input-profiles to
            // load controller profiles.
            WebXRMotionControllerManager.BaseRepositoryUrl = "js/";

            window["engine"] = engine;
            scene.createDefaultXRExperienceAsync(params)
                .then((vrHelp: WebXRDefaultExperience) => {
                    // Check if supports immersive vr. See
                    // https://forum.babylonjs.com/t/webxr-on-oculus-quest/4949/6

                    vrHelper = vrHelp;

                    // For debugging...
                    // window["vrHelper"] = vrHelper;

                    vrHelper.baseExperience.sessionManager.onXRSessionInit.add(() => {
                        // console.log("onXRSessionInit");

                        if (window["webXRPolyfill"]["nativeWebXR"] === false) {
                            // The WebXR polyfill is low resolution. I think
                            // it's a bug. It initially resizes the canvas to
                            // higher resolution, but then it makes it smaller
                            // again (100%) and messes up the resolution.
                            // Native WebXR doesn't seem to have the same
                            // problem. So if the polyfill is being used,
                            // let's increase the hardware scaling level to
                            // compensate.

                            // The problem is that I can't get the
                            // renderTarget framebuffer dimensions until I
                            // enter VR. But if I've already entered VR,
                            // setting setHardwareScalingLevel messes the
                            // canvas up. There is so good solution here. So
                            // I'm going to shoot for 1440 ( x 2) by 1600 (a
                            // high-end set). See
                            // https://en.wikipedia.org/wiki/Comparison_of_virtual_reality_headsets
                            // Unfortunately, this is almost certainly too
                            // high a resolution for some headsets, which is
                            // likely to affect performance. Also seems to
                            // cause some problems if the resolution has
                            // different dimensions (e.g., Oculus Rift vs. HTC
                            // Vive). Anyway, WebXR should be supported
                            // everywhere soon enough.

                            const targetFrameBufferWidth = 1440 * 2;  // Wish I could use vrHelper.renderTarget.xrLayer.framebufferWidth here.
                            const targetFrameBufferHeight = 1600;  // Wish I could use vrHelper.renderTarget.xrLayer.framebufferHeight here.

                            // const targetFrameBufferHeight = 1334;  // iPhone SE
                            // const targetFrameBufferWidth = 750;

                            // let scale1 = window.innerWidth / targetFrameBufferWidth;
                            // let scale2 = window.innerHeight / targetFrameBufferHeight;

                            // Using below because
                            // https://stackoverflow.com/questions/4629969/ios-return-bad-value-for-window-innerheight-width
                            let scale1 = window.document.documentElement.clientWidth / targetFrameBufferWidth;
                            let scale2 = window.document.documentElement.clientHeight / targetFrameBufferHeight;

                            let scale = Math.min(scale1, scale2);

                            if ((scale < 1.0) && UrlVars.checkHardwardScalingInUrl()) {
                                // Only scale if it would be upscaling.
                                engine.setHardwareScalingLevel(scale);
                            }

                            console.log("Using WebXR polyfill.");
                        }
                    });

                    // Prioritize the local classes (but use online if
                    // controller not found).
                    // WebXRMotionControllerManager.PrioritizeOnlineRepository = false;

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

                    resolve();
                    return Promise.resolve();
                })
                // Below doesn't work for some reason.
                // .catch((error) => {
                //     alert("hi")
                // });
        }
    );
}
