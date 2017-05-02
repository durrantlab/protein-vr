import * as Core from "../Core/Core";

abstract class ObjectParent {
    /**
    The class that all objects inherit.
    */

    /**
    This function checks a mesh to see if it is marked as this type of
    mesh. You can mark a mesh as this type of mesh using the VR Blender
    plugin.

    :param any m: The mesh.

    :param any json: The associated json file, which contains the
               information about whether or not the mesh is
               marked as this type of mesh.

    :returns: Whether or not the provided mesh matches the object described in
              the json. 
    :rtype: :any:`bool`
    */
    public abstract objectMatch(m: any): boolean; //, json: any): boolean;

    /**
    This function checks a mesh to see if it is NOT marked as this type of
    mesh.

    :param any m: The mesh.

    :param any json: The associated json file, which contains the
               information about whether or not the mesh is
               marked as this type of mesh.
    */
    public abstract objectNoMatch(m: any): void; //, json: any): void;

    public checkMesh(m: any) { //, json: any) {
        /**
        This function checks whether or not a mesh is marked as this type of
        mesh.

        :param any m: The mesh.

        :param any json: The associated json file, which contains the
                   information about whether or not the mesh is
                   marked as this type of mesh.
        */

        if (!this.objectMatch(m)) { //, json)) {
            this.objectNoMatch(m); //, json);
        }
    }

    public setRenderingGroupId(mesh: any, val: number): void {
        /**
        Set the rendering group id for a given mesh. Meshes with lower
        rendering group ids (e.g., the skybox) are drawn behind other
        objects.

        :param any mesh: The mesh.
        
        :param float val: The rendering group id.
        */

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
        PVRGlobals.scene.meshes.forEach(function(m) {
            if (m.name.indexOf("Decimated") !== -1) {
                m.renderingGroupId = 1;
            }
        });

    }
}

export default ObjectParent;