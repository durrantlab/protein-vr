// This module sets up the VR camera.
define(["require", "exports", "./Navigation", "./Pickables", "./Vars"], function (require, exports, Navigation, Pickables, Vars) {
    "use strict";
    exports.__esModule = true;
    console.log("Multiple triggers per click?");
    // this module.
    var trigRefractPrdInMS = 500;
    var lastTriggerTime = 0;
    var emptyVRGazeTarget; // A (nearly) empty mesh, to keep track of position of gaze.
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
            // Setup teleportation. If uncommented, this is the one that comes
            // with BABYLON.js.
            // setupCannedVRTeleportation();
            setupGazeTracker();
            // Reset selected mesh.
            Pickables.setCurPickedMesh(undefined);
            window.vrHelper = exports.vrHelper;
        });
        exports.vrHelper.onExitingVRObservable.add(function () {
            // Update navMode
            Vars.vars.navMode = Navigation.NavMode.NoVR;
            // Reset selected mesh.
            Pickables.setCurPickedMesh(undefined);
        });
        // vrHelper.onNewMeshPicked.add((pickingInfo) => {
        //     // Callback receiving ray cast picking info
        //     Pickables.setCurPickedMesh(pickingInfo.pickedMesh);
        // });
        // vrHelper.onSelectedMeshUnselected.add((mesh) => {
        // Mesh has been unselected
        // Pickables.setCurPickedMesh(undefined);
        // Navigation.setCurStarePt(Navigation.pointWayOffScreen);
        // console.log(mesh, Pickables.curPickedMesh, Navigation.curStarePt);
        // console.log("GGGG");
        // });
    }
    /**
     * Sets up the enter and exit functions when controllers load. No unload
     * function, though I'd like one.
     * @returns void
     */
    function setupEnterAndExitControllersCallbacks() {
        // onControllersAttachedObservable doesn't work. I'd prefer that one...
        exports.vrHelper.webVRCamera.onControllerMeshLoadedObservable.add(function (webVRController) {
            // vrHelper.webVRCamera.onControllerMeshLoaded.add((webVRController) => {
            // Update navMode
            Vars.vars.navMode = Navigation.NavMode.VRWithControllers;
            console.log("controller loaded");
            setupGazeTracker();
            // vrHelper.onNewMeshSelected.add((mesh) => {
            // Mesh has been selected
            // console.log(mesh.name);
            // });
            // Update the mesh being tracked. Keep trying until you can get the
            // mesh.
            // const setNewNavTrgtMeshBeingTracked = () => {
            //     console.log(Vars.vars.scene.getMeshByID("gazeTracker.navTargetMesh"));
            //     // NavTargetMesh.setNavTrgtMeshBeingTracked(Vars.vars.scene.getMeshByID("gazeTracker.navTargetMesh"));
            //     // if ((NavTargetMesh.navTrgtMeshBeingTracked === undefined) ||
            //     //     (NavTargetMesh.navTrgtMeshBeingTracked === null)) {
            //     //     // Try to get it again in a second.
            //     //     setTimeout(setNewNavTrgtMeshBeingTracked, 1000);
            //     // }
            // };
            // setNewNavTrgtMeshBeingTracked();
            console.log("Isnt there on pickable or something");
            // Monitor for triggers. Only allow one to fire every once in a while.
            // When it does, teleport to that location.
            webVRController.onTriggerStateChangedObservable.add(function (state) {
                console.log("trigger");
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
        // const customMesh = BABYLON.Mesh.CreateSphere("sphere1", 5, 0.1, Vars.vars.scene);
        return customMesh;
    }
    function setupGazeTracker() {
        exports.vrHelper.raySelectionPredicate = function (mesh) {
            return Pickables.checkIfMeshPickable(mesh);
        };
        // Make an invisible mesh that will be positioned at location of gaze.
        // if (emptyVRGazeTarget === undefined) { emptyVRGazeTarget = makeEmptyMesh(); }
        // emptyVRGazeTarget = BABYLON.Mesh.CreateSphere("sphere1", 4, 0.1, Vars.vars.scene);
        // emptyVRGazeTarget = makeEmptyMesh();
        // Navigation.setVRCameraGazeTrackerMesh(emptyVRGazeTarget);
        // The navTargetMesh follows the gaze now.
        // vrHelper.gazeTrackerMesh = Navigation.vrCameraGazeTrackerMesh;
        // vrHelper.gazeTrackerMesh = BABYLON.Mesh.CreateSphere("sphere1", 4, 0.1, Vars.vars.scene);
        exports.vrHelper.gazeTrackerMesh = makeEmptyMesh();
        exports.vrHelper.updateGazeTrackerScale = false; // Babylon 3.3 preview.
        exports.vrHelper.displayGaze = true; // Does need to be true. Otherwise, position not updated.
        exports.vrHelper.enableInteractions();
    }
});
