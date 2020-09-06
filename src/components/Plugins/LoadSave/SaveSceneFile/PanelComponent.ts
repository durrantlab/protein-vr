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
    public tag = "proteinvr-save-scene-panel";
    public methods = {
        /**
         * Start the save process.
         * @returns void
         */
        "startSave"(): void {
            let filename = this["pvrSceneFileName"];
            if (filename.slice(filename.length - 4) !== ".pvr") {
                filename = filename + ".pvr";
                this["pvrSceneFileName"] = filename;  // Update UI
            }

            this["btnTxt"] = "Saving...";
            this["btnDisabled"] = true;

            // Good to wait a bit in case you need to update pvrSceneFileName.
            setTimeout(() => {
                associatedPlugin._startSave(filename);
                this.$store.commit("setVar", {
                    moduleName: "loadSaveModal",
                    varName: "showLoadSaveModal",
                    val: false
                });
                setTimeout(() => {
                    this["btnTxt"] = "Save PVR File";
                    this["btnDisabled"] = false;
                }, 1000);
            }, 1000);
        },

        /**
         * Fires when the pdb or url changes.
         * @param  {string} val  The new value.
         * @returns void
         */
        "onChange"(val: string): void {
            this["pvrSceneFileName"] = val;
        },

        /**
         * Detects when key is pressed.
         * @returns void
         */
        "onEnter"(): void {
            this["startSave"]();
        },
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
            "pvrSceneFileName": "my-scene.pvr",
            "btnTxt": "Save PVR File",
            "btnDisabled": false
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
