import { VueComponentParent } from "../../../UI/Vue/Components/VueComponentParent";
import { store } from "../../../Vars/VueX/VueXStore";

declare var jQuery;

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
    public tag = "pdb-url-panel";
    public methods = {
        /**
         * Runs when the user submits the PDB/URL buton. Starts the load/save
         * process.
         * @returns void
         */
        "submitPDBUrl"(): void {
            associatedPlugin._startLoad();
        },

        /**
         * Fires when the pdb or url changes.
         * @param  {string} val  The new value.
         * @returns void
         */
        "onChangePDBUrl"(val: string): void {
            store.commit("setVar", {
                moduleName: "pdbUrlPanel",
                varName: "urlOrPDB",
                val: val
            });
        },

        /**
         * Sets the user-specified pdb or url.
         * @param  {string} s  The pdb or url.
         * @returns void
         */
        "setUrl"(s: string): void {
            store.commit("setVar", {
                moduleName: "pdbUrlPanel",
                varName: "urlOrPDB",
                val: s
            });

            if ((s.slice(0, 4) === "http") || (s.indexOf(".sdf") !== -1)) {
                window.open(s, '_blank');
            }
        },

        /**
         * Detects when key is pressed.
         * @returns void
         */
        "onEnter"(): void {
            this["submitPDBUrl"]();
        },
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "urlOrPDB": "",
        },
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
    public mounted = function(): void {
        // Set focus when the modal opens.
        jQuery("#load-save-modal").on('shown.bs.modal', function (e) {
            document.getElementById('urlOrPDB').focus();
        });
    };
}
