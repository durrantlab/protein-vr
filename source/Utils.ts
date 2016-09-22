/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
namespace World {

    /**
     * The Utils namespace is where utility functions are stored.
     */
    export namespace Utils {

        /**
         * Set the rendering group id for a given mesh. Meshes with lower
         * rendering group ids (e.g., the skybox) are drawn behind other
         * objects.
         * @param {any}    mesh The mesh.
         * @param {number} val  The rendering group id.
         */
        export function setRenderingGroupId(mesh: any, val: number): void {
            // Set the rendering group on this mesh.
            mesh.renderingGroupId = val;

            // And all it's associted LOD meshes.
            if (mesh.hasOwnProperty("_LODLevels")) {
                mesh._LODLevels.forEach(function(m) {
                    if (m.mesh !== null) {
                        m.mesh.renderingGroupId = val;
                    }
                });
            }

            // Anything with "Decimated" in it needs to be renderingGroupID 1.
            World.scene.meshes.forEach(function(m) {
                if (m.name.indexOf("Decimated") !== -1) {
                    m.renderingGroupId = 1;
                }
            });

        }
    }
}
