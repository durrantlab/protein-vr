import Core from "./Core/Core";
import CollisionMeshes from "./Objects/CollisionMeshes";

declare var BABYLON;
declare var screenfull;

namespace CameraChar {
    /**
    The CameraChar namespace is where all the functions and variables
    related to the camera/main character are stored.
    */

    /**
    The camera's last position.
    */
    export var previousPos = undefined;

    /**
    A variable to store the camera object. 
    */
    export var camera;

    /** 
    The height of the character/camera in feet. 
    */
    export const characterHeight: number = 1.8;  // All units in metric.

    export function setup($?: any): void {
        /**
        Set up the camera/character.
        */

        // Get the scene object.
        let scene = Core.scene;

        // The active camera from the babylon file is used (keep it
        // simple)
        let VRCamera: boolean = false;

        if (VRCamera) {
            // Add VR camera here (Oculus Rift, HTC Vive, etc.)
            let camera = new BABYLON.VRDeviceOrientationFreeCamera(
                "deviceOrientationCamera", 
                scene.activeCamera.position, 
                scene
            );

            $.getScript( "js/screenfull.min.js" ).done(function( script, textStatus ) {
                $(window).click(function() {
                    if (screenfull.enabled) {
                        screenfull.request();
                    }
                });
            });

            this.switchCamera(camera);

        } else {
            // Just a regular camera
            scene.activeCamera.attachControl(Core.canvas);
        }

        CameraChar.camera = scene.activeCamera;

        // Get the camera object for reference.
        //let camera = CameraChar.camera;

        // Define an elipsoid raround the camera
        camera.ellipsoid = new BABYLON.Vector3(
            1, CameraChar.characterHeight / 2, 1
        );

        // Enable gravity on the camera. The actual strength of the
        // gravity is set in the babylon file.
        camera.applyGravity = true;

        // Now enable collisions between the camera and relevant objects.
        scene.collisionsEnabled = true;
        camera.checkCollisions = true;

        // Additional control keys.
        camera.keysUp.push(87);  // W
        camera.keysLeft.push(65);  // A
        camera.keysDown.push(83);  // S
        camera.keysRight.push(68);  // D

        // Set the speed and inertia of camera motions.
        camera.inertia = 0; //0.9;
        camera.angularSensibility = 200;
        camera.speed = 3.0;
    }

    export function switchCamera(camera) {
        let scene = Core.scene;
        let canvas = Core.canvas;

        // See http://www.babylonjs.com/js/loader.js
        if (scene.activeCamera.rotation) {
            camera.rotation = scene.activeCamera.rotation.clone();
        }
        camera.fov = scene.activeCamera.fov;
        camera.minZ = scene.activeCamera.minZ;
        camera.maxZ = scene.activeCamera.maxZ;

        if (scene.activeCamera.ellipsoid) {
            camera.ellipsoid = scene.activeCamera.ellipsoid.clone();
        }
        camera.checkCollisions = scene.activeCamera.checkCollisions;
        camera.applyGravity = scene.activeCamera.applyGravity;

        camera.speed = scene.activeCamera.speed;

        scene.activeCamera.detachControl(canvas);
        if (scene.activeCamera.dispose) {
            scene.activeCamera.dispose();
        }

        scene.activeCamera = camera;

        scene.activeCamera.attachControl(canvas);
    };

    export function feetAltitude(): number {
        /**
        Get the y value (along the up-down axis) of the character's feet.

        :returns: The y value of the feet.
        
        :rtype: :any:`float`
        */

        return (CameraChar.camera.position.y -
                CameraChar.characterHeight);
    }

    export function repositionPlayerIfCollision(): void {
        /**
        Checks if the camera collides with a mesh. If so, resolve clash.
        */

        let intersect: boolean = false;
        for (let i = 0; i < CollisionMeshes.meshesThatCollide.length; i++) {
            let mesh = CollisionMeshes.meshesThatCollide[i];
            if (mesh.intersectsPoint(CameraChar.camera.position)) {
                intersect = true;
                CameraChar.camera.position = CameraChar.previousPos.clone();
                break;
            }
        }
    }
}

export default CameraChar;
