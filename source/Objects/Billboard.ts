import parent from "./ObjectParent";

declare var BABYLON;

/**
 * The BillboardMeshes namespace is where all the functions and variables
 * related to billboard meshes are stored. Billboard meshes always face
 * the camera (could be just a plane).
 */
class BillboardMeshes extends parent {

    /**
     * This function checks a mesh to see if it is marked as this type of
     * mesh. You can mark a mesh as this type of mesh using the VR Blender
     * plugin.
     * @param {any} m     The mesh.
     * @param {any} json  The associated json file, which contains the
     *                    information about whether or not the mesh is
     *                    marked as this type of mesh.
     * @returns {boolean} Whether or not the provided mesh matches the object
     *     described in the json.
     */
    public objectMatch(m: any, json: any): boolean {
        if (json.b === "1") {
            // Enable billboard.
            m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
            return true;
        }

        return false;
    }

    /**
     * This function checks a mesh to see if it is NOT marked as this type of
     * mesh.
     * @param {any} m    The mesh.
     * @param {any} json The associated json file, which contains the
     *                   information about whether or not the mesh is
     *                   marked as this type of mesh.
     */
    public objectNoMatch(m: any, json: any): void {
        // m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    }
}

export default BillboardMeshes;