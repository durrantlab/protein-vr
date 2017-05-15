import * as Core from "./Core/Core";
import CollisionMeshes from "./Objects/CollisionMeshes";
import * as RenderLoop from "./Core/RenderLoop";
import * as MouseState from "./Core/MouseState";
import * as UserVars from "./Settings/UserVars";
import Event from "./Events/Event";
import MoveCamera from "./Events/Actions/MoveCamera";
import ClickedObject from "./Events/TriggerConditionals/ClickedObject";

declare var BABYLON;
declare var PVRGlobals;
var jQuery;

// namespace CameraChar {
/**
The CameraChar namespace is where all the functions and variables
related to the camera/main character are stored.
*/

/** 
The height of the character/camera in feet. 
*/
export const characterHeight: number = 1.8;  // All units in metric.

export function setup(): void {
    /**
    Set up the camera/character.
    */

    // Get the scene object.
    let scene = PVRGlobals.scene;

    // The active camera from the babylon file is used (keep it
    // simple)
    if (UserVars.getParam("viewer") === UserVars.viewers["VRHeadset"]) {
        // VR camera
        setUpVRCameraControls();
    } else {
        // Just a regular camera
        scene.activeCamera.attachControl(PVRGlobals.canvas);
    }

    let camera = scene.activeCamera;
    PVRGlobals.camera = camera;

    // This ignores orientation info and looks at origin. For
    // debugging on your laptop. Uncomment out for production.
    // PVRGlobals.camera.inputs.removeByType("FreeCameraVRDeviceOrientationInput");
    // setTimeout(function () {
    //     // This targets the camera to scene origin
    //     PVRGlobals.camera.setTarget(new BABYLON.Vector3(1000,0,0));
    // }, 1500);

    setupCrosshair()

    // Define an elipsoid raround the camera
    camera.ellipsoid = new BABYLON.Vector3(
        1, characterHeight / 2, 1
    );

    // Enable gravity on the camera. The actual strength of the
    // gravity is set in the babylon file.
    camera.applyGravity = false;

    // Now enable collisions between the camera and relevant objects.
    scene.collisionsEnabled = true;
    // camera.checkCollisions = true;

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
    let scene = PVRGlobals.scene;
    let canvas = PVRGlobals.canvas;

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

    return (PVRGlobals.camera.position.y -
            characterHeight);
}

