import * as GUI from "../GUI";
// import * as jQuery from "../jQuery";
import * as Vars from "../Vars";
import * as CommonLoader from "./CommonLoader";
import * as GLTF from "./GLTF";
import * as ThreeDMol from "./ThreeDMol";

declare var BABYLON;
declare var jQuery;

/**
 * Load in the molecules.
 */
export function setup() {
    // If run in gltf mode, loads from gltf files (e.g., from biotite
    // environment). Otherwise, loads from url and other sources.

    CommonLoader.beforeLoading();

    jQuery.getJSON("scene_info.json", (data) => {
        // Deactivate menu if appropriate.
        if (data["menuActive"] === false) {
            Vars.vrVars.menuActive = false;
        }

        // Load using GLTF (e.g., from babylonjs).
        // if (data["objIDs"] !== undefined) {
        //     // The objIDs list contains IDs corresponding to gltf files.
        //    GLTF.setup(data);
        // } else {
            // So loading it from a pdb file via 3Dmoljs.
            ThreeDMol.setup(data);
        // }

        if (Vars.vrVars.menuActive) {
            GUI.setup(data);
        }
    });
}
