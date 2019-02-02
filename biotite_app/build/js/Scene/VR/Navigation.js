// This module handles all things navigation related.
define(["require", "exports", "./Navigation", "./Vars", "./VRCamera"], function (require, exports, Navigation, Vars, VRCamera) {
    "use strict";
    exports.__esModule = true;
    var ClickAction;
    (function (ClickAction) {
        ClickAction[ClickAction["None"] = 0] = "None";
        ClickAction[ClickAction["Teleport"] = 1] = "Teleport";
        ClickAction[ClickAction["GrowHeight"] = 2] = "GrowHeight";
    })(ClickAction || (ClickAction = {}));
    var clickAction = ClickAction.Teleport;
    var NavMode;
    (function (NavMode) {
        NavMode[NavMode["VRWithControllers"] = 0] = "VRWithControllers";
        NavMode[NavMode["VRNoControllers"] = 1] = "VRNoControllers";
        NavMode[NavMode["NoVR"] = 2] = "NoVR";
    })(NavMode = exports.NavMode || (exports.NavMode = {}));
    // ***** TODO: WORK ON THIS:
    // export let interactingObjs = [];
    // export function addInteractingObj(mesh) { interactingObjs.push(mesh); }
    var currentlyTeleporting = false;
    var pointWayOffScreen = new BABYLON.Vector3(-1000, 1000, 1000);
    function setVRCameraGazeTrackerMesh(val) { exports.vrCameraGazeTrackerMesh = val; }
    exports.setVRCameraGazeTrackerMesh = setVRCameraGazeTrackerMesh;
    function setup() {
        // Allways collide with a floor mesh, which must be hidden.
        Vars.vars.floorMesh = Vars.vars.scene.getMeshByID(Vars.vars.floorMeshName);
        if (Vars.vars.floorMesh === null) {
            alert("No mesh named " + Vars.vars.floorMeshName);
        }
        Vars.vars.floorMesh.checkCollisions = true;
        Vars.vars.floorMesh.visibility = 0;
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
            Vars.vars.navTargetMesh.position = exports.curStarePointInfo.point; // .clone();
        });
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
        // about what you're looking/pointing at. Info saved to curStarePointInfo
        switch (Vars.vars.navMode) {
            case NavMode.NoVR:
                // No VR yet. So it's outside the realm of the VRHelper. Calculate
                // it using the looking direction.
                // Get a ray extending out in the direction of the stare.
                var ray = Vars.vars.scene.activeCamera.getForwardRay();
                // Determines where that ray intersects the floor.
                var pickingInfo = Vars.vars.scene.pickWithRay(ray, function (mesh) {
                    return (mesh.id === Vars.vars.floorMeshName); // TODO: Also buttons and proteins.
                });
                // Get the results.
                if (pickingInfo.hit) {
                    // It does hit the floor. Return the point.
                    exports.curStarePointInfo = {
                        point: pickingInfo.pickedPoint,
                        targetMesh: pickingInfo.pickedMesh
                    };
                }
                else {
                    // It doesn't hit the floor, so return null.
                    exports.curStarePointInfo = { point: pointWayOffScreen, targetMesh: null };
                }
                break;
            case NavMode.VRNoControllers:
                // No controllers yet. So tracking the params.navTargetMesh.
                // newLoc = NavTargetMesh.navTrgtMeshBeingTracked.position.clone();
                // dist = BABYLON.Vector3.Distance(Vars.vars.scene.activeCamera.position, newLoc);
                // decideWhichClickAction(dist, newLoc);
                // return newLoc;
                exports.curStarePointInfo = { point: exports.vrCameraGazeTrackerMesh.position, targetMesh: null };
                console.log(exports.curStarePointInfo);
                break;
            case NavMode.VRWithControllers:
                // There are controllers.
                // newLoc = NavTargetMesh.navTrgtMeshBeingTracked.position.clone();
                // newLoc = vrCameraGazeTrackerMesh.position; ** **
                // dist; = BABYLON.Vector3.Distance(Vars.vars.scene.activeCamera.position, newLoc);
                // decideWhichClickAction(dist, newLoc);
                // return newLoc;
                exports.curStarePointInfo = { point: exports.vrCameraGazeTrackerMesh.position, targetMesh: null };
                break;
            default:
                console.log("Error occurred!");
                return;
                break;
        }
    }
    exports.setStarePointInfo = setStarePointInfo;
    function cancelStareIfFarAway() {
        var dist = BABYLON.Vector3.Distance(Vars.vars.scene.activeCamera.position, exports.curStarePointInfo.point);
        if (dist > 5) {
            exports.curStarePointInfo = { point: pointWayOffScreen, targetMesh: null };
        }
    }
    function actOnStareTrigger() {
        // Click, space, or something. You need to decide how to act.
        if (exports.curStarePointInfo.targetMesh.name === "ground") {
            // It's the ground, so teleport there.
            teleport();
        }
    }
    exports.actOnStareTrigger = actOnStareTrigger;
    /**
     * Teleport to a given location.
     * @param  {IStarePointInf} starePt The location to transport to (BABYLON.Vector3).
     * @returns void
     */
    function teleport() {
        if (clickAction === ClickAction.None) {
            // TODO: Maybe buzz the controller or something?
            return;
        }
        currentlyTeleporting = true;
        // Hide the bigger nav mesh. It will appear again elsewhere.
        // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = false;
        VRCamera.vrHelper.gazeTrackerMesh.isVisible = false;
        // Animate the transition to the new location.
        var animationCameraTeleportation = new BABYLON.Animation("animationCameraTeleportation", "position", 90, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
        var newLoc = new BABYLON.Vector3(exports.curStarePointInfo.point.x, exports.curStarePointInfo.point.y + Vars.vars.cameraHeight, exports.curStarePointInfo.point.z);
        console.log("New Loc:", newLoc);
        var activeCamera = Vars.vars.scene.activeCamera;
        var animationCameraTeleportationKeys = [
            {
                frame: 0,
                value: activeCamera.position
            },
            {
                frame: 5,
                value: newLoc
            },
        ];
        animationCameraTeleportation.setKeys(animationCameraTeleportationKeys);
        activeCamera.animations = [];
        activeCamera.animations.push(animationCameraTeleportation);
        Vars.vars.scene.beginAnimation(activeCamera, 0, 11, false, 1, function () {
            // Animation finished callback.
            currentlyTeleporting = false;
            VRCamera.vrHelper.gazeTrackerMesh.isVisible = true;
            // Erase animation
            activeCamera.animations = [];
        });
    }
    function decideWhichClickAction(dist, newLoc) {
        if ((currentlyTeleporting) || (dist > 5)) {
            // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = false;
            clickAction = ClickAction.None;
        }
        else {
            // NavTargetMesh.navTrgtMeshBeingTrackedBigger.isVisible = true;
            // NavTargetMesh.navTrgtMeshBeingTrackedBigger.position = newLoc;
            clickAction = ClickAction.Teleport;
        }
    }
});
