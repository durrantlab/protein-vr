var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ObjectParent"], function (require, exports, ObjectParent_1) {
    "use strict";
    /**
     * The BillboardMeshes namespace is where all the functions and variables
     * related to billboard meshes are stored. Billboard meshes always face
     * the camera (could be just a plane).
     */
    var BillboardMeshes = (function (_super) {
        __extends(BillboardMeshes, _super);
        function BillboardMeshes() {
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
        BillboardMeshes.prototype.objectMatch = function (m, json) {
            if (json.b === "1") {
                // Enable billboard.
                m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
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
        BillboardMeshes.prototype.objectNoMatch = function (m, json) {
            // m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        };
        return BillboardMeshes;
    }(ObjectParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BillboardMeshes;
});
