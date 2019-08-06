// Functions from loading molecules directly from a 3Dmol.js instance. See
// VRML.ts for additional functions related to the mesh itself.

import * as Menu3D from "../../UI/Menu3D/Menu3D";
import * as Styles from "../../UI/Menu3D/Styles";
import * as OpenPopup from "../../UI/OpenPopup/OpenPopup";
import * as UrlVars from "../../UrlVars";
import * as Vars from "../../Vars";
import * as CommonLoader from "../CommonLoader";
import * as Visualize from "./Visualize";
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
 * @param  {Object<string,*>} sceneInfoData The data from scene_info.json.
 * @returns void
 */
export function setup(sceneInfoData: any): void {
    // Load the 3DMoljs iframe.
    // try {
    //     jQuery.getScript(
    //         // "https://3Dmol.csb.pitt.edu/build/3Dmol-min.js",
    //         "https://3Dmol.csb.pitt.edu/build/3Dmol.js",
    //         (data: any, textStatus: any, jqxhr: any) => {
    //             after3DMolJsLoaded(sceneInfoData);
    //         },
    //     );
    // } catch (err) {
        after3DMolJsLoaded(sceneInfoData);
    // }
}

/**
 * Runs after the 3Dmol.js library is loaded.
 * @param  {Object<string,*>} sceneInfoData The data from scene_info.json.
 * @returns void
 */
function after3DMolJsLoaded(sceneInfoData: any): void {
    VRML.setup(() => {
        UrlVars.readUrlParams();

        // let pdbUri = "https://files.rcsb.org/view/1XDN.pdb";
        VRML.loadPDBURL(modelUrl, (mdl3DMol: any) => {
            // Update URL with location
            UrlVars.setURL();

            if (!UrlVars.checkWebrtcInUrl()) {
                // It's not follow-the-leader mode, set setup menu.

                // Get additional selection information about the loaded molecule.
                // Like residue name.
                getAdditionalSels(mdl3DMol);

                // Now that the pdb is loaded, you need to update the menu.
                Styles.updateModelSpecificSelectionsInMenu(Menu3D.menuInf);
            }

            // Now that the PDB is loaded, you can start loading styles.
            UrlVars.startLoadingStyles();

            // Show protein ribbon by default.
            // Visualize.toggleRep(["Protein", "All"], "Cartoon", "Spectrum");

            // Continue...
            CommonLoader.afterLoading(sceneInfoData);

            // If it's nanokid, open a popup to let them specify a url or
            // pdbid.
            if (modelUrl === "nanokid.sdf") {
                setTimeout(() => {
                    // Give them some time to admire nanokid... :)
                    OpenPopup.openUrlModal("Load Molecule", "pages/load.html");
                }, 3000);
            }
        });
    });
}

/**
 * Generates additional possible selections from the properties of the atoms
 * themselves (like residue names).
 * @param  {*} mdl3DMol  A 3dmoljs molecule object.
 * @returns void
 */
function getAdditionalSels(mdl3DMol: any): void {
    // Get all the atoms.
    /** @type {Array<Object<string,*>>} */
    let atoms = mdl3DMol.selectedAtoms({});

    atomicInfo = {
        "Atom Name": [],
        "Chain": [],
        "Element": [],
        "Residue Index": [],
        "Residue Name": [],
        "Secondary Structure": [],
    };

    /** @type {number} */
    let atomsLen = atoms.length;
    for (let i = 0; i < atomsLen; i++) {
        /** @type {Object<string,*>} */
        let atom = atoms[i];
        atomicInfo["Atom Name"].push(atom["atom"]);
        atomicInfo["Chain"].push(atom["chain"]);
        atomicInfo["Element"].push(atom["elem"]);
        atomicInfo["Residue Name"].push(atom["resn"]);
        atomicInfo["Residue Index"].push(atom["resi"]);
        atomicInfo["Secondary Structure"].push(atom["ss"]);
    }

    // We want just unique values.
    let lbls = Object.keys(atomicInfo);
    let len = lbls.length;
    for (let i = 0; i < len; i++) {
        let lbl = lbls[i];
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
    let u = {};
    let a = [];

    /** @type {number} */
    let len = arr.length;
    for (let i = 0, l = len; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}
