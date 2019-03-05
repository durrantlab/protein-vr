// This module handles changes that apply regardless of the mode chosen (VR
// vs. non-VR).

import * as Navigation from "./Navigation";
import * as Pickables from "./Pickables";
import * as UI from "./UI";

/**
 * Sets up general things that apply generally, regardless of the camera.
 * @returns void
 */
export function setup(): void {
    // Set up the floor mesh (hidden).
    Navigation.setup();

    // Setup function to manage pickable objects (e.g., floor).
    Pickables.setup();

    // Sets up nav selection buttons in DOM.
    UI.setup();
}
