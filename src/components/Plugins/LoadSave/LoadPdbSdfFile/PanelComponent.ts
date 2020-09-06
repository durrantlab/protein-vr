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
    public tag = "load-pdb-sdf-panel";
    public methods = {
        /**
         * Runs when the file is loaded. Just updates the fileContents
         * variable.
         * @param  {string} txt  The new fileContents value.
         * @returns void
         */
        "fileLoaded"(txt: string): void {
            this["fileContents"] = txt;
        },

        /**
         * Starts the load process on button click.
         * @returns void
         */
        "startLoad"(): void {
            associatedPlugin._startLoad(this["fileContents"]);
        },
    };

    public computed = {};

    public props = {
        // "title": {"default": ""},
    };

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
            "fileContents": undefined
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
