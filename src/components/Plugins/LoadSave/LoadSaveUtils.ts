// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import { store } from "../../Vars/VueX/VueXStore";
import { lazyLoadJS } from '../../System/LazyLoadJS';

/**
 * Makes a URL string from the input parameters.
 * @param  {*} params  The input parameters.
 * @returns string
 */
export function makeUrl(params: any): string {
    let curUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;

    // Override shadows and hardware scaling, always.
    let hardwareScaling = store.state["shadowsHardwareScaling"]["useHardwareScaling"];
    let shadows = store.state["shadowsHardwareScaling"]["useShadows"];
    params["sh"] = shadows;
    params["hs"] = hardwareScaling;

    // If no environment is specified, get it from the VueX store.
    if (params["e"] === undefined) {
        let environ = store.state["selectEnvironment"]["environment"];

        // Save them so they are the same when you reload. Decided not to
        // save url for security reasons (could be proprietary).
        localStorage.setItem('environ', environ);

        params["e"] = environ;
    }

    let urlParams = Object.keys(params).map(
        k => k + "=" + encodeURIComponent(
            params[k].toString()
        )
    ).join("&");

    let newUrl = curUrl + "?" + urlParams;

    return newUrl;
}

/**
 * A common function used to load PDB and SDF text into the system.
 * @param  {string} fileContents          The contents of the file (PDB or
 *                                        SDF format).
 * @param  {string} [fileType=undefined]  The type of the file (pdb or
 *                                        sdf). Will be auto detected if
 *                                        not specified.
 * @param  {*}      [urlParams={}]        The url parameters also used to
 *                                        load the file.
 */
export function loadPdbOrSdfFromFile(fileContents: string, fileType: string = undefined, urlParams: any = {}) {
    if (fileType === undefined) {
        // Not specified, so try to figure it out from the file contents
        // themselves.
        if (fileContents.indexOf("\nATOM ") !== -1) {
            fileType = "pdb";
        } else if (fileContents.indexOf("\nHETATM ") !== -1) {
            fileType = "pdb";
        } else {
            fileType = "sdf";
        }
    }

    // here save data in dataToLoad to localstore to use on reload
    urlParams["s"] = "LOCALFILE";

    sessionStorage.setItem("fileContent", fileContents);
    sessionStorage.setItem("fileType", fileType);

    // Construct the redirect url and redirect.
    window.location.href = makeUrl(urlParams);
}

/**
 * Loads data from the data loaded from a PVR file.
 * @param  {string} pvrFileData  The data.
 * @returns void
 */
export function loadPvrFromFile(pvrFileData: string): void {
    let urlParams = JSON.parse(pvrFileData);
    let dataToLoad = urlParams["scene"];
    delete urlParams["scene"];

    loadPdbOrSdfFromFile(
        dataToLoad["file"], dataToLoad["type"], urlParams
    );
}

/**
 * Given a filename, return the filename's extension.
 * @param  {string} filename  The filename.
 * @returns string  The extension.
 */
export function getFilenameExtension(filename: string): string {
    if (filename === undefined) {
        return undefined;
    }

    // If it ends in .pvr.json, pretend it ends in .pvr.
    filename = filename.replace(/\.pvr\.json$/g, ".pvr");

    return filename.replace(
        /^\s+|\s+$/g, ""
    ).slice(filename.length - 4).toUpperCase();
}

/**
 * Copy data from vuex to local storage.
 * @returns void
 */
export function shadowsHardwareScalingVueXToLocalStorage(): void {
    // Update local storage with shado and hardware scaling values.

    // @ts-ignore
    var shadows = store.state["shadowsHardwareScaling"]["useShadows"];
    localStorage.setItem('shadows', shadows.toString());

    // @ts-ignore
    var hardwareScaling = store.state["shadowsHardwareScaling"]["useHardwareScaling"];
    localStorage.setItem('hardwareScaling', hardwareScaling.toString());
}

/**
 * Once component is ready, copy over data from local storage to the
 * VueX store.
 * @returns void
 */
export function shadowsHardwareScalingLocalStorageToVueX(): void {
    // Setup shadow checkbox. An option regardless of which input system
    // used. Get it from the localstorage.
    if (localStorage.getItem("shadows") !== null) {
        store.commit("setVar", {
            moduleName: "shadowsHardwareScaling",
            varName: "useShadows",
            val: localStorage.getItem("shadows") === "true"
        });
    }

    // Also hardware scaling. An option regardless of which input system
    // used.
    if (localStorage.getItem("hardwareScaling") !== null) {
        store.commit("setVar", {
            moduleName: "shadowsHardwareScaling",
            varName: "useHardwareScaling",
            val: localStorage.getItem("hardwareScaling") === "true"
        });
    } else {
        store.commit("setVar", {  // default
            moduleName: "shadowsHardwareScaling",
            varName: "useHardwareScaling",
            val: true
        });
    }

    if (window["webXRPolyfill"]["nativeWebXR"] !== true) {
        store.commit("setVar", {
            moduleName: "shadowsHardwareScaling",
            varName: "showHardwareScaling",
            val: true
        });
    }
}

/**
 * Starts download of a blbobl.
 * @param  {*}      blob      The blob.
 * @param  {string} filename  The filename.
 * @returns Promise  Fulfilled when download starts.
 */
export function downloadBlob(blob: any, filename: string): Promise<any> {
    return lazyLoadJS("js/FileSaver.min.js").then(() => {
        window["saveAs"](blob, filename);
        return Promise.resolve();
    });
}

/**
 * Downloads a file containing text.
 * @param  {string} content   The text.
 * @param  {string} filename  The filename to use.
 * @returns Promise  Fulfilled when the download begins.
 */
export function downloadTxtFile(content: string, filename: string): Promise<any> {
    return lazyLoadJS("js/FileSaver.min.js").then(() => {
        var blob = new Blob([content], { "type": "application/octet-stream;charset=utf-8" });
        window["saveAs"](blob, filename);
        return Promise.resolve();
    });
}
