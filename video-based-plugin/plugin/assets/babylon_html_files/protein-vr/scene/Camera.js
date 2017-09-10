define(["require", "exports", "../config/UserVars", "./PVRJsonSetup", "../config/Globals", "./ViewerSphere"], function (require, exports, UserVars, PVRJsonSetup_1, Globals, ViewerSphere) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // export var cameraPositionsAndTextures: any;
    class CameraPoints {
        constructor() {
            this.data = [];
        }
        push(d) {
            this.data.push(d);
        }
        _getValBasedOnCriteria(d, criteria = "distance") {
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
            this.data.shift();
        }
        firstPoint() {
            return this.data[0];
        }
        firstFewPoints(num) {
            let newCameraPoints = new CameraPoints();
            for (let i = 0; i < num; i++) {
                newCameraPoints.push(this.data[i]);
            }
            return newCameraPoints;
        }
        length() {
            return this.data.length;
        }
        get(index) {
            return this.data[index];
        }
        lessThanCutoff(cutoff, criteria = "distance") {
            let newCameraPoints = new CameraPoints();
            for (let dIndex = 0; dIndex < this.data.length; dIndex++) {
                let d = this.data[dIndex];
                let val = this._getValBasedOnCriteria(d, criteria);
                // if (val > cutoff) {
                //     // Don't look beyond maxDistToJumpPt away
                //     break;
                // }
                if (val <= cutoff) {
                    newCameraPoints.push(d);
                }
            }
            return newCameraPoints;
        }
        addAnglesInPlace(pivotPoint, vec1) {
            let BABYLON = Globals.get("BABYLON");
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                let vec2 = d.position.subtract(pivotPoint).normalize();
                let angle = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
                this.data[i].angle = angle;
            }
        }
        addScoresInPlace(maxAngle, maxDistance) {
            // Combination of angle (should be close to 0) and distance (should be
            // close to 0). But need to be normalized.
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                // Note that lower scores are better.
                let score = 0.5 * ((d.angle / maxAngle) + (d.distance / maxDistance));
                this.data[i].score = score;
            }
        }
    }
    class Camera {
        constructor() {
            this._mouseDownState = false;
            this._keyPressedState = undefined;
            this._firstRender = true;
            this._lastMovementTime = (new Date).getTime();
            this._maxMovementsAllowedPerSec = 30;
            // private _maxDistToJumpPt = 1.0;
            this._jumpPointDetectionResolution = 0.1;
        }
        // private _lastCameraLoc: any;
        setup() {
            return new Promise((resolve) => {
                let scene = Globals.get("scene");
                let canvas = Globals.get("canvas");
                let BABYLON = Globals.get("BABYLON");
                // Attach camera to canvas inputs
                if (UserVars.getParam("viewer") == UserVars.viewers["Screen"]) {
                    scene.activeCamera.attachControl(canvas);
                }
                else {
                    this._setupVRCamera();
                }
                this._setupMouseAndKeyboard();
                // Move camera to first position.
                scene.activeCamera.position = Globals.get("cameraPositionsAndTextures")[0][0];
                // Add extra keys
                // Additional control keys.
                // this._parentObj.scene.activeCamera.keysUp.push(87);  // W. 38 is up arrow.
                // this._parentObj.scene.activeCamera.keysLeft.push(65);  // A. 37 if left arrow.
                // this._parentObj.scene.activeCamera.keysDown.push(83);  // S. 40 is down arrow.
                // this._parentObj.scene.activeCamera.keysRight.push(68);  // D. 39 is right arrow.
                // this._lastCameraLoc = new this.BABYLON.Vector3(-9999, -9999, -9999);
                // this.scene.activeCamera.inertia = 0.0;
                // Add anti-aliasing to this camera.
                // This works but darkens the scene.
                // var pipeline = new BABYLON.DefaultRenderingPipeline(
                //     "default", // The name of the pipeline
                //     false, // Do you want HDR textures ?
                //     scene, // The scene instance
                //     scene.activeCamera // The list of cameras to be attached to
                // );
                // pipeline.fxaaEnabled = true;
                // pipeline.bloomEnabled = false;
                // pipeline.imageProcessingEnabled = false;
                console.log("See texture delaying here: http://www.html5gamedevs.com/topic/20452-material-swapping-disappearing-issue/");
                resolve({ msg: "CAMERA SETUP" });
            });
        }
        _setupVRCamera() {
            let scene = Globals.get("scene");
            let canvas = Globals.get("canvas");
            let BABYLON = Globals.get("BABYLON");
            let jQuery = Globals.get("jQuery");
            // I feel like I should have to do the below... Why don't the defaults work?
            var metrics = BABYLON.VRCameraMetrics.GetDefault();
            //metrics.interpupillaryDistance = 0.5;
            // Add VR camera here (Oculus Rift, HTC Vive, etc.)
            let camera = new BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", scene.activeCamera.position, scene, false, // compensate distortion
            metrics);
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
            scene.activeCamera.attachControl(canvas);
            // let vrOverlay1 = jQuery("#vr_overlay1");
            // vrOverlay1.css("position", "absolute");
            // vrOverlay1.css("bottom", "0");
            // vrOverlay1.css("left", "0");
            // vrOverlay1.css("border-right", "2px solid black");
            // vrOverlay1.css("width", "50%");
            // vrOverlay1.css("height", "20%");
            // vrOverlay1.css("z-index", "10000000000");
            // setInterval(function() {
            //     let zIndex = this.renderCanvas.css("z-index");
            //     if (zIndex !== "auto") {
            //         this.vrOverlay.css("z_index", zIndex + 1);
            //     }
            //     // debugger;
            // }.bind({
            //     renderCanvas: jQuery("#renderCanvas"),
            //     vrOverlay: vrOverlay
            // }), 1000);
            // jQuery.getScript("js/babylon.gui.js", () => {
            //     let advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, scene);
            //     var line = new BABYLON.GUI.Line();
            //     let width = jQuery(window).width();
            //     line.x1 = width;
            //     line.y1 = 10;
            //     line.x2 = width;
            //     line.y2 = 500;
            //     line.lineWidth = 5;
            //     line.dash = [5, 10];
            //     line.color = "black";
            //     advancedTexture.addControl(line);
            // });
        }
        _setupMouseAndKeyboard() {
            let scene = Globals.get("scene");
            // First, setup mouse.
            scene.onPointerDown = function (evt, pickResult) {
                this._mouseDownState = true;
            }.bind(this);
            scene.onPointerUp = function (evt, pickResult) {
                this._mouseDownState = false;
            }.bind(this);
            // Now keyboard
            // No arrow navigation on camera. You'll redo custom.
            scene.activeCamera.keysUp = [];
            scene.activeCamera.keysLeft = [];
            scene.activeCamera.keysDown = [];
            scene.activeCamera.keysRight = [];
            window.addEventListener("keydown", function (evt) {
                this._keyPressedState = evt.keyCode;
            }.bind(this));
            window.addEventListener("keyup", function (evt) {
                this._keyPressedState = undefined;
            }.bind(this));
        }
        // private _vectorsEqualTolerance(vec1, vec2, tol=0.2) {
        //     if (Math.abs(vec1.x - vec2.x) > tol) {
        //         return false;
        //     }
        //     if (Math.abs(vec1.y - vec2.y) > tol) {
        //         return false;
        //     }
        //     if (Math.abs(vec1.z - vec2.z) > tol) {
        //         return false;
        //     }
        //     return true;
        // }
        _keepDataWithinDist(data, cutoffDist) {
            let toKeep = [];
            for (let i = 0; i < data.length; i++) {
                let d = data[i];
                if (d.distance < cutoffDist) {
                    toKeep.push(d);
                }
            }
            return toKeep;
        }
        update() {
            let deltaTime = (new Date).getTime() - this._lastMovementTime;
            if (deltaTime < 1000 / (this._maxMovementsAllowedPerSec)) {
                // Require a wait time before user can move to next position.
                // console.log("toosoon");
                return;
            }
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            let camera = scene.activeCamera;
            let cameraLoc = camera.position;
            // console.log("revert here");
            let result;
            if (Globals.get("mouseDownAdvances") === true) {
                result = (this._mouseDownState === false) && (this._keyPressedState === undefined) && (this._firstRender === false);
            }
            else {
                result = (this._keyPressedState === undefined) && (this._firstRender === false);
            }
            if (result) {
                // if (((Globals.get("mouseDownAdvances")) && (this._mouseDownState === false)) && (this._keyPressedState === undefined) && (this._firstRender === false)) {
                // if ((this._mouseDownState === false) && (this._keyPressedState === undefined) && (this._firstRender === false)) {
                // if ((this._keyPressedState === undefined) && (this._firstRender === false)) {
                // Only update things if user trying to move.
                return;
            }
            this._firstRender = false;
            // console.log(this._keyPressedState);
            // If the mouse is done, advance camera forward
            // if (this._mouseDownState) {
            //     cameraLoc = camera.getFrontPosition(
            //         // 0.5 * camera.speed * scene.getAnimationRatio()
            //     );
            // }    
            // Continue only if camera position has changed.
            // if (!this._vectorsEqualTolerance(cameraLoc, this._lastCameraLoc)) {
            // console.log("Camera pos changed", cameraLoc, this._lastCameraLoc);
            // Calculate distances to all camera positions
            let cameraPoints = new CameraPoints();
            let cameraPositionsAndTextures = Globals.get("cameraPositionsAndTextures");
            for (let i = 0; i < cameraPositionsAndTextures.length; i++) {
                let cameraPos = cameraPositionsAndTextures[i];
                let pos = cameraPos[0].clone();
                let tex = cameraPos[1];
                let dist = pos.subtract(cameraLoc).length();
                cameraPoints.push({ distance: dist, position: pos, texture: tex });
            }
            // Sort by distance
            cameraPoints.sort();
            // Remove first one (closest). To make sure you're not staying
            // where you are.
            cameraPoints.removeFirst();
            // Start by assuming new camera point should be the closest point.
            let newCameraData = cameraPoints.firstPoint();
            // Keep only four points. So I guess paths can't be too bifurcated.
            let closeCameraData = cameraPoints.firstFewPoints(4); // choose four close points
            let maxDist = closeCameraData.data[3].distance;
            // Assign angles
            let lookingVec = camera.getTarget().subtract(camera.position);
            switch (this._keyPressedState) {
                case 83:
                    lookingVec = lookingVec.scale(-1);
                    break;
                case 40:
                    lookingVec = lookingVec.scale(-1);
                    break;
            }
            closeCameraData.addAnglesInPlace(camera.position, lookingVec);
            // Throw out ones that are even in the general direction as the lookingVec
            let goodAngleCameraPoints = closeCameraData.lessThanCutoff(1.9198621771937625, "angle"); // 110 degrees
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
            // let tex1 = closestCameraPtFound.pt[2];
            // let tex2 = distData[1][1][2];
            // let tex3 = distData[2][1][2];
            // let dist1 = closestPtFound.dist;
            // let dist2 = distData[1][0];
            // let dist3 = distData[2][0];
            // let bestDist = dist1;
            // let bestPos = distData[0][1];
            // Move camera to best frame.
            camera.position = newCameraData.position;
            ViewerSphere.update(newCameraData);
            PVRJsonSetup_1.updateGuideSpheres(newCameraData);
            this._lastMovementTime = (new Date).getTime();
            // this._lastCameraLoc = camera.position.clone();
            // }
        }
    }
    exports.Camera = Camera;
});
