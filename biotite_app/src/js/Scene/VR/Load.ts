// DEBUGG import * as General from "./General";
// DEBUGG import * as NonVRCamera from "./NonVRCamera";
// DEBUGG import * as Optimizations from "./Optimizations";
import * as Vars from "./Vars";
import * as VRCamera from "./VRCamera";

declare var BABYLON;

/**
 * Set up the VR nav system. This is the "entry point."
 * @param {Object<string,*>} initParams The parameters.
 */
export function setup(initParams: Vars.IVRSetup) {
    // Set up the parameters (filling in missing values, for example). Also
    // saves the modified params to the params module variable.
    Vars.setup(initParams);

    // Setup the general things that apply regardless of the mode used.
    // DEBUGG General.setup();

    // Setup the VR camera
    VRCamera.setup();

    // Setup the default (nonVR) camera.
    // DEBUGG NonVRCamera.setup();

    // Optimize the scene to make it run better.
    // DEBUGG Optimizations.setup();

    // For debugging...
    // trackDebugSphere();
}
