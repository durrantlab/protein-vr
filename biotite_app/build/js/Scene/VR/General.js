// This module handles changes that apply regardless of the mode chosen (VR
// vs. non-VR).
define(["require", "exports", "./Navigation", "./UI"], function (require, exports, Navigation, UI) {
    "use strict";
    exports.__esModule = true;
    function setup() {
        // Setup the navigation mesh (the mesh where you look or point with the
        // controllers).
        // NavTargetMesh.setup();
        // Set up the floor mesh (hidden).
        Navigation.setup();
        // Sets up nav selection buttons in DOM.
        UI.setup();
    }
    exports.setup = setup;
});
