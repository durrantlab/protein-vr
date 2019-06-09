import * as Shadows from "../Mols/Shadows";
import * as VoiceCommands from "../Navigation/VoiceCommands";
import * as Vars from "../Vars";

declare var BABYLON;

/**
 * Setup the optimizations.
 * @returns void
 */
export function setup(): void {
    // Turn on scene optimizer
    BABYLON.SceneOptimizer.OptimizeAsync(
        Vars.scene,
        // BABYLON.SceneOptimizerOptions.HighDegradationAllowed(),
        sceneOptimizerParameters(),
    );

    // Assume no part of the scene goes on to empty (skybox?)
    Vars.scene.autoClear = false; // Color buffer
    Vars.scene.autoClearDepthAndStencil = false;

    // Modify some meshes
    for (const idx in Vars.scene.meshes) {
        if (Vars.scene.meshes.hasOwnProperty(idx)) {
            const mesh = Vars.scene.meshes[idx];

            // Meshes that contain the word "baked" should be shadeless
            if ((mesh.name.indexOf("baked") !== -1) && (mesh.material !== undefined)) {
                // Make material shadeless
                mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.emissiveTexture = mesh.material.diffuseTexture;
                mesh.material.diffuseTexture = null;

                // Material won't be changing. But apparently this is no
                // longer a needed optimization:
                // http://www.html5gamedevs.com/topic/37540-when-is-it-safe-to-freeze-materials/
                // mesh.material.freeze();

                // Assume no change in location (because that would require
                // recalculating shadows)
                mesh.freezeWorldMatrix();
            }
        }
    }
}

/**
 * Gets the number of vertices in a mesh.
 * @param  {*} mesh The mesh.
 * @returns number|null  The number of vertices.
 */
