// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import {VueComponentParent} from "../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./CheckboxComponent.template.htm.ts";

export class FormCheckboxComponent extends VueComponentParent {
    public tag = "form-checkbox";
    public methods = {};

    public computed = {
        "isChecked": {
            /**
             * Gets the isChecked value.
             * @returns boolean  The value.
             */
            get: function(): boolean {
                return this["checked"];
            },

            /**
             * Sets the isChecked value.
             * @param  {boolean} val  The new value.
             * @returns void
             */
            set: function(val: boolean): void {
                this.$emit('change', val);
            }
        }
    };

    public props = {
        "id": {"required": true},
        "label": {"required": true},
        "hidden": {"required": true},
        "helpMsg": {"required": true},
        "checked": {"default": false}
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
    public mounted = function(): void {}
}
