// A place to put variables that need to be accessed from multiple places.
// This module is a place to store "global" variables.

import * as Navigation from "./Navigation";

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

}

export let canvas;
export let engine;
export let scene;

// Also some constants
export const TRANSPORT_DURATION = 11;
export const MAX_DIST_TO_MOL_ON_TELEPORT = 1.0;
export const MIN_DIST_TO_MOL_ON_TELEPORT = 0.5;
export const MAX_VERTS_PER_SUBMESH = 2000;  // This is kind of an arbitrary number.
export const BUTTON_SPHERE_RADIUS = 1.2;  // the radius of the spheres around buttons used to detect clicks.

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

    // DEBUGG engine.enableOfflineSupport = false;  // no manifest errors

    scene = new BABYLON.Scene(engine);

    // For debugging
    window.scene = initParams.scene;
}

/**
 * A function to set the scene.
 * @param  {*} newScene
 * @returns void
 */
export function setScene(newScene): void {
    scene = newScene;
}

/**
 * Modifies the parameters, adding in default values where values are missing,
 * for example. Also saves the updated params to the module-level params
 * variable.
 * @param  {Object<string,*>} initParams The initial parameters.
 */
export function setupVR(initParams: IVRSetup): void {
    // Make sure params.cameraHeight is defined.
    // DEBUGG
    /* if (initParams.cameraHeight === undefined) {
        // Calculate the camera height from it's position.
        const ray = new BABYLON.Ray(
            initParams.scene.activeCamera.position, new BABYLON.Vector3(0, -1, 0), 50,
        );
        const pickingInfo = initParams.scene.pickWithRay(ray, (mesh) => {
            return (mesh.name === "ground");
        });
        initParams.cameraHeight = pickingInfo.distance;
    } */

    // Save the parameter to params (module-level variable).
    vrVars = initParams;
}