export function repositionPlayerIfCollision(): void {
    /**
    Checks if the camera collides with a mesh. If so, resolve clash.
    */

    let intersect: boolean = false;
    for (let i = 0; i < CollisionMeshes.meshesThatCollide.length; i++) {
        let mesh = CollisionMeshes.meshesThatCollide[i];
        if (mesh.intersectsPoint(PVRGlobals.camera.position)) {
            intersect = true;
            setPosition(PVRGlobals.previousPos.clone());
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
        PVRGlobals.scene.activeCamera.position, 
        PVRGlobals.scene,
        true,  // compensate distortion
        metrics
    );

    jQuery = PVRGlobals.jQuery;

    switchCamera(camera);
}

export function setupCrosshair() {
    // Add a crosshair
    var crosshair = BABYLON.Mesh.CreatePlane("crosshair", 6.0, PVRGlobals.scene);
    crosshair.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    
    let crosshairMaterial = new BABYLON.StandardMaterial("crosshairmat", PVRGlobals.scene);
    crosshairMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
    crosshairMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
    let crosshairtex = new BABYLON.Texture("imgs/crosshair.png", PVRGlobals.scene);
    crosshairMaterial.emissiveTexture = crosshairtex;
    //crosshairMaterial.emissiveTexture.hasAlpha = true;
    crosshairMaterial.diffuseTexture = crosshairtex;
    crosshairMaterial.diffuseTexture.hasAlpha = true;
    crosshair.material = crosshairMaterial;
    crosshair.renderingGroupId = 2;

    //crosshairMaterial.backFaceCulling = true;

    PVRGlobals.extraFunctionsToRunInLoop_AfterCameraLocFinalized.push(function() {
        this.position = PVRGlobals.camera.getFrontPosition(16);
    }.bind(crosshair));
}
// }

export function setPosition(vec) {
    if ((vec !== undefined) && (!isNaN(vec.x))) {
        PVRGlobals.camera.position = vec;
    }
}

/**
 * Checks url for '?transmit=' with a following id. Saves the camera location and rotation info
 * to a json object and sends it to the transmit.php script to be maintained. Students can then be 
 * teleported to the saved location via the same php script.
 */

export function teacherGatherClass() :void{
    jQuery = PVRGlobals.jQuery;
    let url = window.location.href;
    // console.log("Current url is: " + url);
    let pattern = "?transmit=";
    if (url.indexOf(pattern) > -1) {
        let parsed = url.split('=');
        let uniqueCode = parsed[1];
        // console.log("ID: " + uniqueCode);
        let locx = PVRGlobals.camera.position.x;
        let locy = PVRGlobals.camera.position.y;
        let locz = PVRGlobals.camera.position.z;
        let rotx = PVRGlobals.camera.rotation.x;
        let roty = PVRGlobals.camera.rotation.y;
        let rotz = PVRGlobals.camera.rotation.z;

        jQuery.ajax({
            method: "POST",
            url: "./proteinvr/transmit/transmit.php",
            data: {
                id: uniqueCode,
                locx: locx,
                locy: locy,
                locz: locz,
                rotx: rotx,
                roty: roty,
                rotz: rotz
            }
        }).done(function(msg){
            console.log("Data processed. " + msg);
        });
    }
    else{
        console.log("No teacher id in url :/");
        return;
    }
}

/**
 * Checks the url every 3 seconds for '?id=' and scans the associated id against the
 * known teacher id's with the backend transmit.php script. If there is a match, current user
 * is teleported to the saved location.
 * @param VRCamera Is this user on a VR device?
 */
    
export function goToLocation(VRCamera: boolean) :void{
    jQuery = PVRGlobals.jQuery;
    let url = window.location.href;
    // console.log("Current url is: " + url);
    let pattern = "?id=";

    // maintain old data from previous calls
    let oldData:any = [];
    if (url.indexOf(pattern) > -1) {
        let parsed = url.split('=');
        let uniqueCode = parsed[1];
        // console.log("ID: " + uniqueCode);

        //begin checking script every few seconds
        setInterval(function(){
            jQuery.ajax({
                url: "./proteinvr/transmit/transmit.php",
                method: "POST",
                data: {id: uniqueCode}
            }).done(function(data){
                    if(oldData.indexOf(data) != -1) {
                        console.log("INVALID ID");
                        return;
                    }
                    else{
                        
                        oldData.push(data);
                        let obj = JSON.parse(data.toString());
                        setPosition(new BABYLON.Vector3(
                            Number(obj.locx), 
                            Number(obj.locy), 
                            Number(obj.locz)
                        ));
                        
                        if (!VRCamera){
                            PVRGlobals.camera.rotation = new BABYLON.Vector3(
                                Number(obj.rotx), 
                                Number(obj.roty), 
                                Number(obj.rotz)
                            );
                        }
                    }
            }).fail(function( jqXHR, textStatus, errorThrown ) {
                console.log("jqXHR: " + jqXHR);
                console.log("Text status: " + textStatus);
                console.log("Error thrown: " + errorThrown);
            });
        }, 3000);
    } else{
        return;
    } 
}

export function setMouseClickNavigation() {
    // Note that the keys will always work. This only determines who mouse
    // navigation happens. 
    
    // If mouse click turning selected, switch mouse click navigation to
    // none.

    // base type of movement based on navigation user var


    // Just move straight forward (arrows and such)
    // console.log("FIX THIS HERE!");
    // setTimeout(function() {  // give time for stuff to load. This is hackish... fix later.
        let movement = UserVars.getParam("moving");
        console.log("movement var = " + movement);

        switch(movement) {
            case UserVars.moving.Advance:
                console.log("Advance movement method");
                
                // If using a VR camera, auto advance forward
                PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized.push(function() {
                    if (MouseState.mouseDown === true) {
                        setPosition(PVRGlobals.camera.getFrontPosition(
                            0.01 * PVRGlobals.scene.getAnimationRatio()
                        ));
                    }
                });

                // new Event(new ClickedObject({
                //     triggerMesh: PVRGlobals.meshesByName["grnd"],
                //     action: new MoveCamera({
                //             camera: PVRGlobals.camera,
                //             milliseconds: 2000,
                //             endPoint: null
                //         })
                // }), null, true);
                break;
            case UserVars.moving.Jump:
                console.log("Jump movement method");

                new Event(new ClickedObject({
                    triggerMesh: PVRGlobals.meshesByName["grnd"],
                    action: new MoveCamera({
                            milliseconds: 750,  // Keep it fast so they don't have time to look in another direction while moving in a different direction.
                            endPoint: null,
                            onStart: function() { 
                                PVRGlobals.jumpRefractoryPeriod = true;
                            },
                            onEnd: function() { 
                                PVRGlobals.jumpRefractoryPeriod = false;
                            }
                        })
                }), null, true);
                break;
            case UserVars.moving.Teleport:
                console.log("Teleport movement method");
                
                new Event(new ClickedObject({
                    triggerMesh: PVRGlobals.meshesByName["grnd"],
                    action: new MoveCamera({
                            milliseconds: 0,
                            endPoint: null
                        })
                }), null, true);
                break;
            default:
                console.error("Expected a variable for Moving parameter. None found.");
        }
    // }, 500);
}