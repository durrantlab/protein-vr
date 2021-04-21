// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as MolShadows from "../Mols/MolShadows";
import * as Vars from "../Vars/Vars";
import * as Pickables from "../Navigation/Pickables";
import * as PromiseStore from "../PromiseStore";

declare var BABYLON: any;

/**
 * Setup the optimizations.
 * @returns void
 */
export function runOptimizeScene(): void {
    PromiseStore.setPromise(
        "OptimizeScene", ["LoadBabylonScene"],
        (resolve) => {
            // Turn on scene optimizer. Note that during loading the fps is
            // bound to drop, so let's put it on a little delay. TODO: Only
            // run this once the model and scene are loaded. NOTE: The below
            // optimization (now commented out) caused problems on the Quest.
            // So I'm going to skip it.

            // setTimeout(() => {
            //     BABYLON.SceneOptimizer.OptimizeAsync(
            //         Vars.scene,
            //         // BABYLON.SceneOptimizerOptions.HighDegradationAllowed(),
            //         sceneOptimizerParameters(),
            //     );
            // }, 5000);

            // Assume no part of the scene goes on to empty (skybox?)
            Vars.scene.autoClear = false; // Color buffer
            Vars.scene.autoClearDepthAndStencil = false;

            // Modify some meshes
            /** @type {number} */
            const len = Vars.scene.meshes.length;
            const zeroVec = new BABYLON.Color3(0, 0, 0);
            for (let idx = 0; idx < len; idx++) {
                /** @const {*} */
                const mesh = Vars.scene.meshes[idx];

                // Meshes that contain the word "baked" should be shadeless
                if ((mesh.name.indexOf("baked") !== -1) && (mesh.material !== undefined)) {
                    // Make material shadeless. Causes problems, and appears
                    // to be handled in allMaterialsShadeless() anyway.

                    // mesh.material.diffuseColor = zeroVec;
                    // mesh.material.specularColor = zeroVec;
                    // mesh.material.emissiveTexture = mesh.material.diffuseTexture;
                    // mesh.material.diffuseTexture = null;

                    // Material won't be changing. But apparently this is no
                    // longer a needed optimization:
                    // http://www.html5gamedevs.com/topic/37540-when-is-it-safe-to-freeze-materials/
                    // mesh.material.freeze();

                    // Assume no change in location (because that would require
                    // recalculating shadows)
                    mesh.freezeWorldMatrix();
                }
            }

            keepOnlyLightWithShadowlightSubstr();
            furtherProcessKeyMeshes();
            allMaterialsShadeless();
            optimizeMeshesAndMakeClickable();

            resolve();
        }
    )
}

/**
 * Only the light with shadowlight should be retained.
 * @returns void
 */
function keepOnlyLightWithShadowlightSubstr(): void {
    // Delete all the lights but the first one that has the substring
    // shadowlight or shadow_light.
    let foundFirstShadowLight = false;
    let indexToUse = 0;
    while (Vars.scene.lights.length > 1) {
        const light = Vars.scene.lights[indexToUse];
        const lightName = light.name.toLowerCase();
        const isShadowLight = (
            (lightName.indexOf("shadowlight") !== -1) ||
            (lightName.indexOf("shadow_light") !== -1)
        );

        if (!isShadowLight) {
            // It's not a shadow light. Delete it.
            Vars.scene.lights[indexToUse].dispose();
        } else if (foundFirstShadowLight) {
            // You've already found a shadow light. Delete additional
            // ones.
            Vars.scene.lights[indexToUse].dispose();
        } else {
            // Must be the first shadow light. Don't delete, but make
            // note of it.
            foundFirstShadowLight = true;
            indexToUse++;
        }
    }
}

/**
 * Hides meshes that are only used for scene creation. Also deals with
 * skyboxes and other objects.
 * @returns void
 */
function furtherProcessKeyMeshes(): void {
    // Hide objects used for scene creation.
    /** @type {number} */
    const len = Vars.scene.meshes.length;
    for (let meshIdx = 0; meshIdx < len; meshIdx++) {
        const mesh = Vars.scene.meshes[meshIdx];
        if (mesh.name === "protein_box") {
            mesh.isVisible = false;
        } else if (mesh.name.toLowerCase().indexOf("skybox") !== -1) {
            if (Vars.sceneInfo.infiniteDistanceSkyBox) {
                mesh.material.disableLighting = true;
                // mesh.infiniteDistance = true;

                // TODO: Unfortunately, mesh.infiniteDistance doesn't seem to
                // work anymore. We'll have to do it manually. Good to revisit
                // this later.
                Vars.scene.registerBeforeRender(() => {
                    mesh.position = Vars.scene.activeCamera.position;
                });
            }

            // TODO: Below causes skybox to go black. I think you'd need to
            // set to 0, and all other meshes to 1.
            // mesh.renderingGroupId = -1;
        }
    }
}

