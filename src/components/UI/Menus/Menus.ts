// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

import * as PromiseStore from "../../PromiseStore";
import * as Vars from "../../Vars/Vars";
import * as Menu3D from "./Menu3D/Menu3D";
// import * as UI2D from "./UI2D/UI2D";
import * as LoadAll from "../Vue/LoadAllVue";

/**
 * Sets up pthe menus.
 * @returns void
 */
export function runSetupMenus(): void {
    // Note that this is before molecule is loaded via 3dmoljs. Those
    // functions will add to the menu, so it needs to be setup first.
    PromiseStore.setPromise(
        "SetupMenus", ["LoadBabylonScene", "InitVR"],
        (resolve) => {
            // Load from a pdb file via 3Dmoljs.
            if (Vars.vrVars.menuActive) {
                Menu3D.setup();  // This populates Menu3D.menuInf.
            }

            // Sets up nav selection buttons in DOM... including the 2D menu
            // that mirrors the 3D menu.
            // UI2D.setup();
            LoadAll.load();


            resolve();
        }
    )
}
