import * as UserVars from "./UserVars";

export class Camera {
    private _parentObj: any;
    private BABYLON: any;

    private _mouseDown: boolean = false;
    private _lastCameraLoc: any;

    constructor(parentObj, BABYLON) {
        this._parentObj = parentObj;
        this.BABYLON = BABYLON;
    }

    public setup() {
        // Attach camera to canvas inputs
        if (UserVars.getParam("viewer") == UserVars.viewers["Screen"]) {
            this._parentObj.scene.activeCamera.attachControl(this._parentObj._canvas);
        } else {
            this._setupVRCamera();
        }

        this._setupMouse();

        // Add extra keys
        // Additional control keys.
        this._parentObj.scene.activeCamera.keysUp.push(87);  // W
        this._parentObj.scene.activeCamera.keysLeft.push(65);  // A
        this._parentObj.scene.activeCamera.keysDown.push(83);  // S
        this._parentObj.scene.activeCamera.keysRight.push(68);  // D
        
        this._lastCameraLoc = new this.BABYLON.Vector3(-9999, -9999, -9999);

        // this.scene.activeCamera.inertia = 0.0;
    }

    private _setupVRCamera() {
        // I feel like I should have to do the below... Why don't the defaults work?
        var metrics = this.BABYLON.VRCameraMetrics.GetDefault();
        //metrics.interpupillaryDistance = 0.5;

        let scene = this._parentObj.scene;
        let canvas = this._parentObj._canvas;

        // Add VR camera here (Oculus Rift, HTC Vive, etc.)
        let camera = new this.BABYLON.VRDeviceOrientationFreeCamera(
            "deviceOrientationCamera", 
            scene.activeCamera.position, 
            scene,
            false,  // compensate distortion
            metrics
        );
        
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
    }

    private _setupMouse() {
        let scene = this._parentObj.scene;

        scene.onPointerDown = function (evt, pickResult) {
            this._mouseDown = true;
        }.bind(this);

        scene.onPointerUp = function (evt, pickResult) {
            this._mouseDown = false;
        }.bind(this);
    }
    
    private _vectorsEqualTolerance(vec1, vec2, tol=0.2) {
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
    }

    public update() {
        let scene = this._parentObj.scene;
        let camera = scene.activeCamera;
        let cameraLoc = camera.position;

        // If the mouse is done, advance camera forward
        if (this._mouseDown) {
            cameraLoc = camera.getFrontPosition(
                0.5 * camera.speed * scene.getAnimationRatio()
            );
        }    
        
        // Continue only if camera position has changed.
        if (!this._vectorsEqualTolerance(cameraLoc, this._lastCameraLoc)) {
            // console.log("Camera pos changed", cameraLoc, this._lastCameraLoc);
            
            // Calculate distances to all camera positions
            let distData = [];
            for (let i=0; i<this._parentObj.cameraPositionsAndTextures.length; i++) {
                let cameraPos = this._parentObj.cameraPositionsAndTextures[i];
                let pos = cameraPos[0].clone();
                let tex = cameraPos[1];
                let dist = pos.subtract(cameraLoc).length();
                
                // if (!this._lastCameraPos.equals(pos)) {
                    // Don't include last previous position. So there has to be
                    // movement.
                    distData.push([dist, pos, tex]);
                // }
        
                // if dist = 0 temrinate early?
            }
        
            // Sort by distance
            let kf = function(a, b) {
                a = a[0];
                b = b[0];
        
                if (a < b) {
                    return -1;
                } else if (a > b) {
                    return 1;
                } else {
                    return 0;
                }
            }
            distData.sort(kf);

            // Remove first one (closest). To make sure always going somewhere...
            distData.shift();
        
            let tex1 = distData[0][2];
            // let tex2 = distData[1][1][2];
            // let tex3 = distData[2][1][2];
        
            let dist1 = distData[0][0];
            // let dist2 = distData[1][0];
            // let dist3 = distData[2][0];
        
            let bestDist = dist1;
            let bestPos = distData[0][1];
        
            // Move camera to best frame.
            camera.position = bestPos;
        
            // Move sphere
            this._parentObj._viewerSphere.position = bestPos;
        
            // Update texture
            this._parentObj._shader.setTextures(tex1); //, tex2, tex3, dist1, dist2, dist3);
            // this._viewerSphere.material.emissiveTexture = bestTexture;
        
            // Keep only guide spheres that are not so close
            for (let i=0; i<this._parentObj._guideSpheres.length; i++) {
                let sphere = this._parentObj._guideSpheres[i];
                let distToGuideSphere = this.BABYLON.Vector3.Distance(sphere.position, bestPos);
                if (distToGuideSphere < this._parentObj._guideSphereHiddenCutoffDist) {
                    sphere.visibility = 0.0;
                } else if (distToGuideSphere < this._parentObj._guideSphereShowCutoffDist) {
                    sphere.visibility = this._parentObj._guideSphereIntermediateFactor * (distToGuideSphere - this._parentObj._guideSphereHiddenCutoffDist);
                } else {
                    sphere.visibility = this._parentObj._guideSphereMaxVisibility;
                }
            }
    
            this._lastCameraLoc = camera.position.clone();
        }
    
    }
}
