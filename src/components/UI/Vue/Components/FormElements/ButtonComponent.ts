import {VueComponentParent} from "../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./ButtonComponent.template.htm.ts";

export class FormButtonComponent extends VueComponentParent {
    public tag = "form-button";
    public methods = {};

    public computed = {};

    public props = {
        "id": {"required": true},
        "cls": {
            "default": "primary"
        },
        "disabled": {
            "default": false
        }
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
