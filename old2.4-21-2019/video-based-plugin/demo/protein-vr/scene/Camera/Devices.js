define(["require", "exports", "../../config/Globals", "../../config/Globals"], function (require, exports, Globals, Globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mouseDownState = false;
    exports.keyPressedState = undefined;
    function setup() {
        /*
        Sets up the cameras and controllers, per user-specified parameters.
        */
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        // Load the appropriate camera.
        switch (Globals.get("cameraTypeToUse")) {
            case "show-mobile-virtual-joystick":
                _setupVirtualJoystick();
                break;
            case "show-desktop-screen":
                scene.activeCamera.attachControl(canvas);
                break;
            case "show-mobile-vr":
                _setupVRDeviceOrientationFreeCamera();
                break;
            case "show-desktop-vr":
                // And as @Sebavan said, you need a user's interaction to
                // render the scene in the headset (at least required by
                // Chrome as far as I remember, not sure it's specified by
                // the spec). So the below is commented out. It is instead
                // run when the user presses the play button...
                _setupWebVRFreeCamera();
                break;
        }
        _setupMouseAndKeyboard();
    }
    exports.setup = setup;
    function _setupVirtualJoystick() {
        /*
        Sets up a virtual joystick. Good for users on phones who don't have
        google cardboard.
        */
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let canvas = Globals.get("canvas");
        var camera = new BABYLON.VirtualJoysticksCamera("VJC", scene.activeCamera.position, scene);
        camera.rotation = scene.activeCamera.rotation;
        _makeCameraReplaceActiveCamera(camera);
    }
    function _setupVRDeviceOrientationFreeCamera() {
        /*
        Sets up a VRDeviceOrientationFreeCamera. Good for folks on phones who
        have google cardboard.
        */
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        // I feel like I should have to do the below... Why don't the defaults work?
        var metrics = BABYLON.VRCameraMetrics.GetDefault();
        //metrics.interpupillaryDistance = 0.5;
        // Add VR camera here (google cardboard). 
        let camera = new BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", scene.activeCamera.position, scene, false, // compensate distortion. False = good anti-aliasing.
        metrics);
        _makeCameraReplaceActiveCamera(camera);
    }
    function _setupWebVRFreeCamera() {
        /*
        Sets up the WebVR camera. Good for folks using Oculus Rift or HTC Vive
        on their desktops.
        */
        // This code untested, but designed for stuff like Oculus rift.
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        let BABYLON = Globals.get("BABYLON");
        let jQuery = Globals.get("jQuery");
        // I feel like I should have to do the below... Why don't the defaults work?
        // var metrics = BABYLON.VRCameraMetrics.GetDefault();
        // According to this page, best practices include feature detection to
        // pick the camera: http://playground.babylonjs.com/#QWIJYE#1 ;
        // http://www.html5gamedevs.com/topic/31454-webvrfreecameraid-vs-vrdeviceorientationfreecamera/?tab=comments#comment-180688
        let camera;
        if (navigator.getVRDisplays) {
            camera = new BABYLON.WebVRFreeCamera("webVRFreeCamera", scene.activeCamera.position, scene
            // false,  // compensate distortion
            // { trackPosition: true }
            // metrics
            );
            // camera.deviceScaleFactor = 1;
        }
        else {
            camera = new BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", scene.activeCamera.position, scene
            // false,  // compensate distortion. False = good anti-aliasing.
            // metrics
            );
        }
        // Keep the below because I think I'll use it in the future...
        // Detect when controllers are attached.
        // camera.onControllersAttachedObservable.add(function() {
        //     console.log(camera.controllers, "DFDF")
        //     camera.controllers.forEach(function(gp) {
        //         console.log(gp);
        //         // console.log("YO", gp);
        //         // let mesh = gp.hand === 'right' ? rightBox : leftBox;
        //         // gp.onPadValuesChangedObservable.add(function (stateObject) {
        //             // let r = (stateObject.x + 1) / 2;
        //             // let g = (stateObject.y + 1) / 2;
        //             // mesh.material.diffuseColor.copyFromFloats(r, g, 1);
        //         // });
        //         // gp.onTriggerStateChangedObservable.add(function (stateObject) {
        //             // let scale = 2 - stateObject.value;
        //             // mesh.scaling.x = scale;
        //         // });
        //         // oculus only
        //         /*gp.onSecondaryTriggerStateChangedObservable.add(function (stateObject) {
        //             let scale = 2 - stateObject.value;
        //             mesh.scaling.z = scale;
        //         });*/
        //         // gp.attachToMesh(mesh);
        //     });
        // });
        // Detect when controllers are attached. Dumb that I can't get onControllersAttachedObservable to work.
        setInterval(() => {
            if (camera.controllers !== undefined) {
                for (let i = 0; i < camera.controllers.length; i++) {
                    let mesh = camera.controllers[i]._mesh;
                    if (mesh !== undefined) {
                        mesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
                        for (let j = 0; j < mesh._children.length; j++) {
                            let childMesh = mesh._children[j];
                            childMesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
                        }
                    }
                }
            }
        }, 1000);
        // note that you're not calling _makeCameraReplaceActiveCamera. That's
        // because that will attach the camera, but you don't want that to
        // happen until after user clicks again.
        scene.activeCamera = camera;
        scene.onPointerDown = () => {
            scene.onPointerDown = undefined;
            // scene.onPointerDown = () => {
            //     camera.initControllers();
            // }
            // Attach that camera to the canvas.
            scene.activeCamera.attachControl(canvas, true);
            // In case they want to look through desktop VR but navigate with mouse?
            _setupMouseClick();
        };
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        // var rightBox = BABYLON.Mesh.CreateBox("sphere1", 0.1, scene);
        // rightBox.scaling.copyFromFloats(2, 1, 2);
        // var leftBox = BABYLON.Mesh.CreateBox("sphere1", 0.1, scene);
        // leftBox.scaling.copyFromFloats(2, 1, 2);
        // rightBox.material = new BABYLON.StandardMaterial('right', scene);
        // leftBox.material = new BABYLON.StandardMaterial('right', scene);
        // rightBox.renderingGroupId = RenderingGroups.VisibleObjects;
        // leftBox.renderingGroupId = RenderingGroups.VisibleObjects;
    }
    exports._setupWebVRFreeCamera = _setupWebVRFreeCamera;
    function _makeCameraReplaceActiveCamera(camera) {
        /*
        Attaches the camera to the scene, among other things. Note that this
        isn't used for WebVR camera, which must be attached to the canvas on
        user click.
    
        :param any camera: The BABYLON camera to attach.
        */
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        // Make VR camera match existing camera in scene
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
        // Now remove the original camera
        scene.activeCamera.detachControl(canvas);
        if (scene.activeCamera.dispose) {
            scene.activeCamera.dispose();
        }
        // Set the new (VR) camera to be active
        scene.activeCamera = camera;
        // Attach that camera to the canvas.
        scene.activeCamera.attachControl(canvas, true);
    }
    function _setupMouseAndKeyboard() {
        /*
        Setup mouse and keyboard navigation.
        */
        let scene = Globals.get("scene");
        // TODO: Commented out for WebVR debugging. This should be attached
        // after initial WebVR canvas-attach click.
        // First, setup mouse.
        if (Globals.get("cameraTypeToUse") !== "show-desktop-vr") {
            // Because if it's desktop VR, this function will be bound AFTER the first click (which starts the VR camera).
            _setupMouseClick();
        }
        // Now keyboard
        // No arrow navigation on camera. You'll redo custom.
        scene.activeCamera.keysUp = [];
        scene.activeCamera.keysLeft = [];
        scene.activeCamera.keysDown = [];
        scene.activeCamera.keysRight = [];
        window.addEventListener("keydown", function (evt) {
            exports.keyPressedState = evt.keyCode;
        }.bind(this));
        window.addEventListener("keyup", function (evt) {
            exports.keyPressedState = undefined;
        }.bind(this));
        // Add extra keys
        // Additional control keys.
        // TODO: Some reason this is commented out? Good to investigate...
        // _parentObj.scene.activeCamera.keysUp.push(87);  // W. 38 is up arrow.
        // _parentObj.scene.activeCamera.keysLeft.push(65);  // A. 37 if left arrow.
        // _parentObj.scene.activeCamera.keysDown.push(83);  // S. 40 is down arrow.
        // _parentObj.scene.activeCamera.keysRight.push(68);  // D. 39 is right arrow.
    }
    function _setupMouseClick() {
        /*
        Setup mouse clicking. Separate from above function to work with HTC Vive too (not bound until after initial click).
        */
        let scene = Globals.get("scene");
        scene.onPointerDown = function (evt, pickResult) {
            exports.mouseDownState = true;
        }.bind(this);
        scene.onPointerUp = function (evt, pickResult) {
            exports.mouseDownState = false;
        }.bind(this);
    }
});
