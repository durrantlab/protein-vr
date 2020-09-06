import {VueComponentParent} from "../../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./TabItemComponent.template.htm.ts";

export class TabItemComponent extends VueComponentParent {
    public tag = "tab-item";
    public methods = {};

    public computed = {};

    public props = {
        "pluginSlug": {"required": true},
        "activeClass": {
            "type": Boolean,
            "default": false
        },
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
