import {VueComponentParent} from "../../VueComponentParent";

// @ts-ignore
import templateHtml from "./ButtonComponent.template.htm";

export class FormButtonComponent extends VueComponentParent {
    public tag = "form-button";
    public methods = {};

    public computed = {};

    public props = {
        "id": {"required": true},
        "cls": {
            "default": "primary"
        },
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {}
}
