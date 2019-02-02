// This module is a place to store "global" variables.
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    /**
     * Modifies the parameters, adding in default values where values are missing,
     * for example. Also saves the updated params to the module-level params
     * variable.
     * @param  {*} initParams The initial parameters.
     */
    function setup(initParams) {
        // Make sure params.cameraHeight is defined.
        if (initParams.cameraHeight === undefined) {
            initParams.cameraHeight = 2;
        }
        // For debugging
        window.scene = initParams.scene;
        // Save the parameter to params (module-level variable).
        exports.vars = initParams;
    }
    exports.setup = setup;
});
