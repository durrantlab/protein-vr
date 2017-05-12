define(["require", "exports", "./Objects/CollisionMeshes", "./Core/MouseState", "./Settings/UserVars"], function (require, exports, CollisionMeshes_1, MouseState, UserVars) {
    "use strict";
    var jQuery;
    // namespace CameraChar {
    /**
    The CameraChar namespace is where all the functions and variables
    related to the camera/main character are stored.
    */
    /**
    The height of the character/camera in feet.
    */
    exports.characterHeight = 1.8; // All units in metric.
    function setup() {
        /**
        Set up the camera/character.
        */
        // Get the scene object.
        var scene = PVRGlobals.scene;
        // The active camera from the babylon file is used (keep it
        // simple)
        if (UserVars.getParam("viewer") === UserVars.viewers.VRHeadset) {
            // VR camera
            setUpVRCameraControls();
        }
        else {
            // Just a regular camera
            scene.activeCamera.attachControl(PVRGlobals.canvas);
        }
        var camera = scene.activeCamera;
        PVRGlobals.camera = camera;
        // This ignores orientation info and looks at origin. For
        // debugging on your laptop. Uncomment out for production.
        // PVRGlobals.camera.inputs.removeByType("FreeCameraVRDeviceOrientationInput");
        // setTimeout(function () {
        //     // This targets the camera to scene origin
        //     PVRGlobals.camera.setTarget(new BABYLON.Vector3(1000,0,0));
        // }, 1500);
        setupCrosshair();
        // Get the camera object for reference.
        //let camera = PVRGlobals.camera;
        // Define an elipsoid raround the camera
        camera.ellipsoid = new BABYLON.Vector3(1, exports.characterHeight / 2, 1);
        // Enable gravity on the camera. The actual strength of the
        // gravity is set in the babylon file.
        camera.applyGravity = false;
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
        camera.speed = 3.0;
    }
    exports.setup = setup;
    function switchCamera(camera) {
        var scene = PVRGlobals.scene;
        var canvas = PVRGlobals.canvas;
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
    }
    exports.switchCamera = switchCamera;
    ;
    function feetAltitude() {
        /**
        Get the y value (along the up-down axis) of the character's feet.
    
        :returns: The y value of the feet.
        
        :rtype: :any:`float`
        */
        return (PVRGlobals.camera.position.y -
            exports.characterHeight);
    }
    exports.feetAltitude = feetAltitude;
    function repositionPlayerIfCollision() {
        /**
        Checks if the camera collides with a mesh. If so, resolve clash.
        */
        var intersect = false;
        for (var i = 0; i < CollisionMeshes_1.default.meshesThatCollide.length; i++) {
            var mesh = CollisionMeshes_1.default.meshesThatCollide[i];
            if (mesh.intersectsPoint(PVRGlobals.camera.position)) {
                intersect = true;
                PVRGlobals.camera.position = PVRGlobals.previousPos.clone();
                break;
            }
        }
    }
    exports.repositionPlayerIfCollision = repositionPlayerIfCollision;
    function setUpVRCameraControls() {
        // I feel like I should have to do the below... Why don't the defaults work?
        var metrics = BABYLON.VRCameraMetrics.GetDefault();
        //metrics.interpupillaryDistance = 0.5;
        // Add VR camera here (Oculus Rift, HTC Vive, etc.)
        var camera = new BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", PVRGlobals.scene.activeCamera.position, PVRGlobals.scene, true, // compensate distortion
        metrics);
        jQuery = PVRGlobals.jQuery;
        // If using a VR camera, auto advance forward
        setTimeout(function () {
            PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized.push(function () {
                if (MouseState.mouseDown === true) {
                    camera.position = camera.getFrontPosition(0.01 * PVRGlobals.scene.getAnimationRatio());
                }
            });
        }, 5000);
        switchCamera(camera);
    }
    exports.setUpVRCameraControls = setUpVRCameraControls;
    function setupCrosshair() {
        // Add a crosshair
        var crosshair = BABYLON.Mesh.CreatePlane("crosshair", 6.0, PVRGlobals.scene);
        crosshair.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        var crosshairMaterial = new BABYLON.StandardMaterial("crosshairmat", PVRGlobals.scene);
        crosshairMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
        crosshairMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        var crosshairtex = new BABYLON.Texture("imgs/crosshair.png", PVRGlobals.scene);
        crosshairMaterial.emissiveTexture = crosshairtex;
        //crosshairMaterial.emissiveTexture.hasAlpha = true;
        crosshairMaterial.diffuseTexture = crosshairtex;
        crosshairMaterial.diffuseTexture.hasAlpha = true;
        crosshair.material = crosshairMaterial;
        crosshair.renderingGroupId = 2;
        //crosshairMaterial.backFaceCulling = true;
        PVRGlobals.extraFunctionsToRunInLoop_AfterCameraLocFinalized.push(function () {
            this.position = PVRGlobals.camera.getFrontPosition(16);
        }.bind(crosshair));
    }
    exports.setupCrosshair = setupCrosshair;
    // }
    /**
     * Checks url for '?transmit=' with a following id. Saves the camera location and rotation info
     * to a json object and sends it to the transmit.php script to be maintained. Students can then be
     * teleported to the saved location via the same php script.
     */
    function teacherGatherClass() {
        jQuery = PVRGlobals.jQuery;
        var url = window.location.href;
        // console.log("Current url is: " + url);
        var pattern = "?transmit=";
        if (url.indexOf(pattern) > -1) {
            var parsed = url.split('=');
            var uniqueCode = parsed[1];
            // console.log("ID: " + uniqueCode);
            var locx = PVRGlobals.camera.position.x;
            var locy = PVRGlobals.camera.position.y;
            var locz = PVRGlobals.camera.position.z;
            var rotx = PVRGlobals.camera.rotation.x;
            var roty = PVRGlobals.camera.rotation.y;
            var rotz = PVRGlobals.camera.rotation.z;
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
            }).done(function (msg) {
                console.log("Data processed. " + msg);
            });
        }
        else {
            console.log("No teacher id in url :/");
            return;
        }
    }
    exports.teacherGatherClass = teacherGatherClass;
    /**
     * Checks the url every 3 seconds for '?id=' and scans the associated id against the
     * known teacher id's with the backend transmit.php script. If there is a match, current user
     * is teleported to the saved location.
     * @param VRCamera Is this user on a VR device?
     */
    function goToLocation(VRCamera) {
        jQuery = PVRGlobals.jQuery;
        var url = window.location.href;
        // console.log("Current url is: " + url);
        var pattern = "?id=";
        // maintain old data from previous calls
        var oldData = [];
        if (url.indexOf(pattern) > -1) {
            var parsed = url.split('=');
            var uniqueCode_1 = parsed[1];
            // console.log("ID: " + uniqueCode);
            //begin checking script every few seconds
            setInterval(function () {
                jQuery.ajax({
                    url: "./proteinvr/transmit/transmit.php",
                    method: "POST",
                    data: { id: uniqueCode_1 }
                }).done(function (data) {
                    if (oldData.indexOf(data) != -1) {
                        console.log("INVALID ID");
                        return;
                    }
                    else {
                        oldData.push(data);
                        var obj = JSON.parse(data.toString());
                        PVRGlobals.camera.position = new BABYLON.Vector3(Number(obj.locx), Number(obj.locy), Number(obj.locz));
                        if (!VRCamera) {
                            PVRGlobals.camera.rotation = new BABYLON.Vector3(Number(obj.rotx), Number(obj.roty), Number(obj.rotz));
                        }
                    }
                }).fail(function (jqXHR, textStatus, errorThrown) {
                    console.log("jqXHR: " + jqXHR);
                    console.log("Text status: " + textStatus);
                    console.log("Error thrown: " + errorThrown);
                });
            }, 3000);
        }
        else {
            return;
        }
    }
    exports.goToLocation = goToLocation;
});
