import Core from "./Core/Core";
import CollisionMeshes from "./Objects/CollisionMeshes";

declare var BABYLON;

/**
 * The CameraChar namespace is where all the functions and variables
 * related to the camera/main character are stored.
 */
namespace CameraChar {

    export var previousPos = undefined;

    /* A variable to store the camera object. */
    export var camera;

    /* The height of the character/camera in feet. */
    export const characterHeight: number = 1.8;  // All units in metric.

    /**
     * Set up the camera/character.
     */
    export function setup(): void {

        // Get the scene object.
        let scene = Core.scene;

        // The active camera from the babylon file is used (keep it
        // simple)
        scene.activeCamera.attachControl(Core.canvas);
        CameraChar.camera = scene.activeCamera;

        // Get the camera object for reference.
        let camera = CameraChar.camera;

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
    }

    /**
     * Get the y value (along the up-down axis) of the character's feet.
     * @return {number} The y value of the feet.
     */
    export function feetAltitude(): number {
        return (CameraChar.camera.position.y -
                CameraChar.characterHeight);
    }

    export function repositionPlayerIfCollision() {
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
