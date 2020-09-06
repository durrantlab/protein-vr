import { VueComponentParent } from "../../../UI/Vue/Components/VueComponentParent";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";
import { LoadSaveParent } from "../LoadSaveParent";

export let associatedPlugin: LoadSaveParent;
/**
 * Sets the associatedPlugin global variable.
 * @param  {*} plugin  The plugin. Of type LoadSaveParent.
 * @returns void
 */
export function setAssociatedPlugin(plugin: LoadSaveParent): void {
    associatedPlugin = plugin;
}

export class PanelComponent extends VueComponentParent {
    public tag = "new-panel";
    public methods = {
        /**
         * Starts the new-scene process on button click.
         * @returns void
         */
        "submitNew"(): void {
            associatedPlugin._startLoad();
        }
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {},
        mutations: {}
    }

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
    public mounted = function(): void {};
}
