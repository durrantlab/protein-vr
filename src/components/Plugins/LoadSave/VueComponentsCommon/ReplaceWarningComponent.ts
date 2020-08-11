import {VueComponentParent} from "../../../UI/Vue/VueComponentParent";

// @ts-ignore
import templateHtml from "./ReplaceWarningComponent.template.htm";

declare var jQuery;

export class ReplaceWarningComponent extends VueComponentParent {
    public tag = "replace-warning";
    public methods = {};

    public computed = {
        "showWarning": {
            get: function(): boolean {
                return this.$store.state["replaceWarning"]["showWarning"];
            },
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

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {};
}
