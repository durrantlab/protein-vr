// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars/Vars";
import * as ThreeDMol from "./3DMol/ThreeDMol";
import * as MolShadows from "./MolShadows";
import * as Pickables from "../Navigation/Pickables";
import * as LoadAndSetup from "../Scene/LoadAndSetup";
import * as PromiseStore from "../PromiseStore";

declare var jQuery: any;
declare var BABYLON: any;

/**
 * Load in the molecules.
 */
export function runLoadMolecule(): void {
    PromiseStore.setPromise(
        // You need menus because you will add to them.
        "LoadMolecule", ["LoadBabylonScene", "SetupMenus"],
        (resolve) => {
            beforeLoading();  // sets up molecular shadows

            return ThreeDMol.setup().then(() => {  // This needs Menu3D.menuInf.
                afterLoading();

                // Update the shadows.
                Optimizations.updateEnvironmentShadows();

                resolve();
            });
        }
    )
}

/**
 * Run this before loading.
 * @returns void
 */
function beforeLoading(): void {
    // Set up the shadow generator.
    MolShadows.setupShadowGenerator();

    // Make UVs work
    // BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
}

/**
 * @returns void
 */
export function afterLoading(): void {
    MolShadows.setupShadowCatchers(); // Related to extras, so keep it here.

    // Do you need to make the ground glass instead of invisible? See
    // scene_info.json, which can have transparentGround: true.
    if (Vars.sceneInfo.transparentGround === true) {
        if (Vars.vrVars.groundMesh) {
            Vars.vrVars.groundMesh.visibility = 1;

            const transparentGround = new BABYLON.StandardMaterial(
                "transparentGround",
                Vars.scene
            );

            transparentGround.diffuseColor = new BABYLON.Color3(1, 1, 1);
            transparentGround.specularColor = new BABYLON.Color3(0, 0, 0);
            transparentGround.emissiveColor = new BABYLON.Color3(0, 0, 0);
            transparentGround.alpha = Vars.TRANSPARENT_FLOOR_ALPHA;

            Vars.vrVars.groundMesh.material = transparentGround;
        } else {
            console.log("Warning: Vars.vrVars.groundMesh not defined.");
        }
    }

    // Finish up all scene preparations.
    // LoadAndSetup.loadingAssetsDone();
}

/**
 * Sets up a molecule mesh.
 * @param  {*}      mesh           The mesh.
 * @param  {number} uniqIntID      A unique numerical id that identifies this
 *                                 mesh.
 * @returns void
 */
export function setupMesh(mesh: any, uniqIntID: number): void {
    if (mesh.material !== undefined && mesh.material !== null) {
        // Add a small emission color so the dark
        // side of the protein isn't too dark.
        const lightingInf = MolShadows.getBlurDarknessAmbientFromLightName();
        let backgroundLum = 0;

        if (lightingInf.ambient === undefined) {
            // Experience:

            // In Couch scene, background luminosity of 0.01 is good. There shadow
            // darkness was 0.9625

            // In House scene, background luminosity of 0.0025 is good. There
            // shadow darkness was 0.35.

            // Let's play around with a scheme for guessing at the right
            // background luminosity.

            /** @type {number} */
            const lightingInfDarkness = lightingInf.darkness;
            if (lightingInfDarkness > 0.95) {
                backgroundLum = 0.05;
            } else if (lightingInfDarkness < 0.4) {
                backgroundLum = 0.0025;
            } else {
                // Scaled
                // (0.95, 0.01)
                // (0.4, 0.0025)
                // let m = 0.013636363636363637;  // (0.01 - 0.0025) / (0.95 - 0.4);
                // let b = -0.0029545454545454545;  // 0.01 - 0.013636363636363637 * 0.95;
                backgroundLum =
                    0.013636363636363637 * lightingInfDarkness -
                    0.0029545454545454545;
            }
        } else {
            // It's given in the name of the light, so no need to try to
            // calculate it.
            backgroundLum = lightingInf.ambient;
        }

        mesh.material.emissiveColor = new BABYLON.Color3(
            backgroundLum,
            backgroundLum,
            backgroundLum
        );

        // Freeze the material (improves optimization).
        Optimizations.freezeMeshProps(mesh);
    }
    // }

    // This is required to position correctly.
    mesh.scaling.z = -1;
    if (uniqIntID > 0) {
        mesh.scaling.x = -1;
    }

    // Make it so it casts a shadow.
    if (MolShadows.shadowGenerator) {
        MolShadows.shadowGenerator.getShadowMap().renderList.push(mesh);
    }

    // Make it pickable
    Pickables.addPickableMolecule(mesh);
}
