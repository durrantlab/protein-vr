// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars/Vars";
import * as ThreeDMol from "./3DMol/ThreeDMol";
import * as MolShadows from "./MolShadows";
import * as Pickables from "../Navigation/Pickables";
import * as PromiseStore from "../PromiseStore";
import * as StatusComponent from "../UI/Vue/Components/StatusComponent";
import { ResolvePlugin } from "webpack";
import { Color3, Mesh, SimplificationType, StandardMaterial } from "@babylonjs/core";

/**
 * Load in the molecules.
 * @returns void
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

                StatusComponent.setStatus("Mol Loaded");

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
    // OBJFileLoader.OPTIMIZE_WITH_UV = true;
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

            const transparentGround = new StandardMaterial(
                "transparentGround",
                Vars.scene
            );

            transparentGround.diffuseColor = new Color3(1, 1, 1);
            transparentGround.specularColor = new Color3(0, 0, 0);
            transparentGround.emissiveColor = new Color3(0, 0, 0);
            transparentGround.alpha = Vars.TRANSPARENT_FLOOR_ALPHA;

            Vars.vrVars.groundMesh.material = transparentGround;
        } else {
            console.log("Warning: Vars.vrVars.groundMesh not defined.");
        }
    }
}

/**
 * The goal of this function was to simplify meshes to improve memory use, but
 * I struggled to get it to work. Leaving it here in case you return to it
 * later.
 * @param  {*} mesh  The Mesh.
 * @returns Promise  A promise fulfilled when the mesh is simplified.
 */
function simplifyMesh(mesh: Mesh): Promise<any> {
    return Promise.resolve(mesh);  // skip for now. Getting strange shadows.

    // TODO: Could use https://playground.babylonjs.com/#TL1IIB#53 if you
    // update to 4.2.0. Below basically uses LOD, but always showing lower
    // level (distance: 0). So the original mesh is still in memory...
    return new Promise((resolve, reject) => {
        mesh.optimizeIndices(() => {
            return mesh.simplify([{distance: 5, quality: 1.0, optimizeMesh: false}], true, SimplificationType.QUADRATIC, () => {
                var simplified = mesh.getLODLevelAtDistance(5);
                console.log("Further optimization: " + (mesh.getIndices().length / 3).toString() + " => " + (simplified.getIndices().length / 3).toString());

                // var simplifiedSerialized = JSON.stringify(SceneSerializer.SerializeMesh(simplified));
                // SceneLoader.ImportMesh("", "", "data:" + simplifiedSerialized, Vars.scene, function(newMeshes) {
                //     // Get rid of original mesh.
                //     mesh.dispose();

                //     resolve(newMeshes[0]);
                // });

                // Need to recalculate normals on mesh.
                // const norms: any[] = [];
                // let verts = simplified.getVerticesData(VertexBuffer.PositionKind)
                // VertexDat.ComputeNormals(
                //     verts, simplified.getIndices(), norms,
                // );
                // mesh.updateVerticesData(VertexBuffer.NormalKind, norms);

                resolve(mesh);
            });
        });
    });
}

/**
 * Sets up a molecule mesh.
 * @param  {*}      mesh           The mesh.
 * @param  {number} uniqIntID      A unique numerical id that identifies this
 *                                 mesh.
 * @returns Promise                A promise that resolves the mesh.
 */
export function setupMesh(mesh: any, uniqIntID: number): Promise<any> {
    return simplifyMesh(mesh).then((mesh) => {
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

            mesh.material.emissiveColor = new Color3(
                backgroundLum,
                backgroundLum,
                backgroundLum
            );

            // Simplify the mesh. This can reduce the number of vertices
            // substantially (good for mobile). Note that some deduplication also
            // takes place in the webworker, so this further reduces things.

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

        return Promise.resolve(mesh);
    });
}
