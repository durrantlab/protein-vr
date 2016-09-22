/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
namespace World {

    /**
     * The BillboardMeshes namespace is where all the functions and variables
     * related to billboard meshes are stored. Billboard meshes always face
     * the camera (could be just a plane).
     */
    export namespace BillboardMeshes {

        /**
         * This function checks a mesh to see if it's marked as a billboard
         * mesh. You can mark a mesh as a billboard mesh using the VR Blender
         * plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as the billboard.
         */
        export function checkInitialMesh(m: any, json: any): void {
            if (json.b === "1") {
                // Enable billboard.
                m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
            } else {
                // m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
            }
        }
    }
}
