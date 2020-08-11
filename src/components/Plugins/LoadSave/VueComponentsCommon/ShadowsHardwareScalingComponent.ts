import {VueComponentParent} from "../../../UI/Vue/VueComponentParent";
import {store} from "../../../UI/Vue/VueX/VueXStore";

// @ts-ignore
import templateHtml from "./ShadowsHardwareScalingComponent.template.htm";

declare var jQuery;

export class ShadowsHardwareScalingComponent extends VueComponentParent {
    public tag = "shadows-hardware-scaling";
    public methods = {
        "onChangeHardwareScaling"(val) {
            store.commit("setVar", {
                moduleName: "shadowsHardwareScaling",
                varName: "useHardwareScaling",
                val: val
            });
        },
        "onChangeShadows"(val) {
            store.commit("setVar", {
                moduleName: "shadowsHardwareScaling",
                varName: "useShadows",
                val: val
            });
        }
    };

    public computed = {
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

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {};
}
