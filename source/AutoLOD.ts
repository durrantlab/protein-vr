/**
 * BABYLON is an external JavaScript library. This prevents Typescript from
 * throwing errors because BABYLON isn't defined in the TypeScript file.
 */
declare var BABYLON: any;

/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
namespace World {

    /**
     * The AutoLODMeshes namespace is where all the functions and variables
     * related to auto LODing are stored. LOD is when a simpler version of the
     * mesh is shown from a distance, to keep things running fast.
     */
    export namespace AutoLODMeshes {

        /**
         * This function checks a mesh to see if it's marked as an auto LOD
         * mesh. You can mark a mesh as an auto LOD mesh using the VR Blender
         * plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as an auto LOD mesh.
         */
        export function checkInitialMesh(m: any, json: any): void {
            if (json.l === "1") {
                // Enable auto LOD.
                let settings = [
                    { quality: 0.8, distance: 25, optimizeMesh: true },
                    { quality: 0.3, distance: 50, optimizeMesh: true }
                ]

                m.simplify(settings, true, 
                           BABYLON.SimplificationType.QUADRATIC, function() {
                    m.addLODLevel(65, null);
                    World.Utils.setRenderingGroupId(m, m.renderingGroupId);
                });
            }
        }
    }
}
