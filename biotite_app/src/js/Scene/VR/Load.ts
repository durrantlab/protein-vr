import * as VRCamera from "../Cameras/VRCamera";
import * as Vars from "../Vars";
import * as Optimizations from "./Optimizations";

declare var BABYLON;

/**
 * Set up the VR nav system. This is the "entry point."
 * @param {Object<string,*>} initParams The parameters.
 */
export function setup(initParams: Vars.IVRSetup) {
    // Set up the parameters (filling in missing values, for example). Also
    // saves the modified params to the params module variable.
    Vars.setupVR(initParams);

    // Setup the VR camera
    VRCamera.setup();

    // Optimize the scene to make it run better.
    Optimizations.setup();

    // For debugging...
    // trackDebugSphere();

    window.Vars = Vars;
}
