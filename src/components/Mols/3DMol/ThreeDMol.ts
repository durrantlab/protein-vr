// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

// Functions from loading molecules directly from a 3Dmol.js instance. See
// VRML.ts for additional functions related to the mesh itself.

import * as Menu3D from "../../UI/Menu3D/Menu3D";
import * as Styles from "../../UI/Menu3D/Styles";
import * as OpenPopup from "../../UI/OpenPopup/OpenPopup";
import * as UrlVars from "../../Vars/UrlVars";
import * as VRML from "./VRML";

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
export function setModelUrl(url: string): void { modelUrl = url; }

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

        // let pdbUri = "https://files.rcsb.org/view/1XDN.pdb";
        VRML.loadPDBURL(modelUrl, (mdl3DMol: any) => {
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
                    // Give them some time to admire nanokid... :)
                    OpenPopup.openModal({title: "Load Molecule", content: "pages/load.html"});
                }, 3000);
            }

            resolveFunc();
        });
    });
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
