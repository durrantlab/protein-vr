// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import * as ComponentsLoadAll from "./Components/LoadAllVue";
import * as Menu2DLoadAll from "../Menus/Menu2D/LoadAllVue";
import { store, setStoreOutsideVue } from "../../Vars/VueX/VueXStore";
import * as PromiseStore from "../../PromiseStore";

declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    PromiseStore.setPromise(
        "SetupVue", [],
        (resolve) => {
            ComponentsLoadAll.load();

            // Registers the 2d menu view components. Not sure why this isn't
            // loaded from ComponentsLoadAll.load()...
            Menu2DLoadAll.load();

            // Create the base Vue component.
            new Vue({
                "el": '#vue-app',
                // "store": Store.store,
                "template": `
                <div style="height:0;">
                    <front></front>
                    <load-save-modal></load-save-modal>
                    <menu-2d-modal></menu-2d-modal>
                    <simple-modal></simple-modal>
                    <status></status>
                </div>
                `,
                "store": store,

                /**
                 * Function that runs when Vue component loaded.
                 */
                "mounted"() {
                    setStoreOutsideVue(this.$store);
                }
            });

            resolve();
        }
    );
}
