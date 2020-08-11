import {VueComponentParent} from "../VueComponentParent";

// @ts-ignore
import templateHtml from "./SuperFileComponent.template.htm";

export class SuperFileComponent extends VueComponentParent {
    public tag = "super-file";
    public methods = {};

    public computed = {};

    public props = {
        "name": {"required": true},
        "label": {"required": true},
        "placeholder": {"required": true},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {}
}
