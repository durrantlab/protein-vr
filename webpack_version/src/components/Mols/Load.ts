import * as Optimizations from "../Scene/Optimizations";
import * as Menu3D from "../UI/Menu3D/Menu3D";
// import * as jQuery from "../jQuery";
import * as Vars from "../Vars";
import * as ThreeDMol from "./3DMol/ThreeDMol";
import * as CommonLoader from "./CommonLoader";
import * as GLTF from "./GLTF";

declare var BABYLON: any;
declare var jQuery: any;

/**
 * Load in the molecules.
 */
export function setup() {
    // If run in gltf mode, loads from gltf files (e.g., from biotite
    // environment). Otherwise, loads from url and other sources.

    CommonLoader.beforeLoading();

    jQuery.getJSON("babylon_scenes/" + Vars.sceneName + "/scene_info.json", (data: any) => {
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
            Menu3D.setup(data);
        }

        // Update the shadows.
        Optimizations.updateEnvironmentShadows();
    });
}
