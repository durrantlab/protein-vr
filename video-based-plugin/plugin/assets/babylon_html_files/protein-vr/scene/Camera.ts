import * as UserVars from "../config/UserVars";
import * as Globals from "../config/Globals";
import * as ViewerSphere from "./ViewerSphere";
import * as Arrows from "./Arrows";

interface CameraPointData {
    distance: number;
    position: any;
    associatedViewerSphere: any;
    angle?: number;
    score?: number;
}

class CameraPoints {
    public data: CameraPointData[] = [];

    public push(d: CameraPointData) {
        this.data.push(d);
    }

    private _getValBasedOnCriteria(d: CameraPointData, criteria="distance") {
        let val: number;
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

    public sort(criteria="distance") {
        this.data.sort(function(a, b) {
            let aVal: number = this.This._getValBasedOnCriteria(a, this.criteria);
            let bVal: number = this.This._getValBasedOnCriteria(b, this.criteria);
            
            if (aVal < bVal) { return -1; } 
            else if (aVal > bVal) { return 1; } 
            else { return 0; }
        }.bind({
            criteria: criteria,
            This: this
        }));
    }

    public removeFirst() {
        this.data.shift();
    }

    public firstPoint(): CameraPointData {
        return this.data[0];
    }

    public firstFewPoints(num: number): CameraPoints {
        let newCameraPoints = new CameraPoints();
        for (let i=0; i<num; i++) {
            newCameraPoints.push(this.data[i]);
        }
        return newCameraPoints;
    }

    public length(): number {
        return this.data.length;
    }

    public get(index: number): CameraPointData {
        return this.data[index];
    }

    public lessThanCutoff(cutoff: number, criteria="distance"): CameraPoints {
        let newCameraPoints = new CameraPoints();

        for (let dIndex=0; dIndex<this.data.length; dIndex++) {
            let d = this.data[dIndex];
            let val: number = this._getValBasedOnCriteria(d, criteria);
            if (val <= cutoff) {
                newCameraPoints.push(d);
            }
        }

        return newCameraPoints;
    }

    public addAnglesInPlace(pivotPoint: any, vec1: any): void {
        let BABYLON = Globals.get("BABYLON");
        for (let i=0; i<this.data.length; i++) {
            let d = this.data[i];
            let vec2 = d.position.subtract(pivotPoint).normalize();
            let angle = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
            this.data[i].angle = angle;
        }
    }

    public addScoresInPlace(maxAngle: number, maxDistance: number): void {
        // Combination of angle (should be close to 0) and distance (should be
        // close to 0). But need to be normalized.

        for (let i=0; i<this.data.length; i++) {
            let d = this.data[i];
            
            // Note that lower scores are better.
            let score = 0.5 * ((d.angle / maxAngle) + (d.distance / maxDistance));
            this.data[i].score = score;
        }        
    }

    public removePointsInSameGeneralDirection(pivotPt) {  // pivotPt is probably the camera location
        // This removes any points in the same general direction, keeping the
        // one that is closest.
        let BABYLON = Globals.get("BABYLON");
        for (let dIndex1=0; dIndex1<this.data.length - 1; dIndex1++) {
            if (this.data[dIndex1] !== null) {
                let pt1 = this.data[dIndex1].position;
                let vec1 = pt1.subtract(pivotPt).normalize();
    
                for (let dIndex2=dIndex1+1; dIndex2<this.data.length; dIndex2++) {
                    if (this.data[dIndex2] !== null) {
                        let pt2 = this.data[dIndex2].position;
                        let vec2 = pt2.subtract(pivotPt).normalize();
        
                        let angleBetweenVecs = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
                        if (angleBetweenVecs < 0.785398) {  // 45 degrees
                            let dist1 = this.data[dIndex1].distance;
                            let dist2 = this.data[dIndex2].distance;
        
                            // Note that the below alters the data in the source list.
                            // So don't use that list anymore. (Just use what this
                            // function returns...)
                            if (dist1 <= dist2) {
                                this.data[dIndex2] = null;
                            } else {
                                this.data[dIndex1] = null;
                            }
                        }
                    }
                }
            }
        }

        // Now keep only ones that are not null
        let newCameraPoints = new CameraPoints();
        for (let dIndex=0; dIndex<this.data.length - 1; dIndex++) {
            let d = this.data[dIndex];
            if (d !== null) {
                newCameraPoints.push(d);
            }
        }

        // Return the kept ones.
        return newCameraPoints;
    }
}

export class Camera {
    private BABYLON: any;

    private _mouseDownState: boolean = false;
    private _keyPressedState: number = undefined;
    private _firstRender: boolean = true;

