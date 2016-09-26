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

        export var meshesThatCollide = [];

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
            if ((json.c === "1") || (json.h === "1")) {
                // Enable collisions.
                m.checkCollisions = false; //true;
                console.log("Collisions on: ", json)
                World.CollisionMeshes.meshesThatCollide.push(m);
                // m.material.alpha = 0.0;
                m.visibility = 0.0;
            } else {
                // Disable collisions.
                m.checkCollisions = false;
                console.log("Collisions off: ", json)
            }
        }
    }
}
