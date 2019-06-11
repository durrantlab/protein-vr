// Functions from loading molecules directly from a 3Dmol.js instance. See
// VRML.ts for additional functions related to the mesh itself.

import * as Vars from "../../Vars";
import * as CommonLoader from "../CommonLoader";
import * as VRML from "./VRML";

declare var jQuery;
declare var BABYLON;

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
        VRML.loadPDBURL(pdbUri, () => {
            VRML.setStyle({}, {"cartoon": {"color": "spectrum"}});
            VRML.render(true, () => {
                // Done loading...
                CommonLoader.afterLoading(sceneInfoData);
            });
        });
    });
}