/**
 * All objects with materials that have emissive textures should be shadeless.
 * @returns void
 */
function allMaterialsShadeless(): void {
    /** @type {number} */
    const len = Vars.scene.meshes.length;
    for (let meshIdx = 0; meshIdx < len; meshIdx++) {
        const mesh = Vars.scene.meshes[meshIdx];
        if (!mesh.material) { continue; }

        // It has a material
        if (mesh.material.emissiveTexture) {
            mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
            mesh.material.albedoColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.ambientColor = new BABYLON.Color3(0, 0, 0);
        }

        // It has submaterials.
        /** @type {number} */
        // if (mesh.material.subMaterials) {
        //     let len2 = mesh.material.subMaterials.length;
        //     for (let matIdx = 0; matIdx < len2; matIdx++) {
        //         let mat = mesh.material.subMaterials[matIdx];
        //         if (mat.emissiveTexture) {
        //             mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        //             mat.albedoColor = new BABYLON.Color3(0, 0, 0);
        //             mat.ambientColor = new BABYLON.Color3(0, 0, 0);
        //         }
        //     }
        // }
    }
}

/**
 * Optimizes meshes and makes them clickable.
 * @returns void
 */
function optimizeMeshesAndMakeClickable(): void {
    // Optimize and make meshes clickable. Also, make sure all meshes
    // are emmissive.
    /** @type {number} */
    const len = Vars.scene.meshes.length;
    for (let meshIdx = 0; meshIdx < len; meshIdx++) {
        if (Vars.scene.meshes[meshIdx].material) {
            const mesh = Vars.scene.meshes[meshIdx];

            // It needs to be emmisive (so always baked).
            if ((mesh.material.emissiveTexture === undefined) ||
                (mesh.material.emissiveTexture === null) &&
                (mesh.name !== "navTargetMesh")) {  // Don't alter navTargetMesh material!

                mesh.material.emissiveTexture = mesh.material.diffuseTexture;

                // Below seems important to comment out. .clone()
                // above and .dispose() below doesn't work. Also,
                // below = null and = undefined didn't work. No good
                // solutions, so leave diffuse texture in place?

                // mesh.material.diffuseTexture = undefined;

                mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            }

            // TODO: Using false below to not freeze materials.
            // They are white otherwise. Good to figure out why.
            freezeMeshProps(mesh, false);
            Pickables.makeMeshMouseClickable({
                mesh,
                scene: Vars.scene,
            });
        }
    }
}

/**
 * Gets the number of vertices in a mesh.
 * @param  {*} mesh The mesh.
 * @returns {number|null}  The number of vertices.
 */
function getNumVertices(mesh: any): number|null {
    // First, get the number of vertexes.
    let numVertexes = 0;
    if (mesh !== undefined) {
        /** @type {Array<*>} */
        const vertexData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
        if (vertexData === null) { return null; }  // Something like __root__
        numVertexes = vertexData.length / 3;
    } else {
        numVertexes = 0;
    }
    return numVertexes;
}

/**
 * Optimize the ability to pick meshes, using octrees.
 * @param  {*} mesh The mesh.
 * @returns void
 */
export function optimizeMeshPicking(mesh: any): void {
    // First, get the number of vertexes.
    /** @type {number} */
    const numVertexes = getNumVertices(mesh);
    if (numVertexes === null) { return; }  // Something like __root__

    // If there are very few vertexes, don't use this optimization. This
    // prevents it's use on button spheres, for example.
    if (numVertexes < 100) { return; }

    // Now get the number of submeshes to use.
    const numSubMeshes = 1 + Math.floor(numVertexes / Vars.MAX_VERTS_PER_SUBMESH);

    // Subdivide the mesh if necessary.
    if (numSubMeshes > 1) {
        mesh.subdivide(numSubMeshes);
    }

    // Now use octree for picking and collisions.
    // mesh.createOrUpdateSubmeshesOctree(64, 2);  // Messes up culling on protein all sticks.
    // mesh.useOctreeForCollisions = true;
}

