// This module is a place to store "global" variables.

import * as Navigation from "./Navigation";

export interface IVRSetup {
    scene: any;
    engine: any;
    groundMeshName: string;  // The name of the floor mesh
    groundMesh?: any;  // The actual mesh
    canvas: any;
    // teleportationTargetMesh?: any;  // The mesh that appears when you teleport.
                                    // Leaving it undefined uses the default
                                    // mesh, which is pretty cool. Only
                                    // visible when you press down the forward
                                    // button on the controller.
    navTargetMesh?: any;            // The mesh that appears where you're
                                    // gazing. Always on, even during
                                    // teleportation. This is also used to
                                    // determine the location of the gaze. If
                                    // not set, an empty is used for tracking.
    cameraHeight?: number;          // For some nav states (NoVR), you need to
                                    // define the height.
    navMode?: Navigation.NavMode;

}

export let vars: IVRSetup;

/**
 * Modifies the parameters, adding in default values where values are missing,
 * for example. Also saves the updated params to the module-level params
 * variable.
 * @param  {*} initParams The initial parameters.
 */
export function setup(initParams: IVRSetup): void {
    // Make sure params.cameraHeight is defined.
    if (initParams.cameraHeight === undefined) {
        initParams.cameraHeight = 2;
    }

    // For debugging
    window.scene = initParams.scene;

    // Save the parameter to params (module-level variable).
    vars = initParams;
}
