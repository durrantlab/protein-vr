import * as Extras from "../Extras";
import * as Vars from "./Vars";

declare var BABYLON;

/**
 * Setup the optimizations.
 * @returns void
 */
export function setup(): void {
    // Turn on scene optimizer
    // DEBUGG BABYLON.SceneOptimizer.OptimizeAsync(
    // DEBUGG     Vars.vars.scene,
    // DEBUGG     BABYLON.SceneOptimizerOptions.HighDegradationAllowed(),
    // DEBUGG );

    // Assume no part of the scene goes on to empty (skybox?)
    // DEBUGG Vars.vars.scene.autoClear = false; // Color buffer
    // DEBUGG Vars.vars.scene.autoClearDepthAndStencil = false;

    // Modify some meshes
    for (const idx in Vars.vars.scene.meshes) {
        if (Vars.vars.scene.meshes.hasOwnProperty(idx)) {
            const mesh = Vars.vars.scene.meshes[idx];

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
                // DEBUGG mesh.freezeWorldMatrix();
            }
        }
    }
}

/**
 * Optimize the ability to pick meshes, using octrees.
 * @param  {*} mesh The mesh.
 * @returns void
 */
export function optimizeMeshPicking(mesh: any): void {
    // First, get the number of vertexes.
    let vertexData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    if (vertexData === null) { return; }  // Something like __root__
    let numVertexes = vertexData.length / 3;

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
    mesh.createOrUpdateSubmeshesOctree(64, 2);
    mesh.useOctreeForCollisions = true;
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
        // DEBUGG mesh.material.freeze();
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
    // Update the shadows. They are frozen otherwise.
    Vars.vars.scene.lights[0].autoUpdateExtends = true;
    Extras.shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
    Vars.vars.scene.lights[0].autoUpdateExtends = false;
}
