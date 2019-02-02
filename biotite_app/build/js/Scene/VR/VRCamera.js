// This module sets up the VR camera.
define(["require", "exports", "./Navigation", "./Vars"], function (require, exports, Navigation, Vars) {
    "use strict";
    exports.__esModule = true;
    // this module.
    var trigRefractPrdInMS = 500;
    var lastTriggerTime = 0;
    function setup() {
        // Create the vr helper. See http://doc.babylonjs.com/how_to/webvr_helper
        exports.vrHelper = Vars.vars.scene.createDefaultVRExperience({
            createDeviceOrientationCamera: true
        });
        // Setup different trigger VR functions (changes state, etc.)
        setupEnterAndExitVRCallbacks();
        setupEnterAndExitControllersCallbacks();
    }
    exports.setup = setup;
    /**
     * Sets up the enter and exit VR functions. When enters, sets up VR. When
     * exists, downgrades to non-VR navigation.
     * @returns void
     */
    function setupEnterAndExitVRCallbacks() {
        exports.vrHelper.onEnteringVRObservable.add(function (a, b) {
            // Not sure what a and b are. Both are objects.
            // Update navMode
            Vars.vars.navMode = Navigation.NavMode.VRNoControllers;
            // Update the mesh being tracked.
            // NavTargetMesh.setNavTrgtMeshBeingTracked(Vars.vars.navTargetMesh);
            // Setup teleportation. If uncommented, this is the one that comes
            // with BABYLON.js.
            // setupCannedVRTeleportation();
            // Enable interactions with the ground.
            exports.vrHelper.enableInteractions();
            exports.vrHelper.raySelectionPredicate = function (mesh) {
                return mesh.name.indexOf(Vars.vars.floorMeshName) !== -1; // TODO: Predicate that gets them all...
            };
            // Make an invisible mesh that will be positioned at location of gaze.
            Navigation.setVRCameraGazeTrackerMesh(makeEmptyMesh());
            // The navTargetMesh follows the gaze now.
            // vrHelper.gazeTrackerMesh = NavTargetMesh.navTrgtMeshBeingTracked;
            exports.vrHelper.gazeTrackerMesh = Navigation.vrCameraGazeTrackerMesh;
            exports.vrHelper.updateGazeTrackerScale = false; // Babylon 3.3 preview.
            exports.vrHelper.displayGaze = true;
        });
        exports.vrHelper.onExitingVRObservable.add(function () {
            // Update navMode
            Vars.vars.navMode = Navigation.NavMode.NoVR;
            // Update the mesh being tracked.
            // NavTargetMesh.setNavTrgtMeshBeingTracked(Vars.vars.navTargetMesh);
        });
    }
    /**
     * Sets up the enter and exit functions when controllers load. No unload
     * function, though I'd like one.
     * @returns void
     */
    function setupEnterAndExitControllersCallbacks() {
        // onControllersAttachedObservable doesn't work. I'd prefer that one...
        exports.vrHelper.webVRCamera.onControllerMeshLoadedObservable.add(function (webVRController) {
            // Update navMode
            Vars.vars.navMode = Navigation.NavMode.VRWithControllers;
            // Update the mesh being tracked. Keep trying until you can get the
            // mesh.
            var setNewNavTrgtMeshBeingTracked = function () {
                // NavTargetMesh.setNavTrgtMeshBeingTracked(Vars.vars.scene.getMeshByID("gazeTracker.navTargetMesh"));
                // if ((NavTargetMesh.navTrgtMeshBeingTracked === undefined) ||
                //     (NavTargetMesh.navTrgtMeshBeingTracked === null)) {
                //     // Try to get it again in a second.
                //     setTimeout(setNewNavTrgtMeshBeingTracked, 1000);
                // }
            };
            setNewNavTrgtMeshBeingTracked();
            // Monitor for triggers. Only allow one to fire every once in a while.
            // When it does, teleport to that location.
            webVRController.onTriggerStateChangedObservable.add(function (state) {
                var curTime = new Date().getTime();
                if (curTime - lastTriggerTime > trigRefractPrdInMS) {
                    // Enough time has passed...
                    lastTriggerTime = curTime;
                    Navigation.actOnStareTrigger();
                }
            });
        });
        // Doesn't appear to be a detach function...
    }
    /**
     * A placeholder mesh. Not technically empty, but pretty close.
     * @param  {*} scene The BABYLON scene.
     * @returns * The custom mesh (almost an empty).
     */
    function makeEmptyMesh() {
        var customMesh = new BABYLON.Mesh("vrNavTargetMesh", Vars.vars.scene);
        var positions = [0, 0, 0];
        var indices = [0];
        var vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.applyToMesh(customMesh);
        customMesh.isVisible = false;
        return customMesh;
    }
});
