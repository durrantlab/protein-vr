import parent from "./ObjectParent";

declare var BABYLON;

class BillboardMeshes extends parent {
    /**
    The BillboardMeshes namespace is where all the functions and variables
    related to billboard meshes are stored. Billboard meshes always face
    the camera (could be just a plane).
    */

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

        if (json.b === "1") {
            // Enable billboard.
            m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
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

        // m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    }
}

export default BillboardMeshes;