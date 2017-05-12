var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ObjectParent"], function (require, exports, ObjectParent_1) {
    "use strict";
    var CollisionMeshes = (function (_super) {
        __extends(CollisionMeshes, _super);
        function CollisionMeshes() {
            _super.apply(this, arguments);
        }
        CollisionMeshes.prototype.objectMatch = function (m) {
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
            // if ((json.c === "1") || (json.h === "1")) {
            if (false) {
                // Enable collisions.
                m.checkCollisions = false; //true;
                // console.log("Collisions on: ", json)
                CollisionMeshes.meshesThatCollide.push(m);
                // m.material.alpha = 0.0;
                m.visibility = 0.0;
                return true;
            }
            return false;
        };
        CollisionMeshes.prototype.objectNoMatch = function (m) {
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
            // console.log("Collisions off: ", json)
        };
        /**
        The CollisionMeshes namespace is where functions and variables related
        to CollisionMeshes are stored.
        */
        /**
        A list of the meshes that can collide with the camera.
        */
        CollisionMeshes.meshesThatCollide = [];
        return CollisionMeshes;
    }(ObjectParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CollisionMeshes;
});
