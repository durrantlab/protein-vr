var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./ObjectParent"], function (require, exports, ObjectParent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BillboardMeshes = (function (_super) {
        __extends(BillboardMeshes, _super);
        function BillboardMeshes() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        /**
        The BillboardMeshes namespace is where all the functions and variables
        related to billboard meshes are stored. Billboard meshes always face
        the camera (could be just a plane).
        */
        BillboardMeshes.prototype.objectMatch = function (m) {
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
            // if (json.b === "1") {
            //     // Enable billboard.
            //     m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
            //     return true;
            // }
            return false;
        };
        BillboardMeshes.prototype.objectNoMatch = function (m) {
            /**
            This function checks a mesh to see if it is NOT marked as this type of
            mesh.
    
            :param any m: The mesh.
            
            :param any json: The associated json file, which contains the
                       information about whether or not the mesh is
                       marked as this type of mesh.
            */
            // m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        };
        return BillboardMeshes;
    }(ObjectParent_1.default));
    exports.default = BillboardMeshes;
});