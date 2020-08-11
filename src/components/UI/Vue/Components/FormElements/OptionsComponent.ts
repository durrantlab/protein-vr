import {VueComponentParent} from "../../VueComponentParent";
import {store} from "../../VueX/VueXStore";

// @ts-ignore
import templateHtml from "./OptionsComponent.template.htm";

export class FormOptionsComponent extends VueComponentParent {
    public tag = "form-options";
    public methods = {};

    public computed = {
        "selectedVal": {
            get: function(): string {
                return this["selected"];
            },
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

    public data = function(): any {
        return {
            // "selectedVal": "",
        };
    }

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
