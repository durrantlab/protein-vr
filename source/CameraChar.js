define(["require", "exports", "./Core/Core", "./Objects/CollisionMeshes"], function (require, exports, Core_1, CollisionMeshes_1) {
    "use strict";
    /**
     * The CameraChar namespace is where all the functions and variables
     * related to the camera/main character are stored.
     */
    var CameraChar;
    (function (CameraChar) {
        /**
         * The camera's last position.
         */
        CameraChar.previousPos = undefined;
        /**
         * The height of the character/camera in feet.
         */
        CameraChar.characterHeight = 1.8; // All units in metric.
        /**
         * Set up the camera/character.
         */
        function setup() {
            // Get the scene object.
            var scene = Core_1.default.scene;
            // The active camera from the babylon file is used (keep it
            // simple)
            scene.activeCamera.attachControl(Core_1.default.canvas);
            CameraChar.camera = scene.activeCamera;
            // Get the camera object for reference.
            var camera = CameraChar.camera;
            // Define an elipsoid raround the camera
            camera.ellipsoid = new BABYLON.Vector3(1, CameraChar.characterHeight / 2, 1);
            // Enable gravity on the camera. The actual strength of the
            // gravity is set in the babylon file.
            camera.applyGravity = true;
            // Now enable collisions between the camera and relevant objects.
            scene.collisionsEnabled = true;
            camera.checkCollisions = true;
            // Additional control keys.
            camera.keysUp.push(87); // W
            camera.keysLeft.push(65); // A
            camera.keysDown.push(83); // S
            camera.keysRight.push(68); // D
            // Set the speed and inertia of camera motions.
            camera.inertia = 0; //0.9;
            camera.angularSensibility = 200;
        }
        CameraChar.setup = setup;
        /**
         * Get the y value (along the up-down axis) of the character's feet.
         * @return {number} The y value of the feet.
         */
        function feetAltitude() {
            return (CameraChar.camera.position.y -
                CameraChar.characterHeight);
        }
        CameraChar.feetAltitude = feetAltitude;
        /**
         * Checks if the camera collides with a mesh. If so, resolve clash.
         */
        function repositionPlayerIfCollision() {
            var intersect = false;
            for (var i = 0; i < CollisionMeshes_1.default.meshesThatCollide.length; i++) {
                var mesh = CollisionMeshes_1.default.meshesThatCollide[i];
                if (mesh.intersectsPoint(CameraChar.camera.position)) {
                    intersect = true;
                    CameraChar.camera.position = CameraChar.previousPos.clone();
                    break;
                }
            }
        }
        CameraChar.repositionPlayerIfCollision = repositionPlayerIfCollision;
    })(CameraChar || (CameraChar = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CameraChar;
});
