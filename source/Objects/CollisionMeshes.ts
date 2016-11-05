import parent from "./ObjectParent";

/**
 * The CollisionMeshes namespace is where functions and variables related
 * to CollisionMeshes are stored.
 */
class CollisionMeshes extends parent{

    /**
     * A list of the meshes that can collide with the camera.
     */
    static meshesThatCollide = [];

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
        if ((json.c === "1") || (json.h === "1")) {
            // Enable collisions.
            m.checkCollisions = false; //true;
            console.log("Collisions on: ", json)
            CollisionMeshes.meshesThatCollide.push(m);
            // m.material.alpha = 0.0;
            m.visibility = 0.0;
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
        // Disable collisions.
        m.checkCollisions = false;
        console.log("Collisions off: ", json)
    }


}

export default CollisionMeshes;