/**
 * Freeze the properties on a mesh, so they don't need to be recalculated.
 * @param  {*}       mesh	                The mesh.
 * @param  {boolean} [freezeMaterial=true]  Whether to freeze the material.
 * @param  {boolean} [worldMatrix=true]     Whether to freeze the world matrix.
 * @returns void
 */
export function freezeMeshProps(mesh: any, freezeMaterial = true, worldMatrix = true): void {
    if (freezeMaterial) {
        mesh.material.freeze();
        // material.unfreeze();
    }

    // if (worldMatrix) {
        // TODO: Why doesn't this work?
        // mesh.freezeWorldMatrix();
        // mesh.unfreezeWorldMatrix();
    // }
}

/**
 * Update the environment shadows. They are frozen otherwise. This function
 * unfreezes them and the freezes them again.
 * @returns void
 */
export function updateEnvironmentShadows(): void {
    if (MolShadows.shadowGenerator) {
        // Update the shadows. They are frozen otherwise.
        Vars.scene.lights[0].autoUpdateExtends = true;
        MolShadows.shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        // Vars.scene.render();
        Vars.scene.lights[0].autoUpdateExtends = false;
    }
}

/**
 * Prepares scene-optimizer paramters.
 * @returns * The parameters.
 */
// function sceneOptimizerParameters(): any {
//     // See https://doc.babylonjs.com/how_to/how_to_use_sceneoptimizer
//     // The goal here is to maintain a frame rate of 60. Check every two
//     // seconds. Very similar to HighDegradationAllowed
//     const result = new BABYLON.SceneOptimizerOptions(25, 2000);

//     let priority = 0;
//     result.optimizations.push(new BABYLON.ShadowsOptimization(priority));
//     // The below won't make a difference for my scenes anyway...
//     // result.optimizations.push(new BABYLON.MergeMeshesOptimization(priority));
//     result.optimizations.push(new BABYLON.LensFlaresOptimization(priority));
//     result.optimizations.push(new BABYLON.PostProcessesOptimization(priority));
//     result.optimizations.push(new BABYLON.ParticlesOptimization(priority));
//     result.optimizations.push(new ReportOptimizationChange(priority));

//     // Next priority
//     priority++;
//     result.optimizations.push(new RemoveSurfaces(priority));  // Remove surfaces
//     result.optimizations.push(new ReportOptimizationChange(priority));

//     // Next priority
//     priority++;
//     result.optimizations.push(new BABYLON.TextureOptimization(priority, 512));
//     result.optimizations.push(new ReportOptimizationChange(priority));

//     // Next priority
//     priority++;
//     result.optimizations.push(new BABYLON.RenderTargetsOptimization(priority));
//     result.optimizations.push(new BABYLON.TextureOptimization(priority, 256));
//     result.optimizations.push(new ReportOptimizationChange(priority));

//     // Next priority
//     priority++;
//     result.optimizations.push(new BABYLON.HardwareScalingOptimization(priority, 4));
//     result.optimizations.push(new SimplifyMeshes(priority, 500));  // Simplify meshes.
//     result.optimizations.push(new ReportOptimizationChange(priority));

//     return result;
// }

/**
 * Entirely remove a mesh.
 * @param  {*} mesh The mesh to remove.
 * @returns void
 */
export function removeMeshEntirely(mesh: any): void {
    if (mesh !== null) {
        mesh.dispose();
    }
    mesh = null;
}

// class ReportOptimizationChange {
//     private priority: number;
//     private apply: any;           // Leave these even though not used.
//     private getDescription: any;  // Leave these even though not used.

//     /**
//      * Remove the surface mesh (it takes a lot of resources).
//      * @param  {number} priority The priority of this optimization.
//      * @returns void
//      */
//     constructor(priority: number) {
//         if (priority === undefined) {
//             priority = 0;
//         }

//         this["priority"] = priority;
//         this["apply"] = (scene: any) => {
//             console.log("Optimization priority:", this["priority"]);
//             console.log("FPS:", Vars.engine.getFps());
//             console.log("");
//             return true;
//         };

//         this["getDescription"] = () => {
//             return "Reports the current priority. For debugging.";
//         };
//     }
// }

// tslint:disable-next-line:max-classes-per-file
// class RemoveSurfaces {
//     private priority: number;     // Leave these even though not used.
//     private apply: any;           // Leave these even though not used.
//     private getDescription: any;  // Leave these even though not used.

