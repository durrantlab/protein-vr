/* Things related to camera setup and movement. */
define(["require", "exports", "../../config/Globals", "../Arrows", "../../Spheres/SphereCollection", "./Devices"], function (require, exports, Globals, Arrows, SphereCollection, Devices) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BABYLON;
    var isMobile;
    var _firstRender = true;
    var _lastCameraRotation;
    var _lastCameraRotationCheckTimestamp = 0;
    var _msBetweenCameraAngleChecks = 500;
    function setup() {
        /*
        Sets up the camera.
        */
        if (Globals.delayExec(setup, ["UserSettingsSpecifiedDialogClosed",
            "DataJsonLoadingDone"], "setup", this)) {
            return;
        }
        let scene = Globals.get("scene");
        let engine = Globals.get("engine");
        BABYLON = Globals.get("BABYLON");
        isMobile = Globals.get("isMobile");
        let jQuery = Globals.get("jQuery");
        _lastCameraRotation = new BABYLON.Vector3(0, 0, 0);
        _lastCameraRotationCheckTimestamp = new Date().getTime();
        // Set up the camera type (HTC Vive, for example) and input (keyboard,
        // mouse, etc.)
        Devices.setup();
        // First frame is initially visible.
        let firstSphere = SphereCollection.getByIndex(0);
        firstSphere.opacity(1.0);
        // Camera starts at location of first frame.
        scene.activeCamera.position = firstSphere.position.clone();
        _nextMovementVec = new BABYLON.Vector3(0, 0, 0);
        _startingCameraInMotion_ViewerSphere = firstSphere;
        _endingCameraInMotion_ViewerSphere = firstSphere;
        // Setup first steps forward
        _cameraJustFinishedBeingInMotion(scene.activeCamera);
        // Add blur post processes that can be turned on and off. Only if mobile.
        if (!isMobile) {
            let blurPipeline = new BABYLON.PostProcessRenderPipeline(engine, "blurPipeline");
            let kernel = 12.0;
            var horizontalBlur = new BABYLON.PostProcessRenderEffect(engine, "horizontalBlurEffect", function () {
                return new BABYLON.BlurPostProcess("hb", new BABYLON.Vector2(1.0, 0), kernel, 1.0, null, null, engine, false);
            });
            var verticalBlur = new BABYLON.PostProcessRenderEffect(engine, "verticalBlurEffect", function () {
                return new BABYLON.BlurPostProcess("vb", new BABYLON.Vector2(0, 1.0), kernel, 1.0, null, null, engine, false);
            });
            // var antiAlias = new BABYLON.PostProcessRenderEffect(engine, "antialias", function() { 
            //     return new BABYLON.FxaaPostProcess(
            //         "aa", 5.0, null, null, engine, false
            //     )
            // });
            blurPipeline.addEffect(horizontalBlur);
            blurPipeline.addEffect(verticalBlur);
            // blurPipeline.addEffect(antiAlias);
            scene.postProcessRenderPipelineManager.addPipeline(blurPipeline);
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("blurPipeline", scene.activeCamera);
            blur(false);
        }
        Globals.milestone("CameraSetup", true);
    }
    exports.setup = setup;
    function blur(val) {
        if (isMobile) {
            // No blur effect if it's mobile.
            return;
        }
        let scene = Globals.get("scene");
        switch (val) {
            case true:
                console.log("Blurring");
                scene.postProcessRenderPipelineManager.enableEffectInPipeline("blurPipeline", "horizontalBlurEffect", scene.activeCamera);
                scene.postProcessRenderPipelineManager.enableEffectInPipeline("blurPipeline", "verticalBlurEffect", scene.activeCamera);
                // scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("blurPipeline", scene.activeCamera);
                // scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("blurPipeline", scene.activeCamera);        
                break;
            case false:
                console.log("Unblurrng");
                scene.postProcessRenderPipelineManager.disableEffectInPipeline("blurPipeline", "horizontalBlurEffect", scene.activeCamera);
                scene.postProcessRenderPipelineManager.disableEffectInPipeline("blurPipeline", "verticalBlurEffect", scene.activeCamera);
                break;
        }
    }
    exports.blur = blur;
    var _speedInUnitsPerSecond = 1;
    var _lastMovementTime = (new Date).getTime();
    var _msUntilNextMoveAllowed = 0;
    var _nextMovementVec; // BABYLON.Vector3
    var _startingCameraInMotion_ViewerSphere;
    var _endingCameraInMotion_ViewerSphere;
    var _cameraCurrentlyInMotion = false;
    function update() {
        /*
        Update the camera. This is run from the render loop (every frame).
        */
        if (_startingCameraInMotion_ViewerSphere === undefined) {
            // Not ready yet... PNG images probably not loaded.
            return;
        }
        let scene = Globals.get("scene");
        let engine = Globals.get("engine");
        let camera = scene.activeCamera;
        // if (newCameraRotation.equalsWithEpsilon(_lastCameraRotation, 0.3)) {  // Allow for about 10 degree deviation (0.3 when you do the math). Because with VR headset there will always be a little movement.
        //     _lastCameraRotation = newCameraRotation;
        // }
        // Get the time that's elapsed since this function was last called.
        // There's a refractoty period between movements... don't move unless
        // enough time has passed. This is needed because the camera automatically
        // moves between camera points. While in motion, you can initiate another
        // motion.
        let curTime = new Date().getTime();
        let deltaTime = curTime - _lastMovementTime;
        if (deltaTime < _msUntilNextMoveAllowed) {
            // Not enough time has passed to allow another movement.
            _cameraCurrentlyInMotion = true;
            _whileCameraInMotion(deltaTime, camera);
            return;
        }
        if (curTime - _lastCameraRotationCheckTimestamp > _msBetweenCameraAngleChecks) {
            _lastCameraRotationCheckTimestamp = curTime;
            let newCameraRotation = camera.rotation.clone();
            let dist = BABYLON.Vector3.Distance(newCameraRotation, _lastCameraRotation);
            // console.log(dist);
            // console.log(dist/engine.getFps());
            if (dist > 0.05) {
                SphereCollection.setTimeOfLastMoveVar();
                // console.log("substantial movement");
            }
            _lastCameraRotation = newCameraRotation;
        }
        // NOTE: If you get here, you're ready to move again.
        if (_cameraCurrentlyInMotion) {
            // _cameraCurrentlyInMotion is still true, but enough time has passed
            // that the camera should no longer be in motion. This must be the
            // first time this function has been called since a refractory period ended. 
            // So the camera isn't really in motion anymore.
            _cameraCurrentlyInMotion = false;
            // Run a function for first-time moving allowed.
            _cameraJustFinishedBeingInMotion(camera);
        }
        // So it's time to pick a new destination. But don't even try if the user
        // doesn't want to move (i.e., no active keypress our mousedown.) Maybe
        // they're looking around, not moving.
        let result;
        if (Globals.get("mouseDownAdvances") === true) {
            result = (Devices.mouseDownState === false) && (Devices.keyPressedState === undefined) && (_firstRender === false);
        }
        else {
            result = (Devices.keyPressedState === undefined) && (_firstRender === false);
        }
        if (result) {
            return;
        }
        // If you get here, you're ready to start moving, and the user
        // actually wants to move.
        _cameraPickDirectionAndStartInMotion(camera);
        if (_firstRender) {
            blur(false); // Make sure not initially blurred.
        }
        _firstRender = false; // It's no longer the first time rendering.
    }
    exports.update = update;
    function _cameraPickDirectionAndStartInMotion(camera) {
        /*
        Start the moving process from one sphere to the next. This function is
        fired only once, at beginning of moving (not every frame). This is called
        only once at the beinning of the moving cycle (not every frame).
    
        :param ??? camera: The BABYLON camera.
        */
        // Note that at this point, it is _endingCameraInMotion that is the one
        // you're currently on. You haven't yet switched them... confusing...
        // Blur the camera ("motion blur"). Also helps with lowres images during
        // transition. It will be unblurred when high-res image-load attempt is
        // made.
        blur(true);
        // Make sure everything hidden but present sphere.
        SphereCollection.hideAll();
        _endingCameraInMotion_ViewerSphere.opacity(1.0);
        // pick the direction you'll move (based on nearby points, direction of
        // camera, etc.)
        let focalPoint = camera.position;
        let targetPoint = camera.getTarget();
        // Here needs to be a .copy(), because you might be changing the list
        // (eliinating ones with bad angles, for example, which you wouldn't do
        // when rending arrows).
        let _closeCameraPoints = _endingCameraInMotion_ViewerSphere.navigationNeighboringSpheresOrderedByDistance().copy();
        // Start by assuming new camera point should be the closest point.
        let newCameraPoint = _closeCameraPoints.firstPoint();
        let maxDist = _closeCameraPoints.data[_closeCameraPoints.data.length - 1].distance;
        // Assign angles
        let lookingVec = targetPoint.subtract(focalPoint).normalize();
        switch (Devices.keyPressedState) {
            case 83:
                lookingVec = lookingVec.scale(-1);
                break;
            case 40:
                lookingVec = lookingVec.scale(-1);
                break;
        }
        // Calculate angles between camera looking vector and the various
        // candidate camera locations.
        _closeCameraPoints.addAnglesInPlace(focalPoint, lookingVec);
        // Throw out candidate camera locations that aren't even in the
        // general direction as the lookingVec
        let goodAngleCameraPoints = _closeCameraPoints.lessThanCutoff(1.9198621771937625, "angle"); // 110 degrees
        switch (goodAngleCameraPoints.length()) {
            case 0:
                // You must be at the end of a path. Keep previous newCameraPoint
                // calculated above (closest one);
                break;
            case 1:
                // Only one left, so it must be the one to keep.
                newCameraPoint = goodAngleCameraPoints.firstPoint();
                break;
            default:
                // assign scores to camera data, keep one with best score.
                goodAngleCameraPoints.addScoresInPlace(1.57, maxDist); // 1.57 = 90 degrees
                goodAngleCameraPoints.sort("score");
                newCameraPoint = goodAngleCameraPoints.firstPoint();
                break;
        }
        // Set values to govern next in-motion transition (old ending becomes new
        // starting. New ending is new picked sphere location).
        _startingCameraInMotion_ViewerSphere = _endingCameraInMotion_ViewerSphere;
        _endingCameraInMotion_ViewerSphere = newCameraPoint.associatedViewerSphere;
        // Calculate which direction to move.
        _nextMovementVec = newCameraPoint.position.subtract(_startingCameraInMotion_ViewerSphere.position);
        // Calculate timing variables to govern movement.
        _msUntilNextMoveAllowed = 1000 * newCameraPoint.distance / _speedInUnitsPerSecond;
        _lastMovementTime = (new Date).getTime();
    }
    function _whileCameraInMotion(deltaTime, camera) {
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
        _updateInterpolatedPositionWhileInMotion(timeRatio, camera);
        // fade out arrows with each move... looks good.
        Arrows.fadeDownAll(1.0 - timeRatio);
        // Move skybox sphere too. It alwayd tracks the camera exactly (i.e.,
        // fixed relative to the camera).
        let skyboxSphere = Globals.get("skyboxSphere");
        skyboxSphere.position = camera.position;
    }
    function _updateInterpolatedPositionWhileInMotion(timeRatio, camera) {
        /*
        Function that determines sphere visibility and camera location as the
        user moves between two locations.
    
        :param number timeRatio: A number between 0.0 and 1.0, showing how far
                        along the user is between the previous sphere location and the next
                        one.
                        
        :param ??? camera: The BABYLON camera object.
        */
        // This is separate from the _whileCameraInMotion function because it is
        // also called elsewhere.
        let transitionPt = 0.05; // Good for this to be hard-coded eventually.
        _endingCameraInMotion_ViewerSphere.opacity(Math.min(timeRatio / transitionPt, 1.0));
        _startingCameraInMotion_ViewerSphere.opacity(1.0 - timeRatio); //  / (1 - transitionPt);
        camera.position = _startingCameraInMotion_ViewerSphere.position.add(_nextMovementVec.scale(timeRatio));
    }
    function _cameraJustFinishedBeingInMotion(camera) {
        /*
        Runs once when the camera finishes transitioning from one valid camera
        location to the next.
    
        :param ??? camera: The BABYLON camera.
        */
        // Unblur the camera.
        blur(false);
        // Make sure completed transition to full visibility.
        _updateInterpolatedPositionWhileInMotion(1.0, camera);
        // Set up new navigation arrows for new position.
        Arrows.update(_endingCameraInMotion_ViewerSphere.navigationNeighboringSpheresOrderedByDistance());
        // Set the current sphere to this one.
        _endingCameraInMotion_ViewerSphere.setToCurrentSphere();
        // Make sure environmental sphere properly positioned.
        Globals.get("skyboxSphere").position = camera.position;
    }
});
