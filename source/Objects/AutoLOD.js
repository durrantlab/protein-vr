var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ObjectParent"], function (require, exports, ObjectParent_1) {
    "use strict";
    /**
     * The AutoLODMeshes namespace is where all the functions and variables
     * related to auto LODing are stored. LOD is when a simpler version of the
     * mesh is shown from a distance, to keep things running fast.
     */
    var AutoLODMeshes = (function (_super) {
        __extends(AutoLODMeshes, _super);
        function AutoLODMeshes() {
            _super.apply(this, arguments);
        }
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
        AutoLODMeshes.prototype.objectMatch = function (m, json) {
            if (json.l === "1") {
                // Enable auto LOD.
                var settings = [
                    { quality: 0.8, distance: 25, optimizeMesh: true },
                    { quality: 0.3, distance: 50, optimizeMesh: true }
                ];
                m.simplify(settings, true, BABYLON.SimplificationType.QUADRATIC, function () {
                    m.addLODLevel(65, null);
                    this.setRenderingGroupId(m, m.renderingGroupId);
                }.bind(this));
                return true;
            }
            return false;
        };
        /**
         * This function checks a mesh to see if it is NOT marked as this type of
         * mesh.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as this type of mesh.
         */
        AutoLODMeshes.prototype.objectNoMatch = function (m, json) { };
        return AutoLODMeshes;
    }(ObjectParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AutoLODMeshes;
});
