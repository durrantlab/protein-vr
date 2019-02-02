// This module sets up the VR camera.

import * as Navigation from "./Navigation";
// import * as NavTargetMesh from "./NavTargetMesh";
import * as Vars from "./Vars";

declare var BABYLON;

export let vrHelper;                         // So it can be accessed everywhere in
                                      // this module.
const trigRefractPrdInMS = 500;
let lastTriggerTime = 0;

export function setup() {
    // Create the vr helper. See http://doc.babylonjs.com/how_to/webvr_helper
    vrHelper = Vars.vars.scene.createDefaultVRExperience({
        createDeviceOrientationCamera: true,  // Because using already created
                                              // one.
    });

    // Setup different trigger VR functions (changes state, etc.)
    setupEnterAndExitVRCallbacks();
    setupEnterAndExitControllersCallbacks();
}

/**
 * Sets up the enter and exit VR functions. When enters, sets up VR. When
 * exists, downgrades to non-VR navigation.
 * @returns void
 */
function setupEnterAndExitVRCallbacks(): void {
    vrHelper.onEnteringVRObservable.add((a, b) => {
        // Not sure what a and b are. Both are objects.

        // Update navMode
        Vars.vars.navMode = Navigation.NavMode.VRNoControllers;

        // Update the mesh being tracked.
        // NavTargetMesh.setNavTrgtMeshBeingTracked(Vars.vars.navTargetMesh);

        // Setup teleportation. If uncommented, this is the one that comes
        // with BABYLON.js.
        // setupCannedVRTeleportation();

        // Enable interactions with the ground.
        vrHelper.enableInteractions();

        vrHelper.raySelectionPredicate = (mesh) => {
            return mesh.name.indexOf(Vars.vars.floorMeshName) !== -1;  // TODO: Predicate that gets them all...
        };

        // Make an invisible mesh that will be positioned at location of gaze.
        Navigation.setVRCameraGazeTrackerMesh(makeEmptyMesh());

        // The navTargetMesh follows the gaze now.
        // vrHelper.gazeTrackerMesh = NavTargetMesh.navTrgtMeshBeingTracked;
        vrHelper.gazeTrackerMesh = Navigation.vrCameraGazeTrackerMesh;
        vrHelper.updateGazeTrackerScale = false;  // Babylon 3.3 preview.
        vrHelper.displayGaze = true;
    });

    vrHelper.onExitingVRObservable.add(() => {
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
function setupEnterAndExitControllersCallbacks(): void {
    // onControllersAttachedObservable doesn't work. I'd prefer that one...
    vrHelper.webVRCamera.onControllerMeshLoadedObservable.add((webVRController) => {
        // Update navMode
        Vars.vars.navMode = Navigation.NavMode.VRWithControllers;

        // Update the mesh being tracked. Keep trying until you can get the
        // mesh.
        const setNewNavTrgtMeshBeingTracked = () => {
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
        webVRController.onTriggerStateChangedObservable.add((state) => {
            const curTime = new Date().getTime();
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
function makeEmptyMesh(): any {
    const customMesh = new BABYLON.Mesh("vrNavTargetMesh", Vars.vars.scene);

    const positions = [0, 0, 0];
    const indices = [0];

    const vertexData = new BABYLON.VertexData();

    vertexData.positions = positions;
    vertexData.indices = indices;

    vertexData.applyToMesh(customMesh);

    customMesh.isVisible = false;

    return customMesh;
}
