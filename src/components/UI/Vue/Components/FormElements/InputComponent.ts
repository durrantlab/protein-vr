import {VueComponentParent} from "../../VueComponentParent";
import {store} from "../../VueX/VueXStore";

// @ts-ignore
import templateHtml from "./InputComponent.template.htm";

export class FormInputComponent extends VueComponentParent {
    public tag = "form-input";
    public methods = {
        "onKeyPress"(e: KeyboardEvent): void {
            this.$emit("keypress", e);
        }
    };

    public computed = {
        "valueGetSet": {
            get: function(): boolean {
                return this["value"];
            },
            set: function(val: boolean): void {
                this.$emit('change', val);
            }
        }
    };

    public props = {
        "id": {"required": true},
        "placeholder": {"required": true},
        "type": {"default": "text"},
        "value": {"required": true}
        // Note that label is in slot.
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {}
}
