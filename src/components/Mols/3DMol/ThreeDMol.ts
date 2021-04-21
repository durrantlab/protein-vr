// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Functions from loading molecules directly from a 3Dmol.js instance. See
// VRML.ts for additional functions related to the mesh itself.

import * as Menu3D from "../../UI/Menus/Menu3D/Menu3D";
import * as Styles from "../../UI/Menus/Menu3D/Styles";
import * as UrlVars from "../../Vars/UrlVars";
import * as VRML from "./VRML";
import * as LoadAll from "../../Plugins/LoadSave/LoadAll";
import * as VueXStore from "../../Vars/VueX/VueXStore";
import * as ModalComponent from "../../UI/Vue/Components/OpenPopup/ModalComponent";

// Unfortunately, closure compiler breaks this. So hard code.
// import * as NanoKidFile from "./nanokid.sdf"

declare var jQuery: any;

export let atomicInfo = {};

export let modelUrl = "nanokid.sdf";  // NanoKidFile;

/**
 * Setter for modelUrl.
 * @param  {string} url The new value.
 * @returns void
 */
export function setModelUrl(url: string): void {
    modelUrl = decodeURIComponent(url);
}

/**
 * Load in the extra molecule meshes.
 * @returns  A promise that fulfills when the selection data has been loaded.
 */
export function setup(): Promise<any> {
    return new Promise((resolve, reject) => {
        after3DMolJsLoaded(resolve);
    });
}

/**
 * Runs after the 3Dmol.js library is loaded.
 * @param  {Function} resolveFunc  A promise resolve function that is called
 *                                 when the selection data is loaded.
 * @returns void
 */
function after3DMolJsLoaded(resolveFunc: Function): void {
    VRML.setup(() => {
        UrlVars.readUrlParams();

        if (modelUrl === "LOCALFILE") {
            // Actually loading from a local file, currently in sessionStorage.
            let data = sessionStorage.getItem("fileContent");
            let type = sessionStorage.getItem("fileType");
            sessionStorage.removeItem("fileContent");
            sessionStorage.removeItem("fileType");

            if ((data === null) || (data === undefined) ||
                (type === null) || (type === undefined))
            {
                window.location.href = window.location.protocol + "//" + window.location.host + window.location.pathname;
            }

            // Store these values in the VueX store, before parsing. That way,
            // if you make modifications and resave the file, you'll have
            // access to the original data. This isn't necessary if you
            // specify a remote url, because you can just get the data from
            // the remote source.
            VueXStore.storeOutsideVue.commit("setVar", {
                moduleName: "loadLocalFilePanel",
                varName: "fileContent",
                val: data
            });
            VueXStore.storeOutsideVue.commit("setVar", {
                moduleName: "loadLocalFilePanel",
                varName: "fileType",
                val: type
            });

            VRML.loadMolData(data, type, (mdl3DMol: any) => {
                continueAfterModelLoaded(mdl3DMol, resolveFunc);
            });
        } else {
            // Loading some sort of remote url.
            // let pdbUri = "https://files.rcsb.org/view/1XDN.pdb";
            VRML.loadMolURL(modelUrl, (mdl3DMol: any) => {
                continueAfterModelLoaded(mdl3DMol, resolveFunc);
            });
        }

        // Make doubly sure deleted from sessionStorage.
        sessionStorage.removeItem("fileContent");
        sessionStorage.removeItem("fileType");

    });
}

/**
 * Function that runs once the model is loaded.
 * @param  {*}         mdl3DMol     The 3Dmol molecule object.
 * @param  {Function}  resolveFunc  The resolve function to run when you're
 *                                  done processing things.
 * @returns void
 */
function continueAfterModelLoaded(mdl3DMol: any, resolveFunc: Function): void {
    // Update URL with location
    UrlVars.setURL();

    if (!UrlVars.checkIfWebRTCInUrl()) {
        // It's not leader mode, set setup menu.

        // Get additional selection information about the loaded
        // molecule. Like residue name.
        getAdditionalSels(mdl3DMol);

        // Now that the pdb is loaded, you need to update the menu.
        Styles.updateModelSpecificSelectionsInMenu(Menu3D.menuInf);
    }

    // Now that the PDB is loaded, you can start loading styles.
    UrlVars.startLoadingStyles();

    // If it's nanokid, open a popup to let them specify a url or
    // pdbid.
    if ((modelUrl === "nanokid.sdf") && (UrlVars.checkIfWebRTCInUrl() === false)){
        setTimeout(() => {
            if (!ModalComponent.anyModalOpen()) {
                // Give them some time to admire nanokid... :)
                LoadAll.openLoadSaveModal();
            }
        }, 3000);
    }

    resolveFunc();
}

/**
 * Generates additional possible selections from the properties of the atoms
 * themselves (like residue names). Puts this information into atomicInfo
 * (exported module variable).
 * @param  {*} mdl3DMol  A 3dmoljs molecule object.
 * @returns void
 */
function getAdditionalSels(mdl3DMol: any): void {
    // Get all the atoms.
    /** @type {Array<Object<string,*>>} */
    const atoms = mdl3DMol.selectedAtoms({});

    atomicInfo = {
        "Atom Name": [],
        "Chain": [],
        "Element": [],
        "Residue Index": [],
        "Residue Name": [],
        "Secondary Structure": [],
    };

    /** @type {number} */
    const atomsLen = atoms.length;
    for (let i = 0; i < atomsLen; i++) {
        /** @type {Object<string,*>} */
        const atom = atoms[i];
        atomicInfo["Atom Name"].push(atom["atom"]);
        atomicInfo["Chain"].push(atom["chain"]);
        atomicInfo["Element"].push(atom["elem"]);
        atomicInfo["Residue Name"].push(atom["resn"]);
        atomicInfo["Residue Index"].push(atom["resi"]);
        atomicInfo["Secondary Structure"].push(atom["ss"]);
    }

    // We want just unique values.
    const lbls = Object.keys(atomicInfo);
    const len = lbls.length;
    for (let i = 0; i < len; i++) {
        const lbl = lbls[i];
        atomicInfo[lbl] = uniq(atomicInfo[lbl]);
    }
}

/**
 * Get the unique values in an array.
 * @param  {Array<string>} arr  The array
 * @returns Array<*>  The array, with unique values.
 */
function uniq(arr: string[]): any[] {
    // see
    // https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript
    const u = {};
    const a = [];

    /** @type {number} */
    const len = arr.length;
    for (let i = 0, l = len; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}
