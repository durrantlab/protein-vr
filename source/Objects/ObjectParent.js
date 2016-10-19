define(["require", "exports", "../Core/Core"], function (require, exports, Core_1) {
    "use strict";
    var ObjectParent = (function () {
        function ObjectParent() {
        }
        /**
         * This function checks whether or not a mesh is marked as this type of
         * mesh.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as this type of mesh.
         */
        ObjectParent.prototype.checkMesh = function (m, json) {
            if (!this.objectMatch(m, json)) {
                this.objectNoMatch(m, json);
            }
        };
        /**
         * Set the rendering group id for a given mesh. Meshes with lower
         * rendering group ids (e.g., the skybox) are drawn behind other
         * objects.
         * @param {any}    mesh The mesh.
         * @param {number} val  The rendering group id.
         */
        ObjectParent.prototype.setRenderingGroupId = function (mesh, val) {
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
            Core_1.default.scene.meshes.forEach(function (m) {
                if (m.name.indexOf("Decimated") !== -1) {
                    m.renderingGroupId = 1;
                }
            });
        };
        return ObjectParent;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ObjectParent;
});
