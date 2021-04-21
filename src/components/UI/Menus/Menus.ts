// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as PromiseStore from "../../PromiseStore";
import * as Vars from "../../Vars/Vars";
import * as Menu3D from "./Menu3D/Menu3D";
import { loadInitialPartialMenuData } from "../Menus/Menu2D/Menu2DDisplayComponent";
// import * as UI2D from "./UI2D/UI2D";

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

            // Populate partial 2D data into the 2D vuejs menu system.
            loadInitialPartialMenuData();

            resolve();
        }
    )
}

export function smartSort(lst: string[]): void {
    let t = lst[0].match(/\[([0-9]+?)\-([0-9]+?)\]/);
    if (t === null) {
        // Just sort alphabetically
        lst.sort();
    } else {
        // It's numbers like [213-123].
        lst.sort(function(a, b): number {
            let aMatch = a.match(/\[([0-9]+?)\-([0-9]+?)\]/);
            let bMatch = b.match(/\[([0-9]+?)\-([0-9]+?)\]/);
            if ((aMatch === null) || (bMatch === null)) {
                return 0;
            }
            let a2 = parseInt(aMatch[1]);
            let b2 = parseInt(bMatch[1]);
            if (a2 < b2) { return -1; }
            if (a2 > b2) { return 1; }
            return 0;
        });
    }
}
