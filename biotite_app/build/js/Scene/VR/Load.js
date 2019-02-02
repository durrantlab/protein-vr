define(["require", "exports", "./General", "./NonVRCamera", "./Optimizations", "./Vars", "./VRCamera"], function (require, exports, General, NonVRCamera, Optimizations, Vars, VRCamera) {
    "use strict";
    exports.__esModule = true;
    /**
     * Set up the VR nav system. This is the "entry point."
     * @param  {Object} initParams The parameters.
     */
    function setup(initParams) {
        // Set up the parameters (filling in missing values, for example). Also
        // saves the modified params to the params module variable.
        Vars.setup(initParams);
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
    exports.setup = setup;
});
