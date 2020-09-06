import {VueComponentParent} from "../../../UI/Vue/Components/VueComponentParent";
import {store} from "../../../Vars/VueX/VueXStore";

// @ts-ignore
import {templateHtml} from "./ShadowsHardwareScalingComponent.template.htm.ts";

declare var jQuery;

export class ShadowsHardwareScalingComponent extends VueComponentParent {
    public tag = "shadows-hardware-scaling";
    public methods = {
        /**
         * Runs when the hardware scaling value changes.
         * @param  {boolean} val  The new value.
         * @returns void
         */
        "onChangeHardwareScaling"(val: boolean): void {
            store.commit("setVar", {
                moduleName: "shadowsHardwareScaling",
                varName: "useHardwareScaling",
                val: val
            });
        },

        /**
         * Runs when the useShadows value changes.
         * @param  {boolean} val  The new value.
         * @returns void
         */
        "onChangeShadows"(val: boolean): void {
            store.commit("setVar", {
                moduleName: "shadowsHardwareScaling",
                varName: "useShadows",
                val: val
            });
        }
    };

    public computed = {
        /**
         * Whether or not the hardware scaling options should be visible.
         * @returns boolean  true if should be hidden.
         */
        "hideHrdScle"(): boolean {
            return !this.$store.state["shadowsHardwareScaling"]["showHardwareScaling"];
        }
    };

    public props = {
        "pluginSlug": {"default": ""},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "showHardwareScaling": false,
            "useHardwareScaling": true,
            "useShadows": false
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
