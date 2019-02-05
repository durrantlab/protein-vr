// This module handles all things navigation related.
define(["require", "exports", "./CommonCamera", "./Navigation", "./NonVRCamera", "./Pickables", "./Vars", "./VRCamera"], function (require, exports, CommonCamera, Navigation, NonVRCamera, Pickables, Vars, VRCamera) {
    "use strict";
    exports.__esModule = true;
    // enum ClickAction { None, Teleport, GrowHeight }
    // let clickAction: ClickAction = ClickAction.Teleport;
    var NavMode;
    (function (NavMode) {
        NavMode[NavMode["VRWithControllers"] = 0] = "VRWithControllers";
        NavMode[NavMode["VRNoControllers"] = 1] = "VRNoControllers";
        NavMode[NavMode["NoVR"] = 2] = "NoVR";
    })(NavMode = exports.NavMode || (exports.NavMode = {}));
    // interface IStarePointInf {
    //     point: any;  // BABYLON.Vector3
    //     targetMesh: any;  // The mesh you're staring at.
    // }
    // ***** TODO: WORK ON THIS:
    // export let interactingObjs = [];
    // export function addInteractingObj(mesh) { interactingObjs.push(mesh); }
    var currentlyTeleporting = false;
    exports.curStarePt = new BABYLON.Vector3(0, 0, 0); // : IStarePointInf;
    function setCurStarePt(pt) {
        exports.curStarePt.copyFrom(pt);
    }
    exports.setCurStarePt = setCurStarePt;
    exports.pointWayOffScreen = new BABYLON.Vector3(-1000, 1000, 1000);
    // When using a VR camera, the vrHelper automatically positions
    // vrCameraGazeTrackerMesh at the stare location. Putting it here because it's
    // navigation relevant.
    // export let vrCameraGazeTrackerMesh;
    // export function setVRCameraGazeTrackerMesh(val) { vrCameraGazeTrackerMesh = val; }
    function setup() {
        // Allways collide with a floor mesh, which must be hidden.
        Vars.vars.groundMesh = Vars.vars.scene.getMeshByID(Vars.vars.groundMeshName);
        if (Vars.vars.groundMesh === null) {
            alert("No mesh named " + Vars.vars.groundMeshName);
        }
        Vars.vars.groundMesh.checkCollisions = true;
        Vars.vars.groundMesh.visibility = 0;
        // Initially, no VR.
        Vars.vars.navMode = Navigation.NavMode.NoVR;
        // Vars.vars.navMode = Navigation.NavMode.VRNoControllers;
        // Setup triggers.
        setupTriggers();
        // Constantly update the stare point info. Also, position the tracking
        // mesh.
        Vars.vars.scene.registerBeforeRender(function () {
            setStarePointInfo();
            cancelStareIfFarAway();
            Vars.vars.navTargetMesh.position.copyFrom(exports.curStarePt);
            // fixPointHeightAboveGround();
            // const ray = new BABYLON.Ray(
            //     Vars.vars.scene.activeCamera.position,
            //     new BABYLON.Vector3(0, -1, 0), 50,
            // );
            // const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
            //     return (mesh.id === Vars.vars.groundMesh.id);
            // });
            // console.log(Vars.vars.cameraHeight, pickingInfo.distance);
            // if (Pickables.curPickedMesh === undefined) {
            // console.log(undefined);
            // } else {
            // console.log(Pickables.curPickedMesh.name);
            // console.log(curStarePt, Vars.vars.navTargetMesh.position.clone());
            // }
        });
        // setInterval(() => {
        // console.log(curStarePt, Vars.vars.navTargetMesh.position.clone(), vrCameraGazeTrackerMesh.position);
        // console.log(Pickables.curPickedMesh.name);
        // }, 2000);
    }
    exports.setup = setup;
    function setupTriggers() {
        // Space always triggers
        jQuery("body").keypress(function (e) {
            if (e.charCode === 32) {
                // Space bar
                actOnStareTrigger();
            }
        });
        // TODO: Click should trigger too?
    }
    /**
     * Gets the point on the floor where the user is looking (or pointing with
     * controllers).
     * @returns IStarePointInf The point and target. Target is null if if not
     *                         looking/pointing at anything.
     */
    function setStarePointInfo() {
        // This function runs with ever turn of the render loop. Set's information
        // about what you're looking/pointing at. Info saved to curStarePt
        var ray;
        if (Vars.vars.navMode === NavMode.NoVR) {
            // No VR yet. So it's outside the realm of the VRHelper. Calculate
            // it using the looking direction.
            // Get a ray extending out in the direction of the stare.
            ray = Vars.vars.scene.activeCamera.getForwardRay();
        }
        else if ((Vars.vars.navMode === NavMode.VRNoControllers) ||
            (Vars.vars.navMode === NavMode.VRWithControllers)) {
            // No controllers yet. So tracking the params.navTargetMesh.
            // newLoc = NavTargetMesh.navTrgtMeshBeingTracked.position.clone();
            // dist = BABYLON.Vector3.Distance(getCameraPosition(), newLoc);
            // decideWhichClickAction(dist, newLoc);
            // return newLoc;
            // Find the valid gazetracker mesh.
            var gazeTrackerMesh = void 0;
            if (Vars.vars.navMode === NavMode.VRWithControllers) {
                gazeTrackerMesh = VRCamera.vrHelper.rightControllerGazeTrackerMesh;
                if (!gazeTrackerMesh) {
                    gazeTrackerMesh = VRCamera.vrHelper.leftControllerGazeTrackerMesh;
                }
            }
            else if (Vars.vars.navMode === NavMode.VRNoControllers) {
                gazeTrackerMesh = VRCamera.vrHelper.gazeTrackerMesh;
            }
            if (!gazeTrackerMesh) {
                console.log("error!");
                return;
            }
            if (!gazeTrackerMesh.isVisible) {
                setCurStarePt(exports.pointWayOffScreen);
            }
            else {
                setCurStarePt(gazeTrackerMesh.absolutePosition);
            }
            // Construct a ray from the camera to the stare obj
            var camPos = CommonCamera.getCameraPosition();
            ray = new BABYLON.Ray(camPos, exports.curStarePt.subtract(camPos));
        }
        else {
            console.log("Unexpected error.");
        }
        setPickPointAndObjInScene(ray);
    }
    exports.setStarePointInfo = setStarePointInfo;
    function setPickPointAndObjInScene(ray, updatePos) {
        if (updatePos === void 0) { updatePos = true; }
        // Determines where that ray intersects the floor.
        var pickingInfo = Vars.vars.scene.pickWithRay(ray, function (mesh) {
            return Pickables.checkIfMeshPickable(mesh);
        });
        // Get the results.
        // if (pickingInfo.pickedMesh) {
        // console.log(pickingInfo.pickedMesh.name);
        // }
        if (pickingInfo.hit) {
            // It does hit the floor. Return the point.
            if (updatePos) {
                setCurStarePt(pickingInfo.pickedPoint);
            }
            Pickables.setCurPickedMesh(pickingInfo.pickedMesh);
        }
        else {
            // It doesn't hit the floor, so return null.
            setCurStarePt(exports.pointWayOffScreen);
            Pickables.setCurPickedMesh(undefined);
        }
    }
    function cancelStareIfFarAway() {
        if (exports.curStarePt === undefined) {
            setCurStarePt(exports.pointWayOffScreen);
            Pickables.setCurPickedMesh(undefined);
        }
        else {
            var dist = BABYLON.Vector3.Distance(CommonCamera.getCameraPosition(), exports.curStarePt);
            if (dist > 10) {
                setCurStarePt(exports.pointWayOffScreen);
                Pickables.setCurPickedMesh(undefined);
            }
        }
    }
    function actOnStareTrigger() {
        // Click, space, or something. You need to decide how to act.
        switch (Pickables.getCategoryOfCurMesh()) {
            case Pickables.PickableCategory.Ground:
                // It's the ground, so teleport there.
                teleport();
                break;
            case Pickables.PickableCategory.Molecule:
                // It's a molecule, so increase the height.
                grow();
                break;
            default:
                // None.
                break;
        }
    }
    exports.actOnStareTrigger = actOnStareTrigger;
    /**
     * Teleport to a given location.
     * @param  {IStarePointInf} starePt The location to transport to (BABYLON.Vector3).
     * @returns void
     */
    function teleport(newLoc, callBack) {
        if (newLoc === void 0) { newLoc = undefined; }
        if (callBack === void 0) { callBack = function () { return; }; }
        currentlyTeleporting = true;
        // Hide the bigger nav mesh. It will appear again elsewhere.
        // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = false;
        VRCamera.vrHelper.gazeTrackerMesh.isVisible = false;
        // Animate the transition to the new location.
        var animationCameraTeleportation = new BABYLON.Animation("animationCameraTeleportation", "position", 90, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        // The start location.
        var startLoc = CommonCamera.getCameraPosition();
        // Get the new location.
        if (newLoc === undefined) {
            // If it's not defined, use the current stare point.
            newLoc = new BABYLON.Vector3(exports.curStarePt.x, exports.curStarePt.y + Vars.vars.cameraHeight, exports.curStarePt.z);
        }
        // Correct if VR camera.
        var eyeToCamVec = CommonCamera.getVecFromEyeToCamera();
        newLoc = newLoc.subtract(eyeToCamVec);
        startLoc = startLoc.subtract(eyeToCamVec);
        // Animate to new location.
        var animationSteps = 11;
        var animationCameraTeleportationKeys = [
            { frame: 0, value: startLoc },
            { frame: animationSteps, value: newLoc },
        ];
        animationCameraTeleportation.setKeys(animationCameraTeleportationKeys);
        var activeCamera = Vars.vars.scene.activeCamera;
        activeCamera.animations = [];
        activeCamera.animations.push(animationCameraTeleportation);
        Vars.vars.scene.beginAnimation(activeCamera, 0, animationSteps, false, 1, function () {
            // Animation finished callback.
            currentlyTeleporting = false;
            VRCamera.vrHelper.gazeTrackerMesh.isVisible = true;
            // Erase animation
            activeCamera.animations = [];
            callBack();
        });
    }
    /**
     * Grow to a given height.
     * @param  {number} newHeight The new height.
     * @returns void
     */
    function grow(newHeight) {
        if (newHeight === void 0) { newHeight = undefined; }
        if (newHeight === undefined) {
            newHeight = distToPtProjectedToGround(exports.curStarePt).distance;
        }
        // Set the new height.
        var deltaHeight = newHeight - Vars.vars.cameraHeight;
        Vars.vars.cameraHeight = newHeight;
        // Get the point immediately below the current camera location.
        // const ray = new BABYLON.Ray(
        // CommonCamera.getCameraPosition(), new BABYLON.Vector3(0, -1, 0), 50,
        // );
        // const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
        // return (mesh.id === Vars.vars.groundMesh.id);
        // });
        var newPt = CommonCamera.getCameraPosition().clone();
        newPt.y = newPt.y + deltaHeight;
        teleport(newPt, function () {
            // Make sure the collision elipsoid surrounding the non-VR camera
            // matches the new height.
            NonVRCamera.setCameraElipsoid();
        });
        // let ptBelowCamera = distToPtProjectedToGround(
        //     CommonCamera.getCameraPosition(),
        // ).pickedPoint;
        // ptBelowCamera
        // console.log(ptBelowCamera);
        // debugger;
    }
    /**
     * A function to make sure the camera is always over the floor mesh.
     */
    // function fixPointHeightAboveGround(pt) {
    //     // Don't check if recently checked.
    //     // const nowTime = new Date().getTime();
    //     // if (nowTime - timeOfLastCameraPosCheck < 100) {
    //     //     return;
    //     // }
    //     // timeOfLastCameraPosCheck = nowTime;
    //     // Every once in a while, check if you're over the floor mesh. Cast a ray
    //     // directly down from the camera.
    //     // const activeCameraPos = Navigation.getCameraPosition();
    //     // const ray = new BABYLON.Ray(activeCameraPos, new BABYLON.Vector3(0, -1, 0), 50);
    //     const ray = new BABYLON.Ray(pt, new BABYLON.Vector3(0, -1, 0), 50);
    //     // Look for hits on the ground.
    //     const pickingInfo = Vars.vars.scene.pickWithRay(ray, (mesh) => {
    //         return (mesh.id === Vars.vars.groundMesh.id);
    //     });
    //     // If there's a hit on the ground...
    //     if (pickingInfo.hit) {
    //         // Calculate the distance.
    //         // let dist = BABYLON.Vector3.Distance();
    //         let deltaHeight = pickingInfo.distance - Vars.vars.cameraHeight;
    //         let newPt = pt.clone();
    //         newPt.y = newPt.y - deltaHeight;
    //         // Vars.vars.scene.activeCamera.position.y = Vars.vars.scene.activeCamera.position.y - deltaHeight;
    //     }
    //     return pt;
    //     // Check if the ray hit the floor.
    //     // if (ptProjectedToGround(activeCameraPos).hit) {
    //         // It hit the floor. Save the current camera coordiantes.
    //         // lastCameraPosAboveGroundMesh.copyFrom(activeCameraPos);
    //     // }
    //     // else {
    //         // TODO: VR camera?
    //         // Vars.vars.scene.activeCamera.position.copyFrom(lastCameraPosAboveGroundMesh);
    //     // }
    // }
    function distToPtProjectedToGround(pt) {
        var ray = new BABYLON.Ray(pt, new BABYLON.Vector3(0, -1, 0), 50);
        var pickingInfo = Vars.vars.scene.pickWithRay(ray, function (mesh) {
            return (mesh.id === Vars.vars.groundMesh.id);
        });
        return pickingInfo;
    }
});
