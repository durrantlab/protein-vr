// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import {VueComponentParent} from "../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./OptionsComponent.template.htm.ts";

export class FormOptionsComponent extends VueComponentParent {
    public tag = "form-options";
    public methods = {};

    public computed = {
        "selectedVal": {
            /**
             * Gets the selectedVal.
             * @returns string The value.
             */
            get: function(): string {
                return this["selected"];
            },

            /**
             * Sets the selectedVal.
             * @param  {string} val The value to set.
             * @returns void
             */
            set: function(val: string): void {
                // alert(val);
                // prob here
                // this["selectedVal"] = val;
                this.$emit('change', val);
            }
        }
    };

    public props = {
        "id": {"required": true},
        "options": {"required": true},
        "selected": {"required": true}

        // "label": {"required": true},
        // "hidden": {"required": true},
        // "helpMsg": {"required": true},
        // "checked": {"default": false}
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

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
    public mounted = function(): void {
        // Go through data and find first one that's selected.
        // for (let val of this["options"]) {
        //     if (val["selected"] === true) {
        //         this["selectedVal"] = val["value"];
        //         break;
        //     }
        // }
    }
}
