import {VueComponentParent} from "../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./InputWrapperComponent.template.htm.ts";

export class FormInputWrapperComponent extends VueComponentParent {
    public tag = "form-input-wrapper";
    public methods = {};

    public computed = {};

    public props = {};

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