//     /**
//      * Remove the surface mesh (it takes a lot of resources).
//      * @param  {number} priority The priority of this optimization.
//      * @returns void
//      */
//     constructor(priority: number) {
//         if (typeof priority === "undefined") {
//             priority = 0;
//         }

//         this["priority"] = priority;
//         this["apply"] = (scene: any) => {
//             // Delete the surface mesh. Note that it will still be visible in the
//             // main menu, but oh well.
//             const surfaces = Vars.scene.getMeshByName("surfaces.wrl");
//             removeMeshEntirely(surfaces);
//             return true;
//         };

//         this["getDescription"] = () => {
//             return "Removes surface representations.";
//         };
//     }
// }

// tslint:disable-next-line:max-classes-per-file
// class SimplifyMeshes {
//     private priority: number;     // Leave these even though not used.
//     private apply: any;           // Leave these even though not used.
//     private getDescription: any;  // Leave these even though not used.

//     /**
//      * A scene optimization to decimate the big meshes.
//      * @param  {number} priority                  The priority of this
//      *                                            optimization.
//      * @param  {number} minNumVertsThatIsProblem  The target number of vertices.
//      * @param  {number} [decimationLevel=]        The decimation level. If not
//      *                                            specified, calculated from
//      *                                            minNumVertsThatIsProblem.
//      */
//     constructor(priority: number, minNumVertsThatIsProblem: number, decimationLevel: number = undefined) {
//         if (typeof priority === "undefined") {
//             priority = 0;
//         }

//         this["priority"] = priority;
//         this["apply"] = (scene: any) => {
//             /** @type {Array<Array<number,*,number>>} */
//             const meshesToConsider = [];
//             /** @type {number} */
//             const len = Vars.scene.meshes.length;
//             for (let meshIdx = 0; meshIdx < len; meshIdx++) {
//                 const mesh = Vars.scene.meshes[meshIdx];

//                 // If it's decimated, skip it. It will be deleted and
//                 // recreated.
//                 if (mesh.name.indexOf("Decimated") !== -1) { continue; }

//                 // Get the number of vertexes.
//                 /** @type {number} */
//                 const numVertexes = getNumVertices(mesh);
//                 if (numVertexes === null) { continue; }  // Something like __root__
//                 if (numVertexes < minNumVertsThatIsProblem) { continue; }

//                 meshesToConsider.push([
//                     numVertexes, mesh,
//                     (decimationLevel === undefined) ? 1. - minNumVertsThatIsProblem / numVertexes : decimationLevel,
//                 ]);

//                 // Simplify the mesh. See
//                 // https://doc.babylonjs.com/how_to/in-browser_mesh_simplification
//                 // You used to be able to simplify a mesh without LOD.
//                 // Apparently you can't now?

//                 // let decimator = new BABYLON.QuadraticErrorSimplification(mesh);
//                 // simplify({
//                 //     "decimationIterations": 100,
//                 //     "aggressiveness": 7,
//                 //     // "syncIterations": ?  // Just keep default. Not sure what this is.
//                 // }, () => { return; });
//             }

//             // Order the meshes from the one with most vertices to the one with
//             // least (prioritize bad ones).
//             meshesToConsider.sort((a, b) => b[0] - a[0]);

//             // Simplify those meshes.
//             const meshesToConsiderLen = meshesToConsider.length;
//             for (let i = 0; i < meshesToConsiderLen; i++) {
//                 /** @type {Array<number,*,number>} */
//                 const meshToConsider = meshesToConsider[i];
//                 const mesh = meshToConsider[1];

//                 /** @type {number} */
//                 const decimationLvel = meshToConsider[2];

//                 // Remove the existing LODs if they exist.
//                 while (mesh.getLODLevels().length > 0) {
//                     const firstLODMesh = mesh.getLODLevels()[0]["mesh"];
//                     mesh.removeLODLevel(firstLODMesh);
//                     removeMeshEntirely(firstLODMesh);
//                 }

//                 // https://doc.babylonjs.com/api/classes/babylon.mesh#simplify
//                 mesh.simplify([{"quality": decimationLvel, "distance": 0.001}],
//                     false, BABYLON.SimplificationType.QUADRATIC, () => {
//                         // let simpMesh = mesh.getLODLevels()[0]["mesh"];
//                         // removeMeshEntirely(mesh);
//                     },
//                 );
//             }

//             return true;
//         };

//         this["getDescription"] = () => {
//             return "Simplifies the geometry of complex objects in the scene.";
//         };
//     }
// }
