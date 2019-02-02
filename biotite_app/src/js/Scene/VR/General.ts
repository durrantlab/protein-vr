// This module handles changes that apply regardless of the mode chosen (VR
// vs. non-VR).

import * as Navigation from "./Navigation";
// import * as NavTargetMesh from "./NavTargetMesh";
import * as UI from "./UI";

export function setup() {
    // Setup the navigation mesh (the mesh where you look or point with the
    // controllers).
    // NavTargetMesh.setup();

    // Set up the floor mesh (hidden).
    Navigation.setup();

    // Sets up nav selection buttons in DOM.
    UI.setup();
}