    public setup() {

        return new Promise((resolve) => {
            let scene = Globals.get("scene");
            let canvas = Globals.get("canvas");
            let BABYLON = Globals.get("BABYLON");
            let isMobile = Globals.get("isMobile");
            let jQuery = Globals.get("jQuery");
            

            // Load the appropriate camera.
            switch (Globals.get("cameraTypeToUse")) {
                case "show-mobile-virtual-joystick":
                    this._setupVirtualJoystick();
                    break;
                case "show-desktop-screen":
                    scene.activeCamera.attachControl(canvas);
                    break;
                case "show-mobile-vr":
                    this._setupVRCamera();
                    break;
                case "show-desktop-vr":
                    // not sure what to do...
                    break;
            }
    
            this._setupMouseAndKeyboard();
    
            // Move camera to first position.
            scene.activeCamera.position = Globals.get("cameraPositions")[0];
    
            // Add extra keys
            // Additional control keys.
            // this._parentObj.scene.activeCamera.keysUp.push(87);  // W. 38 is up arrow.
            // this._parentObj.scene.activeCamera.keysLeft.push(65);  // A. 37 if left arrow.
            // this._parentObj.scene.activeCamera.keysDown.push(83);  // S. 40 is down arrow.
            // this._parentObj.scene.activeCamera.keysRight.push(68);  // D. 39 is right arrow.
    
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

            resolve({msg: "CAMERA SETUP"})
        });
    }

    private _setupVirtualJoystick() {
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let canvas = Globals.get("canvas");

        var VJC = new BABYLON.VirtualJoysticksCamera("VJC", scene.activeCamera.position, scene);
        VJC.rotation = scene.activeCamera.rotation;
        // VJC.checkCollisions = scene.activeCamera.checkCollisions;
        // VJC.applyGravity = scene.activeCamera.applyGravity;
        scene.activeCamera = VJC;
        
        // Attach camera to canvas inputs
        scene.activeCamera.attachControl(canvas);
    }

