// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as Parent from "../LoadSaveParent";
import * as VRML from "../../../Mols/3DMol/VRML";
import { store } from "../../../Vars/VueX/VueXStore";
import * as SimpleModalComponent from "../../../UI/Vue/Components/OpenPopup/SimpleModalComponent";
import * as LoadSaveUtils from "../LoadSaveUtils";
import * as UrlVars from "../../../Vars/UrlVars";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";
import { downloadTxtFile } from '../LoadSaveUtils';

export class SaveSceneFile extends Parent.LoadSaveParent {
    public pluginTitle = "Scene<div class='emoji'>💾</div>";
    public pluginSlug = "proteinvr-save-scene";
    public tag = "proteinvr-save-scene-panel";

    public methods = {
        /**
         * Start the save process.
         * @returns void
         */
        "startSave"(): void {
            let filename = this["pvrSceneFileName"];
            // Note that saving to .pvr.json not supported. Only loading.
            if (filename.slice(filename.length - 4) !== ".pvr") {
                filename = filename + ".pvr";
                this["pvrSceneFileName"] = filename;  // Update UI
            }

            this["btnTxt"] = "Saving...";
            this["btnDisabled"] = true;

            // Good to wait a bit in case you need to update pvrSceneFileName.
            setTimeout(() => {
                this.startLoadOrSave(filename);
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
         * Runs when the user starts the save process. Most parameters should be
         * accessed as class variables.
         * @param  {*} [pvrSceneFileName=undefined]  The name of the file to save.
         * @returns void
         */
        startLoadOrSave(pvrSceneFileName: any = undefined): void {
            LoadSaveUtils.shadowsHardwareScalingVueXToLocalStorage();

            // see https://github.com/microsoft/TypeScript/issues/30933
            let data = UrlVars.getAllUrlParams(window.location.href, true);
            let urlParamData = {};
            for (let k of data.keys()) {
                urlParamData[k] = data.get(k);
            }

            // Get the remote file to embed in the json.
            let url = urlParamData["s"];

            if (url === "LOCALFILE") {
                // No remote url to load. So look at data in memory.

                // First, make sure you can proceed.
                if ((store.state["loadLocalFilePanel"]["fileContent"] === undefined) ||(store.state["loadLocalFilePanel"]["fileType"] === undefined)) {
                    store.commit("setVar", {
                        moduleName: "loadSaveModal",
                        varName: "showLoadSaveModal",
                        val: false
                    });

                    SimpleModalComponent.openSimpleModal({
                        title: "Error Saving PVR File",
                        content: "Couldn't save PVR file due to an unrecoverable error. Sorry for the inconvenience! Please restart the ProteinVR app if you need to save your scene.",
                        hasCloseBtn: true,
                        unclosable: false
                    }, false);
                } else {
                    this.savePVRFile(
                        pvrSceneFileName,
                        store.state["loadLocalFilePanel"]["fileContent"],
                        store.state["loadLocalFilePanel"]["fileType"],
                        urlParamData
                    );
                }
            } else {
                // So there is an available url. Load the data from the remote
                // source.
                jQuery.ajax(url, {
                    /**
                     * When the url data is retrieved.
                     * @param  {string} data  The remote data.
                     * @returns void
                     */
                    "success": (fileContent: string): void => {
                        let fileType = urlParamData["s"].split(".").pop().toLowerCase();
                        this.savePVRFile(pvrSceneFileName, fileContent, fileType, urlParamData);
                    },

                    /**
                     * If there's an error...
                     * @param  {*}       hdr
                     * @param  {*}       status
                     * @param  {string}  err
                     */
                    "error": (hdr: any, status: any, err: any) => {
                        // TODO: need to test below...
                        VRML.showLoadMoleculeError(hdr, status, err, url);
                    },
                });
            }
        },


        /**
         * Function that saves a PVR file of the current scene.
         * @param  {string} pvrSceneFileName  The file name.
         * @param  {string} fileContent       The contents of the loaded molecule
         *                                    (PDB or SDF).
         * @param  {string} fileType          The type of file. pdb or sdf.
         * @param  {*}      urlParamData      URL parameters to also save to the
         *                                    file.
         */
        savePVRFile(pvrSceneFileName: string, fileContent: string, fileType: string, urlParamData: any) {
            urlParamData["scene"] = {
                "file": fileContent,
                "type": fileType
            }

            // s is the url. Good to remove that.
            delete urlParamData["s"];

            downloadTxtFile(JSON.stringify(urlParamData), pvrSceneFileName);
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

        /**
         * Runs when the tab header is clicked.
         * @returns void
         */
        onTabHeaderClick(): void {}
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
