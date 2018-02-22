/* Things related to camera setup and movement. */

import * as UserVars from "../../config/UserVars";
import * as Globals from "../../config/Globals";
import * as Arrows from "../Arrows";
import { Sphere } from "../../Spheres/Sphere";
import * as SphereCollection from "../../Spheres/SphereCollection";
import * as Devices from "./Devices";
import * as CameraPoints from "../../Spheres/CameraPoints";
import { TextureType } from "../../Spheres/Material";

var BABYLON: any;
var isMobile: boolean;

var _firstRender: boolean = true;

var _lastCameraRotation: any;
var _lastCameraRotationCheckTimestamp: number = 0;
var _msBetweenCameraAngleChecks: number = 500;

export function setup(): void {
    /*
    Sets up the camera.
    */
 
    if (Globals.delayExec(setup, ["UserSettingsSpecifiedDialogClosed", 
                                  "DataJsonLoadingDone"], 
                          "setup", this)) {
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
    let firstSphere: Sphere = SphereCollection.getByIndex(0);
    firstSphere.opacity(1.0);

    // Camera starts at location of first frame.
    scene.activeCamera.position = firstSphere.position.clone();
    _nextMovementVec = new BABYLON.Vector3(0,0,0);
    _startingCameraInMotion_ViewerSphere = firstSphere;
    _startingCameraInMotion_Position = _startingCameraInMotion_ViewerSphere.position.clone();
    _endingCameraInMotion_ViewerSphere = firstSphere;

    // Setup first steps forward
    _cameraJustFinishedBeingInMotion(scene.activeCamera);

    // Add blur post processes that can be turned on and off. Only if not mobile.
    if (!isMobile) {
        let blurPipeline = new BABYLON.PostProcessRenderPipeline(engine, "blurPipeline");
        let kernel = 12.0;
        var horizontalBlur = new BABYLON.PostProcessRenderEffect(engine, "horizontalBlurEffect", function() { 
            return new BABYLON.BlurPostProcess(
                "hb", new BABYLON.Vector2(1.0, 0), kernel, 1.0, null, null, engine, false
            )
        });
        var verticalBlur = new BABYLON.PostProcessRenderEffect(engine, "verticalBlurEffect", function() { 
            return new BABYLON.BlurPostProcess(
                "vb", new BABYLON.Vector2(0, 1.0), kernel, 1.0, null, null, engine, false
            )
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

    // Debug. Periodically output what the current material is.
    // setInterval(() => {
    //     console.log(SphereCollection.getCurrentSphere().material.material);
    // }, 5000);

    // If there's something in the url, the auto advance (parameters in url)
    
}

export function blur(val: boolean) {
    if (isMobile) {
        // No blur effect if it's mobile.
        return;
    }

    let scene = Globals.get("scene");

    switch(val) {
        case true:
            // console.log("Blurring");
            scene.postProcessRenderPipelineManager.enableEffectInPipeline("blurPipeline", "horizontalBlurEffect", scene.activeCamera);
            scene.postProcessRenderPipelineManager.enableEffectInPipeline("blurPipeline", "verticalBlurEffect", scene.activeCamera);
            // scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("blurPipeline", scene.activeCamera);
            // scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("blurPipeline", scene.activeCamera);        
            break;
        case false:
            // console.log("Unblurrng");
            scene.postProcessRenderPipelineManager.disableEffectInPipeline("blurPipeline", "horizontalBlurEffect", scene.activeCamera);
            scene.postProcessRenderPipelineManager.disableEffectInPipeline("blurPipeline", "verticalBlurEffect", scene.activeCamera);
            break;
    }
}

var _speedInUnitsPerSecond: number = 1;    
var _lastMovementTime: number = (new Date).getTime();
var _msUntilNextMoveAllowed: number = 0;
var _nextMovementVec: any;  // BABYLON.Vector3
var _startingCameraInMotion_Position: any;  // BABYLON.Vector3 
var _startingCameraInMotion_ViewerSphere: Sphere;
var _endingCameraInMotion_ViewerSphere: Sphere;
// var _cameraCurrentlyInMotion: boolean = false;
var _troublesLoading: boolean = false;
var _currentlyMoving: boolean = false;
export function update() {
    /* 
    Update the camera. This is run from the render loop (every frame).
    */

    // console.log("1");

    // console.log(SphereCollection.getCurrentSphere().material.material);
    // window.currentSphere = SphereCollection.getCurrentSphere();
    // if (SphereCollection.getCurrentSphere().sphereMesh === null) {
    //     // console.log(SphereCollection.getCurrentSphere().sphereMesh.isVisible);
    //     console.log("prob!");
    //     _troublesLoading = true;
    //     // let t = SphereCollection.getCurrentSphere();
    //     // debugger;
    //     return;
    // }
    // if (_troublesLoading) {
    //     _troublesLoading = false;
    //     SphereCollection.getCurrentSphere().sphereMesh.isVisible = true;
    //     // console.log(SphereCollection.getCurrentSphere().sphereMesh.isVisible);
    // }


    if (_startingCameraInMotion_ViewerSphere === undefined) {
        // Not ready yet... PNG images probably not loaded.
        return;
    }

    let scene = Globals.get("scene");
    let camera = scene.activeCamera;

    // if (newCameraRotation.equalsWithEpsilon(_lastCameraRotation, 0.3)) {  // Allow for about 10 degree deviation (0.3 when you do the math). Because with VR headset there will always be a little movement.
    //     _lastCameraRotation = newCameraRotation;
    // }

    // Get the time that's elapsed since this function was last called.
    // There's a refractoty period between movements... don't move unless
    // enough time has passed. This is needed because the camera automatically
    // moves between camera points. While in motion, you can't initiate
    // another motion.
    let curTime = new Date().getTime();
    let deltaTime = curTime - _lastMovementTime;
    // console.log(deltaTime, _msUntilNextMoveAllowed);
    // console.log("2");

    // console.log(deltaTime, "<", _msUntilNextMoveAllowed, "SS");

    if (_currentlyMoving) {
        if (deltaTime < _msUntilNextMoveAllowed) {
            // Not enough time has passed to allow another movement.
            // _cameraCurrentlyInMotion = true;
            _whileCameraInMotion(deltaTime, camera);
            return;
        } else {
            // Enough time has passed that the camera should no longer be in
            // motion. This must be the first time this function has been
            // called since a refractory period ended. 

            // So the camera isn't really in motion anymore.
            // _cameraCurrentlyInMotion = false;
            
            // Run a function for first-time moving allowed.
            _cameraJustFinishedBeingInMotion(camera);  // This sets _currentlyMoving to false
        }
    }

    // You're not translating, but are you look around much (within a
    // tolerance)? This is used elsewhere to load in high-res tetures.
    if (curTime - _lastCameraRotationCheckTimestamp > _msBetweenCameraAngleChecks) {
        _lastCameraRotationCheckTimestamp = curTime;

        let newCameraRotation = camera.rotation.clone();
        let dist = BABYLON.Vector3.Distance(newCameraRotation, _lastCameraRotation);
        if (dist > 0.05) {  // tested by trial and error. Just little jiggles, not real movement.
            SphereCollection.setTimeOfLastMoveVar();
        }
        _lastCameraRotation = newCameraRotation;
    }

    // NOTE: If you get here, you're ready to move again.

    // If you're not moving, it's okay to show the navigation looking spheres.
    // This is for advanced navigation system.
    // let currentSphere: Sphere = SphereCollection.getCurrentSphere();
    // currentSphere.getOtherSphereLookingAt();

    // Make sure the camera location doesn't depend on camera input.
    // Especially useful for keeping the virtual joystick from wandering off.
    camera.position = SphereCollection.getCurrentSphere().position.clone();

    // So it's time to pick a new destination. But don't even try if the user
    // doesn't want to move (i.e., no active keypress our mousedown.) Maybe
    // they're looking around, not moving.

    // If the left joystick is pressed, trigger move forward.
    let leftTriggerDownState: boolean = false;
    if (Globals.get("cameraTypeToUse") === "show-mobile-virtual-joystick") {
        leftTriggerDownState = camera.inputs.attached.virtualJoystick._leftjoystick.pressed;
    }

    let result;
    if (Globals.get("mouseDownAdvances") === true) {
        result = ((Devices.mouseDownState === false) && 
                  (Devices.keyPressedState === undefined) && 
                  (leftTriggerDownState === false) &&
                  (_firstRender === false));
    } else {
        result = ((Devices.keyPressedState === undefined) && 
                  (leftTriggerDownState === false) &&
                  (_firstRender === false));
    }
    if (result) { return; }

    // If you get here, you're ready to start moving, and the user
    // actually wants to move.
    _cameraPickDirectionAndStartInMotion(camera);
    if (_firstRender) {
        blur(false);  // Make sure not initially blurred.
    }
    _firstRender = false;  // It's no longer the first time rendering.
}

function _getCameraTarget(camera): any {
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

export function lookingVector(camera = undefined) {
    if (camera === undefined) {
        camera = Globals.get("scene").activeCamera;
    }
    let targetPoint = _getCameraTarget(camera);
    let lookingVec = targetPoint.subtract(camera.position).normalize();
    return lookingVec;
}

function _cameraPickDirectionAndStartInMotion(camera): void {
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

    // Here needs to be a .copy(), because you might be changing the list
    // (eliinating ones with bad angles, for example, which you wouldn't do
    // when rending arrows).
    let _closeCameraPoints = _endingCameraInMotion_ViewerSphere.navigationNeighboringSpheresOrderedByDistance().copy();  

    // Start by assuming new camera point should be the closest point.
    let newCameraPoint = _closeCameraPoints.firstPoint();

    let maxDist = _closeCameraPoints.data[_closeCameraPoints.data.length-1].distance;

    // Assign angles
    let lookingVec = lookingVector(camera);
    switch (Devices.keyPressedState) {
        case 83:  // Up arrow?
            lookingVec = lookingVec.scale(-1);
            break;
        case 40:  // W?
            lookingVec = lookingVec.scale(-1);
            break;

        // TODO: Could't reliably distinguish between right and left...
        // case 65:
        //     lookingVec = new BABYLON.Vector3(lookingVec.z, 0, lookingVec.x)
        //     break;
        // case 37:
        //     lookingVec = new BABYLON.Vector3(lookingVec.z, 0, lookingVec.x)
        //     break
        // case 68:
        //     lookingVec = new BABYLON.Vector3(-lookingVec.z, 0, -lookingVec.x)
        //     break;
        // case 39:
        //     lookingVec = new BABYLON.Vector3(-lookingVec.z, 0, -lookingVec.x)
        //     break;
    }

    // Calculate angles between camera looking vector and the various
    // candidate camera locations.
    _closeCameraPoints.addAnglesInPlace(focalPoint, lookingVec);

    // Throw out candidate camera locations that aren't even in the
    // general direction as the lookingVec
    let goodAngleCameraPoints = _closeCameraPoints.lessThanCutoff(1.9198621771937625, "angle");  // 110 degrees
    
    switch(goodAngleCameraPoints.length()) {
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
            goodAngleCameraPoints.addScoresInPlace(1.57, maxDist);  // 1.57 = 90 degrees
            goodAngleCameraPoints.sort("score");
            newCameraPoint = goodAngleCameraPoints.firstPoint();
            break;
    }

    // If the new viewer sphere doesn't have a texture, abort!
    // Same if it doesn't have a sphere mesh or something.

    let nextCamAssociatedViewerSphere = newCameraPoint.associatedViewerSphere;
    if ((nextCamAssociatedViewerSphere.material.textureType === TextureType.None) || 
        (!nextCamAssociatedViewerSphere.assetsLoaded)) {
        // (SphereCollection.getCurrentSphere().sphereMesh !== null)) {
        console.log("** Aborted movement, texture not yet loaded...");

        // Try to load the texture.
        nextCamAssociatedViewerSphere.loadAssets();
        // newCameraPoint.associatedViewerSphere.loadAssets();

        blur(false);
        
        // Make sure everything hidden but present sphere.
        // SphereCollection.hideAll();
        // newCameraPoint.associatedViewerSphere.opacity(1.0);
        
        _msUntilNextMoveAllowed = 0;  // allow movement in a bit.
        return;
    }

    // Set values to govern next in-motion transition (old ending becomes new
    // starting. New ending is new picked sphere location).
    _startingCameraInMotion_ViewerSphere = _endingCameraInMotion_ViewerSphere;
    _endingCameraInMotion_ViewerSphere = newCameraPoint.associatedViewerSphere;

    // Keep track of where to move from. You can't just use the starting
    // sphere, because that will track the camera until it disappears.
    _startingCameraInMotion_Position = _startingCameraInMotion_ViewerSphere.position.clone();

    // Calculate which direction to move.
    _nextMovementVec = newCameraPoint.position.subtract(_startingCameraInMotion_ViewerSphere.position);

    // Calculate timing variables to govern movement.
    // console.log(newCameraPoint.distance);
    // _msUntilNextMoveAllowed = Math.max(1000 * newCameraPoint.distance / _speedInUnitsPerSecond, 100);
    _msUntilNextMoveAllowed = 1000 * newCameraPoint.distance / _speedInUnitsPerSecond;

    // Put limits on time between frames. It should never be more than 0.5
    // sec, independent of units per sec.
    if (_msUntilNextMoveAllowed > 500) {
        _msUntilNextMoveAllowed = 500;
    }

    // Make sure not too fast, too. Need to give time to buffer.
    if (_msUntilNextMoveAllowed < 50) {
        _msUntilNextMoveAllowed = 50;
    }
    
    _lastMovementTime = (new Date).getTime();

    // console.log("starting", newCameraPoint.position, _startingCameraInMotion_ViewerSphere.position, newCameraPoint.distance); // , _msUntilNextMoveAllowed, _nextMovementVec);

    _currentlyMoving = true;

}

function _whileCameraInMotion(deltaTime: number, camera: any): void {
    /*
    Runs every frame while the camera is transitioning from one valid
    camera location to the next.

    :param number deltaTime: The time since the camera started moving.

    :param ??? camera: The BABYLON camera.
    */

    // Still in auto-moving phase. So auto-move here.
    let timeRatio = deltaTime / _msUntilNextMoveAllowed;

    // console.log(timeRatio);

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


// The point at which the destination sphere starts to fade in.
let _transitionPt1 = 0.35; //0.05;  // This is really scene specific. This seems like a good compromise.

// The point at which the current sphere starts to fade out. This is also
// the point where the destination sphere is fully opaque.
let _transitionPt2 = 0.75; //0.1;  // Good for this to be hard-coded eventually.

// The point at whch the current sphere has finished fading out.
let _transitionPt3 = 0.99; //0.8;

let _transitionDelta1 = _transitionPt2 - _transitionPt1;
let _transitionDelta2 = (_transitionPt2 - _transitionPt3)

function _updateInterpolatedPositionWhileInMotion(timeRatio: number, camera: any): void {
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

    // Make sure camera you're transitioning to is always fully visible (but
    // hidden behind current sphere, which starts out visible too.)
    // _endingCameraInMotion_ViewerSphere.opacity(1.0);

    _endingCameraInMotion_ViewerSphere.opacity(
        Math.max(
            0.0,
            Math.min(
                1.0, 
                (timeRatio - _transitionPt1)/_transitionDelta1
            )
        )
    );

    _startingCameraInMotion_ViewerSphere.opacity(
        Math.max(
            0.0,
            Math.min(
                1.0, 
                (timeRatio - _transitionPt3)/_transitionDelta2
            )
        )
    ); //  / (1 - transitionPt);

    camera.position = _startingCameraInMotion_Position.add(_nextMovementVec.scale(timeRatio));

    // _startingCameraInMotion_ViewerSphere must track the camera until it
    // disappears. It's position is reset elsewhere (when done moving).
    // console.log(_startingCameraInMotion_ViewerSphere.sphereMesh, camera);

    if (_startingCameraInMotion_ViewerSphere.sphereMesh !== null) {  // needed to prevent an error sometimes
        _startingCameraInMotion_ViewerSphere.sphereMesh.position = camera.position;
    } /* else {
        console.log("_startingCameraInMotion_ViewerSphere.sphereMesh.position === null!!!");
    }*/

    // The current viewer sphere needs to be moving with you!!!

    // console.log(camera.position.x, _startingCameraInMotion_ViewerSphere.position.x, _endingCameraInMotion_ViewerSphere.position.x);
}

function _cameraJustFinishedBeingInMotion(camera): void {
    /*
    Runs once when the camera finishes transitioning from one valid camera
    location to the next.

    :param ??? camera: The BABYLON camera.
    */

    // console.log("=======");

    // console.log("ending");


    // Unblur the camera.
    blur(false);            
            
    // Make sure completed transition to full visibility.
    _updateInterpolatedPositionWhileInMotion(1.0, camera);


    // Reset the positions of the spheres. Because the starting sphere was
    // tracking the camera.
    _endingCameraInMotion_ViewerSphere.resetSphereMeshPosition();
    _startingCameraInMotion_ViewerSphere.resetSphereMeshPosition();

    // Set up new navigation arrows for new position.
    Arrows.update(
        _endingCameraInMotion_ViewerSphere.navigationNeighboringSpheresOrderedByDistance()
    );

    // Set the current sphere to this one.
    _endingCameraInMotion_ViewerSphere.setToCurrentSphere();

    // Make sure environmental sphere properly positioned.
    // console.log(Globals.get("skyboxSphere"));  // *****
    Globals.get("skyboxSphere").position = camera.position;

    _currentlyMoving = false;
}
