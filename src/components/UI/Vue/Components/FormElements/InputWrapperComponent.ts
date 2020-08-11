import {VueComponentParent} from "../../VueComponentParent";

// @ts-ignore
import templateHtml from "./InputWrapperComponent.template.htm";

export class FormInputWrapperComponent extends VueComponentParent {
    public tag = "form-input-wrapper";
    public methods = {};

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {}
}
