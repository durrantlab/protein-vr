// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import * as Parent from "../LoadSaveParent";
import { store } from "../../../Vars/VueX/VueXStore";
import * as SimpleModalComponent from "../../../UI/Vue/Components/OpenPopup/SimpleModalComponent";
import * as LoadSaveUtils from "../LoadSaveUtils";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";

export class LoadRemoteFile extends Parent.LoadSaveParent {
    // private urlOrPDB;
    private environmentSelect: HTMLElement;

    public pluginTitle = "Web<div class='emoji'>📂</div>";
    public pluginSlug = "load-remote-file";
    public tag = "load-remote-file-panel";
    public methods = {
        /**
         * Runs when the user submits the PDB/URL buton. Starts the load/save
         * process.
         * @returns void
         */
        "submitPDBUrl"(): void {
            this.startLoadOrSave();
        },

        /**
         * Runs when the user starts the load process.
         * @param  {*} [data=undefined]  Any data to pass to the load/save
         *                               process.
         * @returns void
         */
        startLoadOrSave(data: any = undefined): void {
            LoadSaveUtils.shadowsHardwareScalingVueXToLocalStorage();

            // Get the form values.
            let url = store.state["loadRemoteFilePanel"]["urlOrPDB"];

            // Save them so they are the same when you reload. Decided not to save
            // url for security reasons (could be proprietary).
            // localStorage.setItem('url', url);

            // Construct the redirect url and redirect.
            let ext = LoadSaveUtils.getFilenameExtension(url);

            if (ext === ".PVR") {
                // Load the remove pvr file here.
                jQuery.ajax( url, {

                    /**
                     * When the url data is retrieved.
                     * @param  {string} data  The remote data.
                     * @returns void
                     */
                    "success": (pvrFileData: string): void => {
                        LoadSaveUtils.loadPvrFromFile(pvrFileData);
                    },

                    /**
                     * If there's an error...
                     * @param  {*}       hdr
                     * @param  {*}       status
                     * @param  {string}  err
                     */
                    "error": (hdr: any, status: any, err: any) => {
                        SimpleModalComponent.openSimpleModal({
                            title: "Error Loading Molecule",
                            content: "Could not load molecule from URL: " + url,
                            hasCloseBtn: true,
                            unclosable: false
                        }, false);
                    },
                });
            } else {
                let params = {"s": url};
                window.location.href = LoadSaveUtils.makeUrl(params);
            }
        },

        /**
         * Fires when the pdb or url changes.
         * @param  {string} val  The new value.
         * @returns void
         */
        "onChangePDBUrl"(val: string): void {
            // Trim
            val = val.replace(/^\s+|\s+$/g, "");

            this.setUrlOrPDBToVueX(val);

            let ext = LoadSaveUtils.getFilenameExtension(val);

            // If it ends in .pvr, then hide environment selector.
            this["showEnvironmentSelector"] = ext !== ".PVR";

            this["loadBtnDisabled"] = (
                (ext !== ".PDB") && (ext !== ".SDF") &&
                (ext !== ".PVR") && (val.length !== 4)
            );
        },

        /**
         * Saves the user-provided url or pdb id to the VueX store.
         * @param  {string} val  The url or pdb id.
         * @returns void
         */
        setUrlOrPDBToVueX(val: string): void {
            store.commit("setVar", {
                moduleName: "loadRemoteFilePanel",
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
            this["onChangePDBUrl"](s);

            // if ((s.slice(0, 4) === "http") || (s.indexOf(".sdf") !== -1)) {
            //     window.open(s, '_blank');
            // }
        },

        /**
         * Detects when key is pressed.
         * @returns void
         */
        "onEnter"(): void {
            this["submitPDBUrl"]();
        },
    };

    public computed = {
        "urlOrPDB": {
            /**
             * Gets the url or pdb id.
             * @returns string
             */
            get: function (): string {
                return this.$store.state["loadRemoteFilePanel"]["urlOrPDB"];
            },

            /**
             * Sets the url or pdb id.
             * @param  {string} val  The new url or pdb.
             * @returns void
             */
            set: function (val: string): void {
                this.setUrlOrPDBToVueX(val);
            }
        }
    };

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
        return {
            "showEnvironmentSelector": true,
            "loadBtnDisabled": true
        };
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
