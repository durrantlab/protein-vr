define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var ObjectParent = (function () {
        function ObjectParent() {
        }
        ObjectParent.prototype.checkMesh = function (m) {
            /**
            This function checks whether or not a mesh is marked as this type of
            mesh.
    
            :param any m: The mesh.
    
            :param any json: The associated json file, which contains the
                       information about whether or not the mesh is
                       marked as this type of mesh.
            */
            if (!this.objectMatch(m)) {
                this.objectNoMatch(m); //, json);
            }
        };
        ObjectParent.prototype.setRenderingGroupId = function (mesh, val) {
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
                mesh._LODLevels.forEach(function (m) {
                    if (m.mesh !== null) {
                        m.mesh.renderingGroupId = val;
                    }
                });
            }
            // Anything with "Decimated" in it needs to be renderingGroupID 1.
            PVRGlobals.scene.meshes.forEach(function (m) {
                if (m.name.indexOf("Decimated") !== -1) {
                    m.renderingGroupId = 1;
                }
            });
        };
        return ObjectParent;
    }());
    exports.default = ObjectParent;
});
