import {VueComponentParent} from "../../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./TabsHeaderItemComponent.template.htm.ts";

export class TabsHeaderItemComponent extends VueComponentParent {
    public tag = "tabs-header-item";
    public methods = {};

    public computed = {};

    public props = {
        "activeClass": {
            "type": Boolean,
            "default": false

        },
        "pluginSlug": {"required": true},
        // "pluginTitle": {"required": true},
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
