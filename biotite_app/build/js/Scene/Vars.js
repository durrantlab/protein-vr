// A place to put variables that need to be accessed from multiple places.
define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    exports.renderLoopFuncs = [];
    function setup() {
        exports.canvas = document.getElementById("renderCanvas");
        // Generate the BABYLON 3D engine
        exports.engine = new BABYLON.Engine(exports.canvas, true);
        exports.engine.enableOfflineSupport = false; // no manifest errors
        exports.scene = new BABYLON.Scene(exports.engine);
    }
    exports.setup = setup;
    function setScene(newScene) {
        exports.scene = newScene;
    }
    exports.setScene = setScene;
});
