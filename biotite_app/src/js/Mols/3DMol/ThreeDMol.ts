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
    // Load 3DMoljs
    try {
        jQuery.getScript(
            "https://3Dmol.csb.pitt.edu/build/3Dmol-min.js",
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
    VRML.setup();

    let pdbUri = "https://files.rcsb.org/view/1XDN.pdb";
    VRML.loadPDBURL(pdbUri, () => {
        VRML.viewer.setStyle({}, {"cartoon": {"color": "spectrum"}});

        VRML.render();

        // VRML.babylonMesh.scaling = new BABYLON.Vector3(0.1, 0.1, 0.1);
        // Vars.scene.render();  // Needed to get bounding box to recalculate.
        // VRML.babylonMesh.refreshBoundingInfo();  // Not needed.
        // console.log(VRML.babylonMesh.getBoundingInfo().boundingBox.maximumWorld);
        // console.log(VRML.babylonMesh.getBoundingInfo().boundingBox.minimumWorld);

        // VRML.babylonMesh.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
        // Vars.scene.render();  // Needed to get bounding box to recalculate.
        // VRML.babylonMesh.refreshBoundingInfo();  // Not needed.
        // console.log(VRML.babylonMesh.getBoundingInfo().boundingBox.maximumWorld);
        // console.log(VRML.babylonMesh.getBoundingInfo().boundingBox.minimumWorld);

        // if (VRML.babylonMesh !== undefined) {
        //     VRML.babylonMesh.showBoundingBox = true;
        // }

        // setTimeout(() => {
        //     console.log(VRML.babylonMesh.getBoundingInfo().boundingBox.maximumWorld);
        //     console.log(VRML.babylonMesh.getBoundingInfo().boundingBox.minimumWorld);
        // }, 2000);

        // .refreshBoundingInfo();

        // VRML.scaleBeforeBabylonImport(0.1);
        // VRML.translateBeforeBabylonImport([5, 0, 0]);
        // VRML.getGeometricCenter();

        // VRML.importIntoBabylonScene();

        // Target the camera to one of the vertexes of the mesh
        // Vars.scene.activeCamera.setTarget(new BABYLON.Vector3(lastVertex[0], lastVertex[1], lastVertex[2]));

        // Done loading...
        CommonLoader.afterLoading(sceneInfoData);
    });
}
