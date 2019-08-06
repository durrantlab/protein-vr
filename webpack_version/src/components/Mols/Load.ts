import * as Optimizations from "../Scene/Optimizations";
import * as Menu3D from "../UI/Menu3D/Menu3D";
import * as Vars from "../Vars";
import * as ThreeDMol from "./3DMol/ThreeDMol";
import * as CommonLoader from "./CommonLoader";

declare var jQuery: any;

/**
 * Load in the molecules.
 * @returns void
 */
export function setup(): void {
    CommonLoader.beforeLoading();

    jQuery.getJSON("babylon_scenes/" + Vars.sceneName + "/scene_info.json", (data: any) => {
        // Deactivate menu if appropriate.
        if (data["menuActive"] === false) {
            Vars.vrVars.menuActive = false;
        }

        // Load from a pdb file via 3Dmoljs.
        ThreeDMol.setup(data);

        if (Vars.vrVars.menuActive) {
            Menu3D.setup(data);
        }

        // Update the shadows.
        Optimizations.updateEnvironmentShadows();
    });
}
