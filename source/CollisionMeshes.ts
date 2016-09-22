/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
namespace World {

    /**
     * The CollisionMeshes namespace is where functions and variables related
     * to CollisionMeshes are stored.
     */
    export namespace CollisionMeshes {

        /**
         * This function checks a mesh to see if it's one that can collide
         * with the camera. You can mark a mesh as collidable mesh using the
         * VR Blender plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as collidable.
         */
        export function checkInitialMesh(m, json) {
            if (json.c === "1") {
                // Enable collisions.
                m.checkCollisions = true;
            } else {
                // Disable collisions.
                m.checkCollisions = false;
            }
        }
    }
}
