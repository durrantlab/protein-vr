// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import * as Parent from "../LoadSaveParent";
import * as LoadSaveUtils from "../LoadSaveUtils";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";

export class LoadLocalFile extends Parent.LoadSaveParent {
    public pluginTitle = "File<div class='emoji'>📂</div>";
    public pluginSlug = "load-local-file";
    public tag = "load-local-file-panel";

    public computed = {
        /**
         * Gets the file type of the currenttly loaded file.
         * @returns string  The type.
         */
        "fileType"(): string {
            return LoadSaveUtils.getFilenameExtension(
                this["fileName"]
            );
        }
    };

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            "fileContents": undefined,
            "fileName": undefined
        };
    }

    public methods = {
        /**
         * Runs when the file is loaded. Just updates the fileContents
         * variable.
         * @param  {*} data  File information. data.fileContents and data.fileName;
         * @returns void
         */
        "fileLoaded"(data: any): void {
            this["fileContents"] = data.fileContents;
            this["fileName"] = data.fileName;
        },

        /**
         * Starts the load process on button click.
         * @returns void
         */
        "startLoad"(): void {
            this.startLoadOrSave({
                fileName: this["fileName"],
                fileContents: this["fileContents"]
            });
        },

        /**
         * Runs when the user starts the load process.
         * @param  {*}  data  Any data to pass to the load/save process. In
         *                    this context, data.fileName and
         *                    data.fileContents.
         * @returns void
         */
        startLoadOrSave(data: any): void {
            LoadSaveUtils.shadowsHardwareScalingVueXToLocalStorage();

            let ext = LoadSaveUtils.getFilenameExtension(data.fileName);
            if (ext === ".PVR") {
                LoadSaveUtils.loadPvrFromFile(data.fileContents);
            } else {
                LoadSaveUtils.loadPdbOrSdfFromFile(data.fileContents);
            }
        }
    };

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};

    public props = {
        // "title": {"default": ""},
    };

    public template = templateHtml;

    public vueXStore = {
        state: {
            "fileContent": undefined,
            "fileType": undefined
        },
        mutations: {}
    }

    public watch = {};
}
