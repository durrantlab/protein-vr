import parent from "./ObjectParent";

class CollisionMeshes extends parent{
    /**
    The CollisionMeshes namespace is where functions and variables related
    to CollisionMeshes are stored.
    */

    /**
    A list of the meshes that can collide with the camera.
    */
    static meshesThatCollide = [];

    public objectMatch(m: any, json: any): boolean {
        /**
        This function checks a mesh to see if it is marked as this type of
        mesh. You can mark a mesh as this type of mesh using the VR Blender
        plugin.

        :param any m: The mesh.
        :param any json: The associated json file, which contains the
                   information about whether or not the mesh is
                   marked as this type of mesh.

        :returns: Whether or not the provided mesh matches the object
                  described in the json.
                  
        :rtype: :any:`bool`
        */

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

    public objectNoMatch(m: any, json: any): void {
        /**
        This function checks a mesh to see if it is NOT marked as this type of
        mesh.

        :param any m: The mesh.
        :param any json: The associated json file, which contains the
                   information about whether or not the mesh is
                   marked as this type of mesh.
        */

        // Disable collisions.
        m.checkCollisions = false;
        console.log("Collisions off: ", json)
    }


}

export default CollisionMeshes;