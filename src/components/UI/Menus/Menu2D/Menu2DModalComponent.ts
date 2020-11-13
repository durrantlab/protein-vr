// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import {VueComponentParent} from "../../Vue/Components/VueComponentParent";
import * as Menu3D from "../Menu3D/Menu3D";

// @ts-ignore
import {templateHtml} from "./Menu2DModalComponent.template.htm.ts";

export class Menu2DModalComponent extends VueComponentParent {
    public tag = "menu-2d-modal";
    public methods = {
        /**
         * Runs once the modal has opened.
         * @returns void
         */
        "onReady"(): void {
            // Now that it's open, pull the Menu2D information into the VueX
            // store so it becomes reactive. Note that you're only pulling the
            // top-level stuff here, because the rest will be populated as you
            // click on the elements in the 2D menu. Menu3D.
            let menuInfToUse = {}
            for (var key in Menu3D.menuInf) {
                if (Menu3D.menuInf.hasOwnProperty(key)) {
                    menuInfToUse[key] = {};
                }
            }

            this.$store.commit("setVar", {
                moduleName: "menu2dModal",
                varName: "menuInf",
                val: menuInfToUse
            });
        },

        /**
         * Runs once the modal has closed.
         * @returns void
         */
        "onClose"(): void {
            // You need to update the store now that it's closed. There must
            // be a more elegant way of doing this...
            this.$store.commit("setVar", {
                moduleName: "menu2dModal",
                varName: "showMenu2DModal",
                val: false
            });
        }
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "showMenu2DModal": false,
            "menuInf": {}
        },
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {};
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
