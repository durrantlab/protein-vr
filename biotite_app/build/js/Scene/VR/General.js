// This module handles changes that apply regardless of the mode chosen (VR
// vs. non-VR).
define(["require", "exports", "./Navigation", "./Pickables", "./UI"], function (require, exports, Navigation, Pickables, UI) {
    "use strict";
    exports.__esModule = true;
    function setup() {
        // Set up the floor mesh (hidden).
        Navigation.setup();
        // Setup function to manage pickable objects (e.g., floor).
        Pickables.setup();
        // Sets up nav selection buttons in DOM.
        UI.setup();
    }
    exports.setup = setup;
});
