/* Things related to camera setup and movement. */

import * as UserVars from "../config/UserVars";
import * as Globals from "../config/Globals";
import * as ViewerSphere from "./ViewerSphere";
import * as Arrows from "./Arrows";
import { RenderingGroups } from "../config/Globals";

interface CameraPointData {
    distance: number;
    position: any;
    associatedViewerSphere: any;
    angle?: number;
    score?: number;
}

class CameraPoints {
    /*
    A class that keeps track of and processes the valid locations where the
    camera can reside (i.e., at the centers of viewer spheres.)
    */

    public data: CameraPointData[] = [];

    public push(d: CameraPointData): void {
        /*
        Add a point to the list of camera points.

        :param CameraPointData d: The data point to add.
        */

        this.data.push(d);
    }

    private _getValBasedOnCriteria(d: CameraPointData, criteria="distance") {
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

    public sort(criteria="distance"): void {
        /*
        Sorts the data points by a given criteria.

        :param string criteria: The criteria to use. "distance", "angle", or
                      "score". Defaults to "distance".
        */

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

    public removeFirst(): void {
        /*
        Remove the first item presently in the list of data points. This
        function is generally only useful if you've sorted the data points
        first.
        */

        this.data.shift();
    }

    public firstPoint(): CameraPointData {
        /*
        Get the first item presently in the list of data points. This function
        is generally only useful if you've sorted the data points first.

        :returns: The first camera point. 
        :rtype: :class:`CameraPointData`
        */

        return this.data[0];
    }

    public firstFewPoints(num: number): CameraPoints {
        /*
        Get the first several items presently in the list of data points. This
        function is generally only useful if you've sorted the data points
        first.

        :param int num: The number of top points to return.

        :returns: A CameraPoints containing the top points.
        :rtype: :class:`CameraPoints`
        */

        let newCameraPoints = new CameraPoints();
        for (let i=0; i<num; i++) {
            newCameraPoints.push(this.data[i]);
        }
        return newCameraPoints;
    }

    public length(): number {
        /*
        Get the number of points in the current list.

        :returns: the number of points.
        :rtype: :class:`int`
        */

        return this.data.length;
    }

    public get(index: number): CameraPointData {
        /*
        Get a specific data point from the list.

        :param int index: The index of the data point.

        :returns: The data point.
        :rtype: :class:`CameraPointData`
        */

        return this.data[index];
    }

    public lessThanCutoff(cutoff: number, criteria="distance"): CameraPoints {
        /*
        Get a list of all points that have values less than some cutoff.

        :param number cutoff: The cutoff to use.

        :param string criteria: The criteria to use. "distance", "angle", or
                      "score". Defaults to "distance".

        :param int num: The number of top points to return.

        :returns: A CameraPoints containing the points that meet the criteria.
        :rtype: :class:`CameraPoints`
        */

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
        /*
        Calculate angles between each of the points in this list and another
        point, with a third central ("pivot") point specified..

        :param BABYLON.Vector3 pivotPoint: The central point of the three
                               points that form the angle.

        :param BABYLON.Vector3 vec1: The third vector used to calculate the angle.
        */

        let BABYLON = Globals.get("BABYLON");
        for (let i=0; i<this.data.length; i++) {
            let d = this.data[i];
            let vec2 = d.position.subtract(pivotPoint).normalize();
            let angle = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
            this.data[i].angle = angle;
        }
    }

    public addScoresInPlace(maxAngle: number, maxDistance: number): void {
        /*
        Calculate scores for each of the points in this. Points right in front
        of the camera are given higher values, so both distance and angle play
        roles.

        :param number maxAngle: The maximum acceptable angle.

        :param number maxDistance: The maximum acceptable distance.
        */

        // Combination of angle (should be close to 0) and distance (should be
        // close to 0). But need to be normalized.

        for (let i=0; i<this.data.length; i++) {
            let d = this.data[i];
            
            // Note that lower scores are better.
            let score = 0.5 * ((d.angle / maxAngle) + (d.distance / maxDistance));
            this.data[i].score = score;
        }        
    }

    public removePointsInSameGeneralDirection(pivotPt): any {  // pivotPt is probably the camera location
        /*
        Get a list of data points without those points that are off more or
        less the same direction relative to the camera. No need for two arrows
        pointing in the same direction.

        :param BABYLON.Vector3 pivotPt: Probably the camera location.

        :returns: A CameraPoints containing the points that meet the criteria.
        :rtype: :class:`CameraPoints`
        */

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
        for (let dIndex=0; dIndex<this.data.length; dIndex++) {
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
    /* Class containing functions and properties of the camera. */

    private BABYLON: any;

    private _mouseDownState: boolean = false;
    private _keyPressedState: number = undefined;
    private _firstRender: boolean = true;

    public setup(): any {
        /*
        Sets up the camera.

        :returns: A promise to set up the camera.
        :rtype: :class:`any`
        */

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
                    this._setupVRDeviceOrientationFreeCamera();
                    break;
                case "show-desktop-vr":
                    // And as @Sebavan said, you need a user's interaction to
                    // render the scene in the headset (at least required by
                    // Chrome as far as I remember, not sure it's specified by
                    // the spec). So the below is commented out. It is instead
                    // run when the user presses the play button...
                    this._setupWebVRFreeCamera();
                    break;
            }
    
            this._setupMouseAndKeyboard();
    
            // Move camera to first position.
            let first_position = Globals.get("cameraPositions")[0];
            scene.activeCamera.position = first_position;
    
            // Add extra keys
            // Additional control keys.
            // TODO: Some reason this is commented out? Good to investigate...
            // this._parentObj.scene.activeCamera.keysUp.push(87);  // W. 38 is up arrow.
            // this._parentObj.scene.activeCamera.keysLeft.push(65);  // A. 37 if left arrow.
            // this._parentObj.scene.activeCamera.keysDown.push(83);  // S. 40 is down arrow.
            // this._parentObj.scene.activeCamera.keysRight.push(68);  // D. 39 is right arrow.
    
            resolve({msg: "CAMERA SETUP"})
        });
    }

    private _setupVirtualJoystick(): void {
        /*
        Sets up a virtual joystick. Good for users on phones who don't have
        google cardboard.
        */

        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let canvas = Globals.get("canvas");

        var camera = new BABYLON.VirtualJoysticksCamera("VJC", scene.activeCamera.position, scene);
        camera.rotation = scene.activeCamera.rotation;
        
        this._makeCameraReplaceActiveCamera(camera);
    }

    private _setupVRDeviceOrientationFreeCamera(): void {
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
        let camera = new BABYLON.VRDeviceOrientationFreeCamera(
            "deviceOrientationCamera", 
            scene.activeCamera.position, 
            scene,
            false,  // compensate distortion. False = good anti-aliasing.
            metrics
        );

        this._makeCameraReplaceActiveCamera(camera);
    }

    public _setupWebVRFreeCamera(): void {
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
            camera = new BABYLON.WebVRFreeCamera(
                "webVRFreeCamera", 
                scene.activeCamera.position, 
                scene
                // false,  // compensate distortion
                // { trackPosition: true }
                // metrics
            );
            // camera.deviceScaleFactor = 1;
        } else {
            camera = new BABYLON.VRDeviceOrientationFreeCamera(
                "deviceOrientationCamera", 
                scene.activeCamera.position, 
                scene
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
                for (let i=0; i<camera.controllers.length; i++) {
                    let controller = camera.controllers[i];

                    // Make sure controller mesh visible
                    let mesh = controller._mesh;
                    if (mesh !== undefined) {
                        mesh.renderingGroupId = RenderingGroups.VisibleObjects;                        
                        for (let j=0; j<mesh._children.length; j++) {
                            let childMesh = mesh._children[j];
                            childMesh.renderingGroupId = RenderingGroups.VisibleObjects;
                        }
                    }

                    // detect controller click
                    if (controller.onTriggerStateChangedObservable._observers.length === 0) {
                        controller.onTriggerStateChangedObservable.add((stateObject) => {
                            let state = (stateObject.pressed || stateObject.touched);
                            this._mouseDownState = state;  // Pretend it's a mouse click
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
                            this._mouseDownState = state;  // Pretend it's a mouse click
                        });    
                    }

                    if (controller.onSecondaryButtonStateChangedObservable._observers.length === 0) {
                        controller.onSecondaryButtonStateChangedObservable.add((stateObject) => {
                            let state = (stateObject.pressed || stateObject.touched);
                            this._mouseDownState = state;  // Pretend it's a mouse click
                        });    
                    }

                    if (controller.onMainButtonStateChangedObservable._observers.length === 0) {
                        controller.onMainButtonStateChangedObservable.add((stateObject) => {
                            // I don't think it's possible to trigger this on the Vive...
                            let state = (stateObject.pressed || stateObject.touched);
                            this._mouseDownState = state;  // Pretend it's a mouse click
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
        }

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

    private _makeCameraReplaceActiveCamera(camera: any): void {
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

    private _setupMouseAndKeyboard(): void {
        /*
        Setup mouse and keyboard navigation.
        */
        
        let scene = Globals.get("scene");
        
        // TODO: Commented out for WebVR debugging. This should be attached
        // after initial WebVR canvas-attach click.
        
        // First, setup mouse.
        if (Globals.get("cameraTypeToUse") !== "show-desktop-vr") {
            // Because if it's desktop VR, this function will be bound AFTER the first click (which starts the VR camera).
            this._setupMouseClick();
        }

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

    private _setupMouseClick(): void {
        /*
        Setup mouse clicking. Separate from above function to work with HTC Vive too (not bound until after initial click).
        */
        
        let scene = Globals.get("scene");

        scene.onPointerDown = function (evt, pickResult) {
            this._mouseDownState = true;
        }.bind(this);

        scene.onPointerUp = function (evt, pickResult) {
            this._mouseDownState = false;
        }.bind(this);
    }
    
    private _speedInUnitsPerSecond = 1;    
    private _lastMovementTime: number = (new Date).getTime();
    private _msUntilNextMoveAllowed: number = 0;
    public _prevCameraPos: any;
    public _nextMovementVec: any;
    public _prevViewerSphere: any;
    public _nextViewerSphere: any;
    public _cameraCurrentlyAutoMoving: boolean = false;

    private _updatePos(timeRatio: number, camera: any): void {
        /*
        Function that determines sphere visibility and camera location as the
        user moves between two locations.

        :param number timeRatio: A number between 0.0 and 1.0, showing how far
                      along the user is between the previous sphere location and the next
                      one.
                      
        :param ??? camera: The BABYLON camera object.
        */

        let transitionPt = 0.05;  // Good for this to be hard-coded eventually.
        this._nextViewerSphere.visibility = Math.min(timeRatio/transitionPt, 1.0);
        this._prevViewerSphere.visibility = (1 - timeRatio); //  / (1 - transitionPt);
        camera.position = this._prevCameraPos.add(this._nextMovementVec.scale(timeRatio));
    }

    public update() {
        /* 
        Update the camera. This is run from the render loop (every frame).
        */

        if (this._prevViewerSphere === undefined) {
            // Not ready yet... PNG images probably not loaded.
            return;
        }

        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let camera = scene.activeCamera;

        // Get the time that's elapsed since this function was last called.
        let deltaTime = (new Date).getTime() - this._lastMovementTime;

        if (deltaTime < this._msUntilNextMoveAllowed) {
            // Not enough time has passed to allow another movement.
            this._cameraCurrentlyAutoMoving = true;
            this._whileCameraAutoMoving(deltaTime, camera);
            return;
        }

        // NOTE: If you get here, you're ready to move again.

        if (this._cameraCurrentlyAutoMoving) {
            // Since this._cameraCurrentlyAutoMoving is true, this must be the
            // first time this function has been called since a new move was
            // permitted.
            this._cameraCurrentlyAutoMoving = false;
            
            // Run a function for first-time moving allowed.
            this._onDoneCameraAutoMoving(camera);
        }
        
        // So it's time to pick a new destination, but don't even try if the
        // user doesn't want to move (i.e., no active keypress our mousedown.)
        // Maybe they're looking around, not moving.
        let result;
        if (Globals.get("mouseDownAdvances") === true) {
            result = (this._mouseDownState === false) && (this._keyPressedState === undefined) && (this._firstRender === false);
        } else {
            result = (this._keyPressedState === undefined) && (this._firstRender === false);
        }
        if (result) { return; }

        // If you get here, you're ready to start moving, and the user
        // actually wants to move.
        this._firstRender = false;  // It's no longer the first time rendering.
        this._onStartMove(camera);
    }

    private _getCameraTarget(camera): any {
        if (Globals.get("cameraTypeToUse") === "show-desktop-vr") {
            // A rigged camera. Average two looking vectors.
            var leftCamera = camera.leftCamera;
            var rightCamera = camera.rightCamera;
            var vec1 = leftCamera.getTarget().subtract(leftCamera.position).normalize();
            var vec2 = rightCamera.getTarget().subtract(rightCamera.position).normalize();
            return vec1.add(vec2).scale(0.5).normalize();
        } else {
            return camera.getTarget();
        }
    }

    private _onStartMove(camera): void {
        /*
        Start the moving process from one sphere to the next. This function is
        fired only once, at beginning of moving (not every frame).

        :param ??? camera: The BABYLON camera.
        */
        
        // Make sure everything hidden but present sphere.
        ViewerSphere.hideAll();
        this._nextViewerSphere.visibility = 1.0;  // NOTE: Is this right?!?!?
        this._pickDirectionAndStartMoving(camera.position, this._getCameraTarget(camera));
    }

    private _whileCameraAutoMoving(deltaTime: number, camera: any): void {
        /*
        Runs every frame while the camera is transitioning from one valid
        camera location to the next.

        :param number deltaTime: The time since the camera started moving.

        :param ??? camera: The BABYLON camera.
        */

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

    private _onDoneCameraAutoMoving(camera): void {
        /*
        Runs once when the camera finishes transitioning from one valid camera
        location to the next.

        :param ??? camera: The BABYLON camera.
        */
        
        // Make sure completed transition to full visibility.
        this._updatePos(1.0, camera);

        // Determine where you can move from here.
        this._setCloseCameraDataAndArrows(camera);

        // Make sure environmental sphere properly positioned.
        Globals.get("backgroundSphere").position = camera.position;

    }

    private _closeCameraData;
    private _setCloseCameraDataAndArrows(camera: any): void {
        /*
        Identifies other valid camera locations that are near this one. Uses
        this information to set the arrow locations.

        :param ??? camera: The BABYLON camera.
        */

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

        // WILLIAM TODO: This function is for positioning arrows, but let's
        // take a detour here and also lazy load textures.
        let closeCameraDataForTextureLoading = cameraPoints.firstFewPoints(Globals.get("SOME NEW GLOBAL VARIABLE CUTOFF HERE"));  // choose four close points
        // STUFF HERE TO LOAD THE TEXTURES CORRESPONDING TO THE SPHERES AT POINTS closeCameraDataForTextureLoading
        // Only do this stuff if global variable lazyLoadViewerSpheres is true.
        

        // Now back to worrying about arrows....
        
        // Remove first one (closest). To make sure you're not staying
        // where you are.
        cameraPoints.removeFirst();

        // Keep only four points. So I guess paths can't be too bifurcated.
        let closeCameraData = cameraPoints.firstFewPoints(Globals.get("numNeighboringCameraPosForNavigation"));  // choose four close points

        // Remove the points that are off in the same general direction
        let closeCameraData2 = closeCameraData.removePointsInSameGeneralDirection(camera.position);
        // if (closeCameraData2.length() === 1) {
        //     debugger;
        //     closeCameraData.removePointsInSameGeneralDirection(camera.position);
        // }

        // Position the arrows.
        Arrows.update(closeCameraData2);
                
        this._closeCameraData = closeCameraData2;
    }

    // private _pickDirectionAndStartMoving(camera: any): void {
    private _pickDirectionAndStartMoving(focalPoint: any, targetPoint: any): void {
        /*
        Based on camera's direction, determine the next location to move to.
        This is called only once at the beinning of the moving cycle (not
        every frame).

        :param ??? focalPoint: BABYLON.Vector3 location. Probably the location of the camera.

        :param ??? targetPoint: BABYLON.Vector3 location. Probably the getTarget() of the camera.
        */

        // Start by assuming new camera point should be the closest point.
        let newCameraData: CameraPointData = this._closeCameraData.firstPoint();
        let maxDist = this._closeCameraData.data[this._closeCameraData.data.length-1].distance;

        // Assign angles
        let lookingVec = targetPoint.subtract(focalPoint).normalize();

        // console.log(focalPoint, targetPoint, lookingVec);
        
        switch (this._keyPressedState) {
            case 83:  // Up arrow?
                lookingVec = lookingVec.scale(-1);
                break;
            case 40:  // W?
                lookingVec = lookingVec.scale(-1);
                break;

            // TODO: Could't reliably distinguish between right and left...
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

        // Calculate angles between camera looking vector and the various
        // candidate camera locations.
        this._closeCameraData.addAnglesInPlace(focalPoint, lookingVec);

        // Throw out candidate camera locations that aren't even in the
        // general direction as the lookingVec
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
        this._prevCameraPos = focalPoint.clone();
        this._nextMovementVec = newCameraData.position.subtract(this._prevCameraPos);
        this._prevViewerSphere = this._nextViewerSphere;
        this._nextViewerSphere = newCameraData.associatedViewerSphere;
        this._msUntilNextMoveAllowed = 1000 * newCameraData.distance / this._speedInUnitsPerSecond;
        this._lastMovementTime = (new Date).getTime()
    }
}
