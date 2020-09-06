import {VueComponentParent} from "../../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./TabsComponent.template.htm.ts";

export class TabsComponent extends VueComponentParent {
    public tag = "tabs";
    public methods = {};

    public computed = {};

    public props = {
        "name": {"required": true},
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
