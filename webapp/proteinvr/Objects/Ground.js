var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ObjectParent", "../CameraChar"], function (require, exports, ObjectParent_1, CameraChar) {
    "use strict";
    var Ground = (function (_super) {
        __extends(Ground, _super);
        function Ground() {
            _super.apply(this, arguments);
        }
        Ground.prototype.objectMatch = function (m) {
            /**
            This function checks a mesh to see if it is marked as this type of
            mesh. You can mark a mesh as this type of mesh using the VR Blender
            plugin.
    
            :param any m: The mesh.
    
            :param any json:  The associated json file, which contains the
                       information about whether or not the mesh is
                       marked as this type of mesh.
    
            :returns: Whether or not the provided mesh matches the object
                      described in the json.
            :rtype: :any:`bool`
            */
            // if (json.g === "1") {
            if (m.name === "grnd") {
                // It's the ground
                m.checkCollisions = false; // No need to check for collisions
                // with the ground because you
                // test for collisions manually by
                // casting a ray.
                m.isPickable = true; // Make the ground pickable. That's how
                // the manual collision checking works.
                Ground.groundMesh = m; // Set the ground mesh to be
                // this one.
                return true;
            }
            return false;
        };
        Ground.prototype.objectNoMatch = function (m) {
            /**
            This function checks a mesh to see if it is NOT marked as this type of
            mesh.
    
            :param any m: The mesh.
            
            :param any json: The associated json file, which contains the
                       information about whether or not the mesh is
                       marked as this type of mesh.
            */
            m.isPickable = false; // Everything that isn't the ground
            // isn't pickable.
        };
        Ground.ensureCharAboveGround = function () {
            /**
            Make sure the character (really the camera) is always above the
            ground.
            */
            // Get a point in 3D space that is three feet above the camera.
            var pointAboveCamera = PVRGlobals.camera.position.clone().add(new BABYLON.Vector3(0, 3, 0));
            // Cast a ray straight down from that point, and get the point
            // where that ray intersects with the ground.
            var groundPt = PVRGlobals.scene.pickWithRay(new BABYLON.Ray(pointAboveCamera, new BABYLON.Vector3(0, -0.1, 0))).pickedPoint;
            // Get a point in 3D space that is three feet above the camera.
            var pointBelowCamera = PVRGlobals.camera.position.clone().subtract(new BABYLON.Vector3(0, 3, 0));
            // If there is no such point, check above the camera. Maybe the
            // camera has accidentally fallen through the ground.
            if (groundPt === null) {
                // Cast a ray straight up from that point, and get the point
                // where that ray intersects with the ground.
                var groundPt_1 = PVRGlobals.scene.pickWithRay(new BABYLON.Ray(pointBelowCamera, new BABYLON.Vector3(0, 0.1, 0))).pickedPoint;
            }
            // If the ground point exists, you can check if the character is
            // above or below that point.
            if (groundPt !== null) {
                // Get the y value (up-down axis) of the ground.
                var groundAltitude = groundPt.y;
                // Get the y value (up-down axis) of the character's feet.
                var feetAltitude = CameraChar.feetAltitude();
                // If the ground is aboe the feet, you've got a problem.
                if (groundAltitude > feetAltitude) {
                    // Move the camera so it's on top of the ground.
                    var delta = feetAltitude - groundAltitude;
                    PVRGlobals.camera.position.y =
                        PVRGlobals.camera.position.y - delta;
                }
            }
            else {
            }
        };
        return Ground;
    }(ObjectParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Ground;
});
