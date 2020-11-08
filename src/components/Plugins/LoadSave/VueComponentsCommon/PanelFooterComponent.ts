import {VueComponentParent} from "../../../UI/Vue/Components/VueComponentParent";
import * as Vars from "../../../Vars/Vars";

// @ts-ignore
import {templateHtml} from "./PanelFooterComponent.template.htm.ts";

declare var jQuery;

export class PanelFooterComponent extends VueComponentParent {
    public tag = "panel-footer";
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
        return {
            "version": Vars.VERSION
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {
        this["version"] = Vars.VERSION;
    };
}
