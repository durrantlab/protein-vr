define(["require", "exports", "./UserVars"], function (require, exports, UserVars) {
    "use strict";
    exports.__esModule = true;
    var Camera = (function () {
        function Camera(parentObj, BABYLON) {
            this._mouseDown = false;
            this._parentObj = parentObj;
            this.BABYLON = BABYLON;
        }
        Camera.prototype.setup = function () {
            // Attach camera to canvas inputs
            if (UserVars.getParam("viewer") == UserVars.viewers["Screen"]) {
                this._parentObj.scene.activeCamera.attachControl(this._parentObj._canvas);
            }
            else {
                this._setupVRCamera();
            }
            this._setupMouse();
            // Add extra keys
            // Additional control keys.
            this._parentObj.scene.activeCamera.keysUp.push(87); // W
            this._parentObj.scene.activeCamera.keysLeft.push(65); // A
            this._parentObj.scene.activeCamera.keysDown.push(83); // S
            this._parentObj.scene.activeCamera.keysRight.push(68); // D
            this._lastCameraLoc = new this.BABYLON.Vector3(-9999, -9999, -9999);
            // this.scene.activeCamera.inertia = 0.0;
        };
        Camera.prototype._setupVRCamera = function () {
            // I feel like I should have to do the below... Why don't the defaults work?
            var metrics = this.BABYLON.VRCameraMetrics.GetDefault();
            //metrics.interpupillaryDistance = 0.5;
            var scene = this._parentObj.scene;
            var canvas = this._parentObj._canvas;
            // Add VR camera here (Oculus Rift, HTC Vive, etc.)
            var camera = new this.BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", scene.activeCamera.position, scene, false, // compensate distortion
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
        };
        Camera.prototype._setupMouse = function () {
            var scene = this._parentObj.scene;
            scene.onPointerDown = function (evt, pickResult) {
                this._mouseDown = true;
            }.bind(this);
            scene.onPointerUp = function (evt, pickResult) {
                this._mouseDown = false;
            }.bind(this);
        };
        Camera.prototype._vectorsEqualTolerance = function (vec1, vec2, tol) {
            if (tol === void 0) { tol = 0.2; }
            if (Math.abs(vec1.x - vec2.x) > tol) {
                return false;
            }
            if (Math.abs(vec1.y - vec2.y) > tol) {
                return false;
            }
            if (Math.abs(vec1.z - vec2.z) > tol) {
                return false;
            }
            return true;
        };
        Camera.prototype.update = function () {
            var scene = this._parentObj.scene;
            var camera = scene.activeCamera;
            var cameraLoc = camera.position;
            // If the mouse is done, advance camera forward
            if (this._mouseDown) {
                cameraLoc = camera.getFrontPosition(0.5 * camera.speed * scene.getAnimationRatio());
            }
            // Continue only if camera position has changed.
            if (!this._vectorsEqualTolerance(cameraLoc, this._lastCameraLoc)) {
                // console.log("Camera pos changed", cameraLoc, this._lastCameraLoc);
                // Calculate distances to all camera positions
                var distData = [];
                for (var i = 0; i < this._parentObj.cameraPositionsAndTextures.length; i++) {
                    var cameraPos = this._parentObj.cameraPositionsAndTextures[i];
                    var pos = cameraPos[0].clone();
                    var tex = cameraPos[1];
                    var dist = pos.subtract(cameraLoc).length();
                    // if (!this._lastCameraPos.equals(pos)) {
                    // Don't include last previous position. So there has to be
                    // movement.
                    distData.push([dist, pos, tex]);
                    // }
                    // if dist = 0 temrinate early?
                }
                // Sort by distance
                var kf = function (a, b) {
                    a = a[0];
                    b = b[0];
                    if (a < b) {
                        return -1;
                    }
                    else if (a > b) {
                        return 1;
                    }
                    else {
                        return 0;
                    }
                };
                distData.sort(kf);
                // Remove first one (closest). To make sure always going somewhere...
                distData.shift();
                var tex1 = distData[0][2];
                // let tex2 = distData[1][1][2];
                // let tex3 = distData[2][1][2];
                var dist1 = distData[0][0];
                // let dist2 = distData[1][0];
                // let dist3 = distData[2][0];
                var bestDist = dist1;
                var bestPos = distData[0][1];
                // Move camera to best frame.
                camera.position = bestPos;
                // Move sphere
                this._parentObj._viewerSphere.position = bestPos;
                // Update texture
                this._parentObj._shader.setTextures(tex1); //, tex2, tex3, dist1, dist2, dist3);
                // this._viewerSphere.material.emissiveTexture = bestTexture;
                // Keep only guide spheres that are not so close
                for (var i = 0; i < this._parentObj._guideSpheres.length; i++) {
                    var sphere = this._parentObj._guideSpheres[i];
                    var distToGuideSphere = this.BABYLON.Vector3.Distance(sphere.position, bestPos);
                    if (distToGuideSphere < this._parentObj._guideSphereHiddenCutoffDist) {
                        sphere.visibility = 0.0;
                    }
                    else if (distToGuideSphere < this._parentObj._guideSphereShowCutoffDist) {
                        sphere.visibility = this._parentObj._guideSphereIntermediateFactor * (distToGuideSphere - this._parentObj._guideSphereHiddenCutoffDist);
                    }
                    else {
                        sphere.visibility = this._parentObj._guideSphereMaxVisibility;
                    }
                }
                this._lastCameraLoc = camera.position.clone();
            }
        };
        return Camera;
    }());
    exports.Camera = Camera;
});
