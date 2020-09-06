import {VueComponentParent} from "../../../UI/Vue/Components/VueComponentParent";
// import {ParentLoadSaveVueComponent} from "../NOUSE.ParentLoadSaveVueComponent";

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
    public tag = "pdb-sdf-text-panel";
    public methods = {
        /**
         * Starts the load process on button click.
         * @returns void
         */
        "startLoad"(): void {
            associatedPlugin._startLoad(this["fileContents"]);
        },

        /**
         * Fires when the pdb or url text changes.
         * @param  {string} txt  The new text.
         * @returns void
         */
        "onChangeText"(txt: string): void {
            this["fileContents"] = txt;
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
        return {
            "fileContents": ""
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
