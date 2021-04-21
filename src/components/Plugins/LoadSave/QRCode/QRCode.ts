// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as Parent from "../LoadSaveParent";
// import * as VRML from "../../../Mols/3DMol/VRML";
// import { addVueXStoreParam, store } from "../../../Vars/VueX/VueXStore";
// import * as SimpleModalComponent from "../../../UI/Vue/Components/OpenPopup/SimpleModalComponent";
// import * as LoadSaveUtils from "../LoadSaveUtils";
import * as LazyLoadJS from "../../../System/LazyLoadJS";
import * as UrlVars from "../../../Vars/UrlVars";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";
import { storeOutsideVue } from "../../../Vars/VueX/VueXStore";
import { downloadBlob } from '../LoadSaveUtils';
import { StatusComponent, setStatus } from '../../../UI/Vue/Components/StatusComponent';

declare var QRCode;

export class SaveQRCode extends Parent.LoadSaveParent {
    public pluginTitle = "QR<div class='emoji'>💾</div>";
    public pluginSlug = "proteinvr-qr-code";
    public tag = "proteinvr-qr-code-panel";

    public methods = {
        /**
         * Start the save process.
         * @returns void
         */
        "startSave"(): void {
            let filename = this["qrCodeFileName"];
            if (filename.slice(filename.length - 4) !== ".png") {
                filename = filename + ".png";
                this["qrCodeFileName"] = filename;  // Update UI
            }

            this["btnTxt"] = "Saving...";
            this["btnDisabled"] = true;

            // Good to wait a bit in case you need to update qrCodeFileName.
            setTimeout(() => {
                this.startLoadOrSave(filename);
                this.$store.commit("setVar", {
                    moduleName: "loadSaveModal",
                    varName: "showLoadSaveModal",
                    val: false
                });
                setTimeout(() => {
                    this["btnTxt"] = "Save PNG File";
                    this["btnDisabled"] = false;
                }, 1000);
            }, 1000);
        },

        /**
         * Runs when the user starts the save process. Most parameters should be
         * accessed as class variables.
         * @param  {*} [qrCodeFileName=undefined]  The name of the file to save.
         * @returns void
         */
        startLoadOrSave(qrCodeFileName: any = undefined): void {
            this.saveQRCode(qrCodeFileName);  // , fileType, urlParamData);
        },

        /**
         * Function that saves a QR Code file of the current scene.
         * @param  {string} qrCodeFileName  The file name.
         * @param  {*}      urlParamData      URL parameters to also save to the
         *                                    file.
         */
        saveQRCode(qrCodeFileName: string, urlParamData: any) {
            // Need to convert data url to blob. See
            // https://stackoverflow.com/questions/46405773/saving-base64-image-with-filesaver-js/46406124

            // convert base64 to raw binary data held in a string
            let dataURI = storeOutsideVue.state["proteinvrQrCodePanel"]["imgSrc"];
            var byteString = atob(dataURI.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);

            // create a view into the buffer
            var ia = new Uint8Array(ab);

            // set the bytes of the buffer to the correct values
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }

            // write the ArrayBuffer to a blob, and you're done
            var blob = new Blob([ab], {type: mimeString});

            downloadBlob(blob, qrCodeFileName).then(() => {
                setStatus("QR download");
            });
        },

        /**
         * Fires when the pdb or url changes.
         * @param  {string} val  The new value.
         * @returns void
         */
        "onChange"(val: string): void {
            this["qrCodeFileName"] = val;
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
        onTabHeaderClick(): void {
            // First, make sure you can even use a qr code.
            // see https://github.com/microsoft/TypeScript/issues/30933
            let data = UrlVars.getAllUrlParams(window.location.href, true);
            let urlParamData = {};
            for (let k of data.keys()) {
                urlParamData[k] = data.get(k);
            }

            // Get the remote file.
            let url = urlParamData["s"];

            if (url === "LOCALFILE") {
                // Can't use the code. It's a local file.
                storeOutsideVue.commit("setVar", {
                    moduleName: "proteinvrQrCodePanel",
                    varName: "canUseQRCode",
                    val: false
                });
                return;
            }

            // Can use a code. Load it up and generate.
            storeOutsideVue.commit("setVar", {
                moduleName: "proteinvrQrCodePanel",
                varName: "canUseQRCode",
                val: true
            });

            let urlToUse =
                window.location.origin
                + window.location.pathname
                + "?"
                + Object.keys(urlParamData).map(
                    k => k + "=" + encodeURIComponent(urlParamData[k])
                ).join("&");

            LazyLoadJS.lazyLoadJS("./js/qrcode.min.js")
            .then(() => {
                window["QRCode"]["toDataURL"](urlToUse, function (err, url) {
                    storeOutsideVue.commit("setVar", {
                        moduleName: "proteinvrQrCodePanel",
                        varName: "imgSrc",
                        val: url
                    });
                });
            });
        }
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "imgSrc": undefined,
            "canUseQRCode": true
        },
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            "qrCodeFileName": "my-scene.png",
            "btnTxt": "Save PNG File",
            "btnDisabled": false,
            "imgSrc": ""
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
