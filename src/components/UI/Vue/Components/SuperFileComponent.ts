// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import {VueComponentParent} from "./VueComponentParent";

// @ts-ignore
import {templateHtml} from "./SuperFileComponent.template.htm.ts";

export class SuperFileComponent extends VueComponentParent {
    public tag = "super-file";
    public methods = {
        /**
         * Opens the open-file dialogue.
         * @param  {*} e  Click event.
         * @returns boolean  Always false.
         */
        "openFileInput"(e: any): boolean {
            let fileInput = this.$refs[this["name"] + "-file-input"];
            fileInput.click();

            // Cancel the click.
            e.preventDefault();
            return false;
        }
    };

    public computed = {};

    public props = {
        "name": {"required": true},
        "label": {"required": true},
        "placeholder": {"required": true},
        "accept": {"default": undefined}
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            "filename": ""
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {
        let fileInput = this.$refs[this["name"] + "-file-input"];
        fileInput.addEventListener("change", (e) => {
            // because the way it's setup, there is only one file.
            let fileName = fileInput["files"][0].name;
            this["filename"] = fileName;

            let input = e.target;
            let reader = new FileReader();
            reader.onloadend = (file) => {
                let txt = reader.result;
                this["$emit"]("fileLoaded", {
                    fileName: fileName,
                    fileContents: txt
                });
            };
            reader.readAsText(input["files"][0]);
        });
    }
}