function getNumVertices(mesh: any): number|null {
    // First, get the number of vertexes.
    let numVertexes;
    if (mesh !== undefined) {
        let vertexData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
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
    let numVertexes = getNumVertices(mesh);
    if (numVertexes === null) { return; }  // Something like __root__

    // If there are very few vertexes, don't use this optimization. This
    // prevents it's use on button spheres, for example.
    if (numVertexes < 100) { return; }

    // Now get the number of submeshes to use.
    let numSubMeshes = 1 + Math.floor(numVertexes / Vars.MAX_VERTS_PER_SUBMESH);

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
export function freezeMeshProps(mesh: any, freezeMaterial: boolean = true, worldMatrix: boolean = true): void {
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
 * Update the environment shadows. They are frozen otherwise.
 * @returns void
 */
export function updateEnvironmentShadows(): void {
    if (Shadows.shadowGenerator) {
        // Update the shadows. They are frozen otherwise.
        Vars.scene.lights[0].autoUpdateExtends = true;
        Shadows.shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        Vars.scene.lights[0].autoUpdateExtends = false;
    }
}

/**
 * Prepares scene-optimizer paramters.
 * @returns * The parameters.
 */
function sceneOptimizerParameters(): any {
    // See https://doc.babylonjs.com/how_to/how_to_use_sceneoptimizer
    // The goal here is to maintain a frame rate of 60. Check every two
    // seconds. Very similar to HighDegradationAllowed
    let result = new BABYLON.SceneOptimizerOptions(25, 2000);

    let priority = 0;
    result.optimizations.push(new BABYLON.ShadowsOptimization(priority));
    // The below won't make a difference for my scenes anyway...
    // result.optimizations.push(new BABYLON.MergeMeshesOptimization(priority));
    result.optimizations.push(new BABYLON.LensFlaresOptimization(priority));
    result.optimizations.push(new BABYLON.PostProcessesOptimization(priority));
    result.optimizations.push(new BABYLON.ParticlesOptimization(priority));
    result.optimizations.push(new ReportOptimizationChange(priority));

    // Next priority
    priority++;
    result.optimizations.push(new RemoveSurfaces(priority));  // Remove surfaces
    result.optimizations.push(new ReportOptimizationChange(priority));

    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.TextureOptimization(priority, 512));
    result.optimizations.push(new ReportOptimizationChange(priority));

    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.RenderTargetsOptimization(priority));
    result.optimizations.push(new BABYLON.TextureOptimization(priority, 256));
    result.optimizations.push(new ReportOptimizationChange(priority));

    // Next priority
    priority++;
    result.optimizations.push(new BABYLON.HardwareScalingOptimization(priority, 4));
    result.optimizations.push(new SimplifyMeshes(priority, 500));  // Simplify meshes.
    result.optimizations.push(new ReportOptimizationChange(priority));

    return result;
}

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

/**
 * Remove the surface mesh (it takes a lot of resources).
 * @param  {number} priority The priority of this optimization.
 * @returns void
 */
function ReportOptimizationChange(priority: number): void {
    if (typeof priority === "undefined") {
        priority = 0;
    }

    this["priority"] = priority;
    this["apply"] = (scene) => {
        console.log("Optimization priority:", this["priority"]);
        console.log("FPS:", Vars.engine.getFps());
        console.log("");
        return true;
    };

    this["getDescription"] = () => {
        return "Reports the current priority. For debugging.";
    };
}

/**
 * Remove the surface mesh (it takes a lot of resources).
 * @param  {number} priority The priority of this optimization.
 * @returns void
 */
function RemoveSurfaces(priority: number): void {
    if (typeof priority === "undefined") {
        priority = 0;
    }

    this["priority"] = priority;
    this["apply"] = (scene) => {
        // Delete the surface mesh. Note that it will still be visible in the
        // main menu, but oh well.
        let surfaces = Vars.scene.getMeshByName("surfaces.wrl");
        removeMeshEntirely(surfaces);

        // Failed attempty below, but perhaps worth revisiting in the future.
        // VoiceCommands.showOrHideModel("", "surface", false);
        // VoiceCommands.interpretHideShowCommands(["surface"], true);
        return true;
    };

    this["getDescription"] = () => {
        return "Removes surface representations.";
    };
}


/**
 * A scene optimization to decimate the big meshes.
 * @param  {number} priority                  The priority of this
 *                                            optimization.
 * @param  {number} minNumVertsThatIsProblem  The target number of vertices.
 * @param  {number} [decimationLevel=]        The decimation level. If not
 *                                            specified, calculated from
 *                                            minNumVertsThatIsProblem.
 */
function SimplifyMeshes(priority: number, minNumVertsThatIsProblem: number, decimationLevel: number = undefined) {
    if (typeof priority === "undefined") {
        priority = 0;
    }

    this["priority"] = priority;
    this["apply"] = (scene) => {
        let meshesToConsider = [];
        for (let meshIdx in Vars.scene.meshes) {
            if (Vars.scene.meshes.hasOwnProperty(meshIdx)) {
                let mesh = Vars.scene.meshes[meshIdx];

                // If it's decimated, skip it. It will be deleted and
                // recreated.
                if (mesh.name.indexOf("Decimated") !== -1) { continue; }

                // For now, skip it if it was a wrl file in origin (because
                // simplification erases colors).
                // if (mesh.name.indexOf(".wrl") === -1) { continue; }
                // mesh.material.wireframe = true;

                // Get the number of vertexes.
                let numVertexes = getNumVertices(mesh);
                if (numVertexes === null) { continue; }  // Something like __root__
                if (numVertexes < minNumVertsThatIsProblem) { continue; }

                meshesToConsider.push([
                    numVertexes, mesh,
                    (decimationLevel === undefined) ? 1. - minNumVertsThatIsProblem / numVertexes : decimationLevel,
                ]);

                // Simplify the mesh. See
                // https://doc.babylonjs.com/how_to/in-browser_mesh_simplification
                // You used to be able to simplify a mesh without LOD.

                // let decimator = new BABYLON.QuadraticErrorSimplification(mesh);
                // simplify({
                //     "decimationIterations": 100,
                //     "aggressiveness": 7,
                //     // "syncIterations": ?  // Just keep default. Not sure what this is.
                // }, () => { return; });
            }
        }

        // Order the meshes from the one with most vertices to the one with
        // least (prioritize bad ones).
        meshesToConsider.sort((a, b) => b[0] - a[0]);

        // Simplify those meshes.
        for (let meshIdx in meshesToConsider) {
            if (meshesToConsider.hasOwnProperty(meshIdx)) {
                let mesh = meshesToConsider[meshIdx][1];
                let decimationLvel = meshesToConsider[meshIdx][2];

                // Remove the existing LODs if they exist.
                while (mesh.getLODLevels().length > 0) {
                    let firstLODMesh = mesh.getLODLevels()[0]["mesh"];
                    mesh.removeLODLevel(firstLODMesh);
                    removeMeshEntirely(firstLODMesh);
                }
                // console.log("GGG1", mesh.name, mesh.getLODLevels().length);

                // https://doc.babylonjs.com/api/classes/babylon.mesh#simplify
                mesh.simplify([{"quality": decimationLvel, "distance": 0.001}],
                    false, BABYLON.SimplificationType.QUADRATIC, () => {
                        // console.log("GGG2", mesh.name, mesh.getLODLevels().length);
                        // let simpMesh = mesh.getLODLevels()[0]["mesh"];
                        // removeMeshEntirely(mesh);
                        // console.log(simpMesh);
                        // window["mesh"] = mesh;
                        // console.log(mesh.name, decimationLvel);
                    },
                );

            }
        }

        return true;
    };

    this["getDescription"] = () => {
        return "Simplifies the geometry of complex objects in the scene.";
    };
}