    private _setupVRCamera() {
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        let BABYLON = Globals.get("BABYLON");
        let jQuery = Globals.get("jQuery");

        // I feel like I should have to do the below... Why don't the defaults work?
        var metrics = BABYLON.VRCameraMetrics.GetDefault();
        //metrics.interpupillaryDistance = 0.5;

        // Add VR camera here (Oculus Rift, HTC Vive, etc.)
        let camera = new BABYLON.VRDeviceOrientationFreeCamera(
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

    private _setupMouseAndKeyboard() {
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

        window.addEventListener("keydown", function(evt) {
            this._keyPressedState = evt.keyCode;
        }.bind(this));
        
        window.addEventListener("keyup", function(evt) {
            this._keyPressedState = undefined;
        }.bind(this));
    }
    
    private _keepDataWithinDist(data: CameraPointData[], cutoffDist: number): CameraPointData[] {
        let toKeep: CameraPointData[] = [];
        for (let i=0; i<data.length; i++) {
            let d = data[i];
            if (d.distance < cutoffDist) {
                toKeep.push(d);
            }
        }
        return toKeep;
    }
    
    private _speedInUnitsPerSecond = 1;    
    private _lastMovementTime: number = (new Date).getTime();
    private _msUntilNextMoveAllowed: number = 0;
    public _prevCameraPos: any;
    public _nextMovementVec: any;
    public _prevViewerSphere: any;
    public _nextViewerSphere: any;
    public _cameraCurrentlyAutoMoving: boolean = false;

    private _updatePos(timeRatio, camera) {
        if (timeRatio < 0.5) {
            // First half of time ratio, next sphere is fading in.
            this._prevViewerSphere.visibility = 1.0;
            this._nextViewerSphere.visibility = 2 * timeRatio;
        } else {
            // Second half, previous one fades out.
            this._prevViewerSphere.visibility = 2.0 - 2 * timeRatio;
            this._nextViewerSphere.visibility = 1.0;
        }
        // this._prevViewerSphere.visibility = 1.0 - timeRatio;
        // this._nextViewerSphere.visibility = timeRatio;
        camera.position = this._prevCameraPos.add(this._nextMovementVec.scale(timeRatio));
    }

    public update() {
        // This is run from the render loop
        if (this._prevViewerSphere === undefined) {
            // Not ready yet...
            return;
        }

        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let camera = scene.activeCamera;

        let deltaTime = (new Date).getTime() - this._lastMovementTime;
        if (deltaTime < this._msUntilNextMoveAllowed) {
            this._cameraCurrentlyAutoMoving = true;
            this._whileCameraAutoMoving(deltaTime, camera);
            return;
        }

        if (this._cameraCurrentlyAutoMoving) {
            this._cameraCurrentlyAutoMoving = false;
            this._onDoneCameraAutoMoving(camera);
        }
        
        // So it's time to pick a new destination.
        // Only update things if user trying to move.
        let result;
        if (Globals.get("mouseDownAdvances") === true) {
            result = (this._mouseDownState === false) && (this._keyPressedState === undefined) && (this._firstRender === false);
        } else {
            result = (this._keyPressedState === undefined) && (this._firstRender === false);
        }
        if (result) { return; }

        this._firstRender = false;  // It's no longer the first time rendering.        
        
        this._onStartMove(camera);
    }

    private _onStartMove(camera) {
        // console.log("_onStartMove");
        
        // Make sure everything hidden but present sphere.
        ViewerSphere.hideAll();
        this._nextViewerSphere.visibility = 1.0;
        
        this._pickDirectionAndStartMoving(camera);
    }

    private _whileCameraAutoMoving(deltaTime, camera) {
        // console.log("_whileCameraAutoMoving");
        // Still in auto-moving phase. So auto-move here.
        let timeRatio = deltaTime / this._msUntilNextMoveAllowed;
        // let sigmoidalVal = 1.0/(1.0 + Math.exp(-(20 * timeRatio - 10)))
        // let sinVal = 0.5 + 0.5 * Math.sin(Math.PI * (timeRatio - 0.5));
        this._updatePos(timeRatio, camera);

        // fade out arrows with each move... looks good.
        Arrows.fadeDownAll(1.0 - timeRatio);

        // Move background sphere too.
        let backgroundSphere = Globals.get("backgroundSphere");
        backgroundSphere.position = camera.position;

    }

    private _onDoneCameraAutoMoving(camera) {
        // console.log("_onDoneCameraAutoMoving");
        // Make sure completed transition to full visibility.
        this._updatePos(1.0, camera);

        // Determine where you can move from here.
        this._setCloseCameraDataAndArrows(camera);

    }

    private _closeCameraData;
    private _setCloseCameraDataAndArrows(camera) {
        // console.log("_setCloseCameraData");

        // This filters the camera points, keeping only those that are
        // uniqueish and close to the camera.

        // Let's get the points close to the camera.
        let cameraLoc = camera.position;
        
        // Calculate distances to all camera positions
        let cameraPoints = new CameraPoints();
        let cameraPositions = Globals.get("cameraPositions");
        let viewerSpheres = Globals.get("viewerSpheres");
        for (let i=0; i<cameraPositions.length; i++) {
            let cameraPos = cameraPositions[i];
            let pos = cameraPos.clone();
            let dist = pos.subtract(cameraLoc).length();
            cameraPoints.push({distance: dist, position: pos, associatedViewerSphere: viewerSpheres[i]});
        }
        
        // Sort by distance
        cameraPoints.sort();
        
        // Remove first one (closest). To make sure you're not staying
        // where you are.
        cameraPoints.removeFirst();

        // Keep only four points. So I guess paths can't be too bifurcated.
        let closeCameraData = cameraPoints.firstFewPoints(Globals.get("numNeighboringCameraPosForNavigation"));  // choose four close points
                
        // Remove the points that are off in the same general direction
        closeCameraData = closeCameraData.removePointsInSameGeneralDirection(camera.position);

        // Position the arrows.
        Arrows.update(closeCameraData);
                
        this._closeCameraData = closeCameraData;
    }

    private _pickDirectionAndStartMoving(camera) {
        // console.log("_startMoving");

        // Start by assuming new camera point should be the closest point.
        let newCameraData: CameraPointData = this._closeCameraData.firstPoint();
        let maxDist = this._closeCameraData.data[this._closeCameraData.data.length-1].distance;

        // Assign angles
        let lookingVec = camera.getTarget().subtract(camera.position);
        switch (this._keyPressedState) {
            case 83:
                lookingVec = lookingVec.scale(-1);
                break;
            case 40:
                lookingVec = lookingVec.scale(-1);
                break;

            // Could't reliably distinguish between right and left...
            // case 65:
            //     lookingVec = new this.BABYLON.Vector3(lookingVec.z, 0, lookingVec.x)
            //     break;
            // case 37:
            //     lookingVec = new this.BABYLON.Vector3(lookingVec.z, 0, lookingVec.x)
            //     break
            // case 68:
            //     lookingVec = new this.BABYLON.Vector3(-lookingVec.z, 0, -lookingVec.x)
            //     break;
            // case 39:
            //     lookingVec = new this.BABYLON.Vector3(-lookingVec.z, 0, -lookingVec.x)
            //     break;
        }

        this._closeCameraData.addAnglesInPlace(camera.position, lookingVec);

        // Throw out ones that aren't even in the general direction as the
        // lookingVec
        let goodAngleCameraPoints = this._closeCameraData.lessThanCutoff(1.9198621771937625, "angle");  // 110 degrees

        switch(goodAngleCameraPoints.length()) {
            case 0:
                // You must be at the end of a path. Keep previous newCameraData;
                break;
            case 1:
                // Only one left, so it must be the one to keep.
                newCameraData = goodAngleCameraPoints.firstPoint();
                break;
            default:
                // assign scores to camera data, keep one with best score.
                goodAngleCameraPoints.addScoresInPlace(1.57, maxDist);  // 1.57 = 90 degrees
                goodAngleCameraPoints.sort("score");
                newCameraData = goodAngleCameraPoints.firstPoint();
                break;
        }

        // Set values to govern next auto movement.
        this._prevCameraPos = camera.position.clone();
        this._nextMovementVec = newCameraData.position.subtract(this._prevCameraPos);
        this._prevViewerSphere = this._nextViewerSphere;
        this._nextViewerSphere = newCameraData.associatedViewerSphere;
        this._msUntilNextMoveAllowed = 1000 * newCameraData.distance / this._speedInUnitsPerSecond;
        this._lastMovementTime = (new Date).getTime()
    }
}
