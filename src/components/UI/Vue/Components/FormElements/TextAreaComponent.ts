import {VueComponentParent} from "../VueComponentParent";
import {store} from "../../../../Vars/VueX/VueXStore";

// @ts-ignore
import {templateHtml} from "./TextAreaComponent.template.htm.ts";

export class TextAreaComponent extends VueComponentParent {
    public tag = "text-area";
    public methods = {
        /**
         * Runs when the key is pressed.
         * @param  {KeyboardEvent} e  The key information.
         * @returns void
         */
        "onKeyPress"(e: KeyboardEvent): void {
            this.$emit("keypress", e);
        },
    };

    public computed = {
        "valueGetSet": {
            /**
             * Gets the valueGetSet variable.
             * @returns boolean  The value.
             */
            get: function(): boolean {
                return this["value"];
            },

            /**
             * Sets the valueGetSet variable.
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
        "placeholder": {"required": true},
        "value": {"required": true}
        // Note that label is in slot.
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
