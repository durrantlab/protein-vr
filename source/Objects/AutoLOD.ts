import parent from "./ObjectParent";

/**
 * BABYLON is an external JavaScript library. This prevents Typescript from
 * throwing errors because BABYLON isn't defined in the TypeScript file.
 */
declare var BABYLON: any;


class AutoLODMeshes extends parent {
    /**
     * The AutoLODMeshes namespace is where all the functions and variables
     * related to auto LODing are stored. LOD is when a simpler version of the
     * mesh is shown from a distance, to keep things running fast.
     */

    public objectMatch(m: any, json: any): boolean {
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

        if (json.l === "1") {
            // Enable auto LOD.
            let settings = [
                { quality: 0.8, distance: 25, optimizeMesh: true },
                { quality: 0.3, distance: 50, optimizeMesh: true }
            ]

            m.simplify(settings, true, BABYLON.SimplificationType.QUADRATIC, function() {
                m.addLODLevel(65, null);
                this.setRenderingGroupId(m, m.renderingGroupId);
            }.bind(this));
            return true;
        }

        return false;
    }

    public objectNoMatch(m: any, json: any): void {
        /**
         * This function checks a mesh to see if it is NOT marked as this type of
         * mesh.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as this type of mesh.
         */
    }
}

export default AutoLODMeshes;