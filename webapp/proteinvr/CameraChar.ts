import Core from "./Core/Core";
import CollisionMeshes from "./Objects/CollisionMeshes";
import RenderLoop from "./Core/RenderLoop";
import MouseState from "./Core/MouseState";
import UserVars from "./UserVars";

declare var BABYLON;
declare var screenfull;
declare var jQuery;  // attached to window in RequireConfig.ts

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

    export function setup(): void {
        /**
        Set up the camera/character.
        */

        // Get the scene object.
        let scene = Core.scene;

        // The active camera from the babylon file is used (keep it
        // simple)

        if (UserVars.userVars["device"] === UserVars.devices.VRHeadset) {
            // VR camera
            setUpVRCameraControls();
        } else {
            // Just a regular camera
            scene.activeCamera.attachControl(Core.canvas);
        }

        CameraChar.camera = scene.activeCamera;

        // This ignores orientation info and looks at origin. For
        // debugging on your laptop. Uncomment out for production.
        // CameraChar.camera.inputs.removeByType("FreeCameraVRDeviceOrientationInput");
        // setTimeout(function () {
        //     // This targets the camera to scene origin
        //     CameraChar.camera.setTarget(new BABYLON.Vector3(1000,0,0));
        // }, 1500);

        setupCrosshair()

        // Get the camera object for reference.
        //let camera = CameraChar.camera;

        // Define an elipsoid raround the camera
        camera.ellipsoid = new BABYLON.Vector3(
            1, CameraChar.characterHeight / 2, 1
        );

        // Enable gravity on the camera. The actual strength of the
        // gravity is set in the babylon file.
        camera.applyGravity = false;

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

    export function setUpVRCameraControls() {
        // I feel like I should have to do the below... Why don't the defaults work?
        var metrics = BABYLON.VRCameraMetrics.GetDefault();
        //metrics.interpupillaryDistance = 0.5;

        // Add VR camera here (Oculus Rift, HTC Vive, etc.)
        let camera = new BABYLON.VRDeviceOrientationFreeCamera(
            "deviceOrientationCamera", 
            Core.scene.activeCamera.position, 
            Core.scene,
            true,  // compensate distortion
            metrics
        );

        jQuery.getScript( "js/screenfull.min.js" ).done(function( script, textStatus ) {
            // This does need to be registered on the window. If you do it
            // through a click in babylonjs, browsers will reject the
            // full-screen request.
            jQuery(window).click(function() {
                if (screenfull.enabled) {
                    screenfull.request();
                }
                jQuery(window).unbind("click");
            });
        });

        // If using a VR camera, auto advance forward
        setTimeout(function() {  // give time for stuff to load. This is hackish... fix later.
            RenderLoop.extraFunctionsToRunInLoop_BeforeCameraLocFinalized.push(function() {
                if (MouseState.mouseDown === true) {
                    CameraChar.camera.position = CameraChar.camera.getFrontPosition(
                        0.04 * Core.scene.getAnimationRatio()
                    );
                }
            });

        }, 5000);

        switchCamera(camera);
    }

    export function setupCrosshair() {
        // Add a crosshair
        var crosshair = BABYLON.Mesh.CreatePlane("crosshair", 6.0, Core.scene);
        crosshair.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        
        let crosshairMaterial = new BABYLON.StandardMaterial("crosshairmat", Core.scene);
        crosshairMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
        crosshairMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
        let crosshairtex = new BABYLON.Texture("imgs/crosshair.png", Core.scene);
        crosshairMaterial.emissiveTexture = crosshairtex;
        //crosshairMaterial.emissiveTexture.hasAlpha = true;
        crosshairMaterial.diffuseTexture = crosshairtex;
        crosshairMaterial.diffuseTexture.hasAlpha = true;
        crosshair.material = crosshairMaterial;
        crosshair.renderingGroupId = 2;

        //crosshairMaterial.backFaceCulling = true;

        RenderLoop.extraFunctionsToRunInLoop_AfterCameraLocFinalized.push(function() {
            this.position = CameraChar.camera.getFrontPosition(16);
        }.bind(crosshair));
    }
}

export default CameraChar;
