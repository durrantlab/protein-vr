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

    jQuery.getJSON(Vars.sceneName + "scene_info.json", (data: any) => {
        // Deactivate menu if appropriate. Note that this feature is not
        // supported (gives an error). Perhaps in the future I will
        // reimplement it, so I'm leaving the vestigial code here.
        if (data["menuActive"] === false) {
            Vars.vrVars.menuActive = false;
        }

        if (data["positionOnFloor"] === true) {
            Vars.setPositionOnFloor(true);
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
