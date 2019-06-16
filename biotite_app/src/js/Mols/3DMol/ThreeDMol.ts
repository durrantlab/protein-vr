// Functions from loading molecules directly from a 3Dmol.js instance. See
// VRML.ts for additional functions related to the mesh itself.

import * as Menu3D from "../../UI/Menu3D/Menu3D";
import * as Vars from "../../Vars";
import * as CommonLoader from "../CommonLoader";
import * as Visualize from "./Visualize";
import * as VRML from "./VRML";

declare var jQuery;
declare var BABYLON;

export let atomicInfo = {};

/**
 * Load in the extra molecule meshes.
 * @param  {Object<string,*>} sceneInfoData The data from scene_info.json.
 * @returns void
 */
export function setup(sceneInfoData: any): void {
    // Load the 3DMoljs iframe.
    try {
        jQuery.getScript(
            // "https://3Dmol.csb.pitt.edu/build/3Dmol-min.js",
            "https://3Dmol.csb.pitt.edu/build/3Dmol.js",
            ( data, textStatus, jqxhr ) => {
                after3DMolJsLoaded(sceneInfoData);
            },
        );
    } catch (err) {
        after3DMolJsLoaded(sceneInfoData);
    }
}

/**
 * Runs after the 3Dmol.js library is loaded.
 * @param  {Object<string,*>} sceneInfoData The data from scene_info.json.
 * @returns void
 */
function after3DMolJsLoaded(sceneInfoData: any): void {
    VRML.setup(() => {
        let pdbUri = "https://files.rcsb.org/view/1XDN.pdb";
        VRML.loadPDBURL(pdbUri, (mdl3DMol) => {
            // Get additional selection information about the loaded molecule.
            getAdditionalSels(mdl3DMol);

            // Now that the pdb is loaded, you need to repopulate the menu. In
            // the future, you might setup the menu for the first time from
            // here instead, but I can still imagine using ProteinVR without
            // 3Dmoljs, so let's just recreate for now.
            Menu3D.setup();  // Will use scene_info.json from what was previously saved.

            // Show protein ribbon by default.
            Visualize.toggleRep(["Protein", "All"], "Cartoon", "Spectrum");

            // Continue...
            CommonLoader.afterLoading(sceneInfoData);
        });
    });
}

function getAdditionalSels(mdl3DMol): void {
    // Get all the atoms.
    let atoms = mdl3DMol.selectedAtoms({});

    atomicInfo = {
        "Atom Name": [],
        "Chain": [],
        "Element": [],
        "Residue Index": [],
        "Residue Name": [],
        "Secondary Structure": [],
    };

    let atomsLen = atoms.length;
    for (let i = 0; i < atomsLen; i++) {
        let atom = atoms[i];
        atomicInfo["Atom Name"].push(atom["atom"]);
        atomicInfo["Chain"].push(atom["chain"]);
        atomicInfo["Element"].push(atom["elem"]);
        atomicInfo["Residue Name"].push(atom["resn"]);
        atomicInfo["Residue Index"].push(atom["resi"]);
        atomicInfo["Secondary Structure"].push(atom["ss"]);
    }

    // We want just unique values.
    for (let lbl in atomicInfo) {
        if (atomicInfo.hasOwnProperty(lbl)) {
            atomicInfo[lbl] = uniq(atomicInfo[lbl]);
        }
    }
}

function uniq(arr: any[]): any[] {
    // see
    // https://stackoverflow.com/questions/11688692/how-to-create-a-list-of-unique-items-in-javascript
    let u = {};
    let a = [];
    for (let i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i]);
            u[arr[i]] = 1;
        }
    }
    return a;
}
