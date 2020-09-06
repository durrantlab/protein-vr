import {VueComponentParent} from "../../../UI/Vue/Components/VueComponentParent";

// @ts-ignore
import {templateHtml} from "./ReplaceWarningComponent.template.htm.ts";

declare var jQuery;

export class ReplaceWarningComponent extends VueComponentParent {
    public tag = "replace-warning";
    public methods = {};

    public computed = {
        "showWarning": {
            /**
             * Gets the showWarning variable.
             * @returns boolean  The value.
             */
            get: function(): boolean {
                return this.$store.state["replaceWarning"]["showWarning"];
            },

            /**
             * Sets the showWarning variable.
             * @param  {boolean} val  The new value.
             * @returns void
             */
            set: function(val: boolean): void {
                this.$store.commit("setVar", {
                    moduleName: "replaceWarning",
                    varName: "showWarning",
                    val: val
                });
            }
        }
    };

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "showWarning": false
        },
        mutations: {

        }
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
