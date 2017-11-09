/* Things related to camera setup and movement. */
<<<<<<< HEAD
define(["require", "exports", "../config/Globals", "./Arrows", "../config/Globals", "../Spheres/SphereCollection"], function (require, exports, Globals, Arrows, Globals_1, SphereCollection) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BABYLON;
    var _mouseDownState = false;
    var _keyPressedState = undefined;
    var _firstRender = true;
    function setup() {
        /*
        Sets up the camera.
=======
define(["require", "exports", "../config/Globals", "./ViewerSphere", "./Arrows", "../config/Globals"], function (require, exports, Globals, ViewerSphere, Arrows, Globals_1) {
    class CameraPoints {
        constructor() {
            /*
            A class that keeps track of and processes the valid locations where the
            camera can reside (i.e., at the centers of viewer spheres.)
            */
            this.data = [];
        }
        push(d) {
            /*
            Add a point to the list of camera points.
    
            :param CameraPointData d: The data point to add.
            */
            this.data.push(d);
        }
        _getValBasedOnCriteria(d, criteria = "distance") {
            /*
            Each camera data point contains several values (distance, angle,
            score). This function retrieves a specific kind of value from a data
            point.
    
            :param CameraPointData d: The data point to get data from.
    
            :param string criteria: The name of the kind of data to get. Defaults
                          to "distance"
    
            :returns: The corresponding value.
            :rtype: :class:`number`
            */
            let val;
            switch (criteria) {
                case "distance":
                    return d.distance;
                case "angle":
                    return d.angle;
                case "score":
                    return d.score;
                default:
                    debugger;
            }
        }
        sort(criteria = "distance") {
            /*
            Sorts the data points by a given criteria.
    
            :param string criteria: The criteria to use. "distance", "angle", or
                          "score". Defaults to "distance".
            */
            this.data.sort(function (a, b) {
                let aVal = this.This._getValBasedOnCriteria(a, this.criteria);
                let bVal = this.This._getValBasedOnCriteria(b, this.criteria);
                if (aVal < bVal) {
                    return -1;
                }
                else if (aVal > bVal) {
                    return 1;
                }
                else {
                    return 0;
                }
            }.bind({
                criteria: criteria,
                This: this
            }));
        }
        removeFirst() {
            /*
            Remove the first item presently in the list of data points. This
            function is generally only useful if you've sorted the data points
            first.
            */
            this.data.shift();
        }
        firstPoint() {
            /*
            Get the first item presently in the list of data points. This function
            is generally only useful if you've sorted the data points first.
>>>>>>> a9a136ec8e19b168938dd1f0b51da02a5c071866
    
        :returns: A promise to set up the camera.
        :rtype: :class:`any`
        */
        if (Globals.delayExec(setup, ["UserSettingsSpecifiedDialogClosed", "DataJsonLoadingDone"], "setup", this)) {
            return;
        }
        // return new Promise((resolve) => {
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        let BABYLON = Globals.get("BABYLON");
        let isMobile = Globals.get("isMobile");
        let jQuery = Globals.get("jQuery");
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
        // Move camera to first position.
        let firstSphere = SphereCollection.getByIndex(0);
        let firstPosition = firstSphere.position;
        scene.activeCamera.position = firstPosition;
        // First frame is initially visible.
        firstSphere.opacity(1.0);
        // Camera starts at location of first frame.
        scene.activeCamera.position = firstSphere.position;
        _prevCameraPos = firstSphere.position.clone();
        _nextMovementVec = new BABYLON.Vector3(0, 0, 0);
        _prevViewerSphere = firstSphere;
        _nextViewerSphere = firstSphere;
        // Setup first steps forward
        _onDoneCameraAutoMoving(scene.activeCamera);
        // Add extra keys
        // Additional control keys.
        // TODO: Some reason this is commented out? Good to investigate...
        // _parentObj.scene.activeCamera.keysUp.push(87);  // W. 38 is up arrow.
        // _parentObj.scene.activeCamera.keysLeft.push(65);  // A. 37 if left arrow.
        // _parentObj.scene.activeCamera.keysDown.push(83);  // S. 40 is down arrow.
        // _parentObj.scene.activeCamera.keysRight.push(68);  // D. 39 is right arrow.
        // resolve({msg: "CAMERA SETUP"})
        // });
        Globals.milestone("CameraSetup", true);
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
<<<<<<< HEAD
    exports._setupWebVRFreeCamera = _setupWebVRFreeCamera;
    function _makeCameraReplaceActiveCamera(camera) {
        /*
        Attaches the camera to the scene, among other things. Note that this
        isn't used for WebVR camera, which must be attached to the canvas on
        user click.
=======
    class Camera {
        constructor() {
            this._mouseDownState = false;
            this._keyPressedState = undefined;
            this._firstRender = true;
            this._speedInUnitsPerSecond = 1;
            this._lastMovementTime = (new Date).getTime();
            this._msUntilNextMoveAllowed = 0;
            this._cameraCurrentlyAutoMoving = false;
        }
        setup() {
            /*
            Sets up the camera.
>>>>>>> a9a136ec8e19b168938dd1f0b51da02a5c071866
    
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
<<<<<<< HEAD
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
=======
        _setupWebVRFreeCamera() {
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
                camera = new BABYLON.WebVRFreeCamera("webVRFreeCamera", scene.activeCamera.position, scene);
            }
            else {
                camera = new BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", scene.activeCamera.position, scene);
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
                        let controller = camera.controllers[i];
                        // Make sure controller mesh visible
                        let mesh = controller._mesh;
                        if (mesh !== undefined) {
                            mesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
                            for (let j = 0; j < mesh._children.length; j++) {
                                let childMesh = mesh._children[j];
                                childMesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
                            }
                        }
                        // detect controller click
                        if (controller.onTriggerStateChangedObservable._observers.length === 0) {
                            controller.onTriggerStateChangedObservable.add((stateObject) => {
                                let state = (stateObject.pressed || stateObject.touched);
                                this._mouseDownState = state; // Pretend it's a mouse click
                            });
                        }
                        // if (controller.onPadValuesChangedObservable._observers.length === 0) {
                        //     controller.onPadValuesChangedObservable.add((stateObject) => {
                        //         let state = ((stateObject.x !== 0) || (stateObject.touched !== 0));
                        //         this._mouseDownState = state;  // Pretend it's a mouse click
                        //     });    
                        // }
                        if (controller.onPadStateChangedObservable._observers.length === 0) {
                            controller.onPadStateChangedObservable.add((stateObject) => {
                                let state = (stateObject.pressed || stateObject.touched);
                                this._mouseDownState = state; // Pretend it's a mouse click
                            });
                        }
                        if (controller.onSecondaryButtonStateChangedObservable._observers.length === 0) {
                            controller.onSecondaryButtonStateChangedObservable.add((stateObject) => {
                                let state = (stateObject.pressed || stateObject.touched);
                                this._mouseDownState = state; // Pretend it's a mouse click
                            });
                        }
                        if (controller.onMainButtonStateChangedObservable._observers.length === 0) {
                            controller.onMainButtonStateChangedObservable.add((stateObject) => {
                                // I don't think it's possible to trigger this on the Vive...
                                let state = (stateObject.pressed || stateObject.touched);
                                this._mouseDownState = state; // Pretend it's a mouse click
                            });
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
                this._setupMouseClick();
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
>>>>>>> a9a136ec8e19b168938dd1f0b51da02a5c071866
        }
        // Now keyboard
        // No arrow navigation on camera. You'll redo custom.
        scene.activeCamera.keysUp = [];
        scene.activeCamera.keysLeft = [];
        scene.activeCamera.keysDown = [];
        scene.activeCamera.keysRight = [];
        window.addEventListener("keydown", function (evt) {
            _keyPressedState = evt.keyCode;
        }.bind(this));
        window.addEventListener("keyup", function (evt) {
            _keyPressedState = undefined;
        }.bind(this));
    }
    function _setupMouseClick() {
        /*
        Setup mouse clicking. Separate from above function to work with HTC Vive too (not bound until after initial click).
        */
        let scene = Globals.get("scene");
        scene.onPointerDown = function (evt, pickResult) {
            _mouseDownState = true;
        }.bind(this);
        scene.onPointerUp = function (evt, pickResult) {
            _mouseDownState = false;
        }.bind(this);
    }
    var _speedInUnitsPerSecond = 1;
    var _lastMovementTime = (new Date).getTime();
    var _msUntilNextMoveAllowed = 0;
    var _prevCameraPos; // BABYLON.Vector3
    var _nextMovementVec; // BABYLON.Vector3
    var _prevViewerSphere;
    var _nextViewerSphere;
    var _cameraCurrentlyAutoMoving = false;
    function _updatePos(timeRatio, camera) {
        /*
        Function that determines sphere visibility and camera location as the
        user moves between two locations.
    
        :param number timeRatio: A number between 0.0 and 1.0, showing how far
                        along the user is between the previous sphere location and the next
                        one.
                        
        :param ??? camera: The BABYLON camera object.
        */
        let transitionPt = 0.05; // Good for this to be hard-coded eventually.
        _nextViewerSphere.opacity(Math.min(timeRatio / transitionPt, 1.0));
        _prevViewerSphere.opacity(1 - timeRatio); //  / (1 - transitionPt);
        camera.position = _prevCameraPos.add(_nextMovementVec.scale(timeRatio));
    }
    function update() {
        /*
        Update the camera. This is run from the render loop (every frame).
        */
        if (_prevViewerSphere === undefined) {
            // Not ready yet... PNG images probably not loaded.
            return;
        }
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let camera = scene.activeCamera;
        // Get the time that's elapsed since this function was last called.
        let deltaTime = (new Date).getTime() - _lastMovementTime;
        if (deltaTime < _msUntilNextMoveAllowed) {
            // Not enough time has passed to allow another movement.
            _cameraCurrentlyAutoMoving = true;
            _whileCameraAutoMoving(deltaTime, camera);
            return;
        }
        // NOTE: If you get here, you're ready to move again.
        if (_cameraCurrentlyAutoMoving) {
            // Since _cameraCurrentlyAutoMoving is true, this must be the
            // first time this function has been called since a new move was
            // permitted.
            _cameraCurrentlyAutoMoving = false;
            // Run a function for first-time moving allowed.
            _onDoneCameraAutoMoving(camera);
        }
        // So it's time to pick a new destination, but don't even try if the
        // user doesn't want to move (i.e., no active keypress our mousedown.)
        // Maybe they're looking around, not moving.
        let result;
        if (Globals.get("mouseDownAdvances") === true) {
            result = (_mouseDownState === false) && (_keyPressedState === undefined) && (_firstRender === false);
        }
        else {
            result = (_keyPressedState === undefined) && (_firstRender === false);
        }
<<<<<<< HEAD
        if (result) {
            return;
=======
        _getCameraTarget(camera) {
            if (Globals.get("cameraTypeToUse") === "show-desktop-vr") {
                // A rigged camera. Average two looking vectors.
                var leftCamera = camera.leftCamera;
                var rightCamera = camera.rightCamera;
                var vec1 = leftCamera.getTarget().subtract(leftCamera.position).normalize();
                var vec2 = rightCamera.getTarget().subtract(rightCamera.position).normalize();
                return vec1.add(vec2).scale(0.5).normalize();
            }
            else {
                return camera.getTarget();
            }
        }
        _onStartMove(camera) {
            /*
            Start the moving process from one sphere to the next. This function is
            fired only once, at beginning of moving (not every frame).
    
            :param ??? camera: The BABYLON camera.
            */
            // Make sure everything hidden but present sphere.
            ViewerSphere.hideAll();
            this._nextViewerSphere.visibility = 1.0; // NOTE: Is this right?!?!?
            this._pickDirectionAndStartMoving(camera.position, this._getCameraTarget(camera));
>>>>>>> a9a136ec8e19b168938dd1f0b51da02a5c071866
        }
        // If you get here, you're ready to start moving, and the user
        // actually wants to move.
        _firstRender = false; // It's no longer the first time rendering.
        _onStartMove(camera);
    }
    exports.update = update;
    function _onStartMove(camera) {
        /*
        Start the moving process from one sphere to the next. This function is
        fired only once, at beginning of moving (not every frame).
    
        :param ??? camera: The BABYLON camera.
        */
        // Make sure everything hidden but present sphere.
        SphereCollection.hideAll();
        _nextViewerSphere.opacity(1.0);
        _pickDirectionAndStartMoving(camera.position, camera.getTarget());
    }
    function _whileCameraAutoMoving(deltaTime, camera) {
        /*
        Runs every frame while the camera is transitioning from one valid
        camera location to the next.
    
        :param number deltaTime: The time since the camera started moving.
    
        :param ??? camera: The BABYLON camera.
        */
        // Still in auto-moving phase. So auto-move here.
        let timeRatio = deltaTime / _msUntilNextMoveAllowed;
        // let sigmoidalVal = 1.0/(1.0 + Math.exp(-(20 * timeRatio - 10)))
        // let sinVal = 0.5 + 0.5 * Math.sin(Math.PI * (timeRatio - 0.5));
        _updatePos(timeRatio, camera);
        // fade out arrows with each move... looks good.
        Arrows.fadeDownAll(1.0 - timeRatio);
        // Move background sphere too.
        let backgroundSphere = Globals.get("backgroundSphere");
        backgroundSphere.position = camera.position;
    }
    function _onDoneCameraAutoMoving(camera) {
        /*
        Runs once when the camera finishes transitioning from one valid camera
        location to the next.
    
        :param ??? camera: The BABYLON camera.
        */
        // Make sure completed transition to full visibility.
        _updatePos(1.0, camera);
        // Determine where you can move from here.
        _setCloseCameraDataAndArrows(camera);
        // Make sure environmental sphere properly positioned.
        Globals.get("backgroundSphere").position = camera.position;
    }
    var _closeCameraData;
    function _setCloseCameraDataAndArrows(camera) {
        /*
        Identifies other valid camera locations that are near this one. Uses
        this information to set the arrow locations.
    
        :param ??? camera: The BABYLON camera.
        */
        // This filters the camera points, keeping only those that are
        // uniqueish and close to the camera.
        // // Let's get the points close to the camera.
        // let cameraLoc = camera.position;
        // // Calculate distances to all camera positions
        // let cameraPoints = new CameraPoints();
        // for (let i=0; i<SphereCollection.count(); i++) {
        //     let cameraPos = SphereCollection.getByIndex(i).position;
        //     let pos = cameraPos.clone();
        //     let dist = pos.subtract(cameraLoc).length();
        //     cameraPoints.push({
        //         distance: dist, 
        //         position: pos, 
        //         associatedViewerSphere: SphereCollection.getByIndex(i)
        //     });
        // }
        // // Sort by distance
        // cameraPoints.sort();
        let cameraPoints = SphereCollection.currentSphere().neighboringSpheresOrderedByDistance().copy();
        // WILLIAM TODO: This function is for positioning arrows, but let's
        // take a detour here and also lazy load textures.
        let closeCameraDataForTextureLoading = cameraPoints.firstFewPoints(Globals.get("SOME NEW GLOBAL VARIABLE CUTOFF HERE")); // choose four close points
        // STUFF HERE TO LOAD THE TEXTURES CORRESPONDING TO THE SPHERES AT POINTS closeCameraDataForTextureLoading
        // Only do this stuff if global variable lazyLoadViewerSpheres is true.
        // Now back to worrying about arrows....
        // Remove first one (closest). To make sure you're not staying
        // where you are.
        cameraPoints.removeFirst();
        // Keep only four points. So I guess paths can't be too bifurcated.
        let closeCameraData = cameraPoints.firstFewPoints(Globals.get("numNeighboringCameraPosForNavigation")); // choose four close points
        // Remove the points that are off in the same general direction
        let closeCameraData2 = closeCameraData.removePointsInSameGeneralDirection(camera.position);
        // if (closeCameraData2.length() === 1) {
        //     debugger;
        //     closeCameraData.removePointsInSameGeneralDirection(camera.position);
        // }
        // Position the arrows.
        Arrows.update(closeCameraData2);
        _closeCameraData = closeCameraData2;
    }
    // private _pickDirectionAndStartMoving(camera: any): void {
    function _pickDirectionAndStartMoving(focalPoint, targetPoint) {
        /*
        Based on camera's direction, determine the next location to move to.
        This is called only once at the beinning of the moving cycle (not
        every frame).
    
        :param ??? focalPoint: BABYLON.Vector3 location. Probably the location of the camera.
    
        :param ??? targetPoint: BABYLON.Vector3 location. Probably the getTarget() of the camera.
        */
        // Start by assuming new camera point should be the closest point.
        let newCameraData = _closeCameraData.firstPoint();
        let maxDist = _closeCameraData.data[_closeCameraData.data.length - 1].distance;
        // Assign angles
        let lookingVec = targetPoint.subtract(focalPoint).normalize();
        // console.log(focalPoint, targetPoint, lookingVec);
        switch (_keyPressedState) {
            case 83:
                lookingVec = lookingVec.scale(-1);
                break;
            case 40:
                lookingVec = lookingVec.scale(-1);
                break;
        }
        // Calculate angles between camera looking vector and the various
        // candidate camera locations.
        _closeCameraData.addAnglesInPlace(focalPoint, lookingVec);
        // Throw out candidate camera locations that aren't even in the
        // general direction as the lookingVec
        let goodAngleCameraPoints = _closeCameraData.lessThanCutoff(1.9198621771937625, "angle"); // 110 degrees
        switch (goodAngleCameraPoints.length()) {
            case 0:
                // You must be at the end of a path. Keep previous newCameraData;
                break;
            case 1:
                // Only one left, so it must be the one to keep.
                newCameraData = goodAngleCameraPoints.firstPoint();
                break;
            default:
                // assign scores to camera data, keep one with best score.
                goodAngleCameraPoints.addScoresInPlace(1.57, maxDist); // 1.57 = 90 degrees
                goodAngleCameraPoints.sort("score");
                newCameraData = goodAngleCameraPoints.firstPoint();
                break;
        }
        // Set values to govern next auto movement.
        _prevCameraPos = focalPoint.clone();
        _nextMovementVec = newCameraData.position.subtract(_prevCameraPos);
        _prevViewerSphere = _nextViewerSphere;
        _nextViewerSphere = newCameraData.associatedViewerSphere;
        _msUntilNextMoveAllowed = 1000 * newCameraData.distance / _speedInUnitsPerSecond;
        _lastMovementTime = (new Date).getTime();
    }
});
