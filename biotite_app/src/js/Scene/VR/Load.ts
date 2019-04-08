import * as Vars from "../Vars";
import * as General from "./General";
import * as NonVRCamera from "./NonVRCamera";
import * as Optimizations from "./Optimizations";
import * as VRCamera from "./VRCamera";

declare var BABYLON;

/**
 * Set up the VR nav system. This is the "entry point."
 * @param {Object<string,*>} initParams The parameters.
 */
export function setup(initParams: Vars.IVRSetup) {
    // Set up the parameters (filling in missing values, for example). Also
    // saves the modified params to the params module variable.
    Vars.setupVR(initParams);

    // Setup the general things that apply regardless of the mode used.
    General.setup();

    // Setup the VR camera
    VRCamera.setup();

    // Setup the default (nonVR) camera.
    NonVRCamera.setup();

    // Optimize the scene to make it run better.
    Optimizations.setup();

    // For debugging...
    // trackDebugSphere();
}
