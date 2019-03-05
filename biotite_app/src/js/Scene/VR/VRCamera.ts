// This module sets up the VR camera.

import * as Navigation from "./Navigation";
import * as Pickables from "./Pickables";
import * as Vars from "./Vars";

declare let BABYLON;

export let vrHelper;  // So it can be accessed everywhere in
                      // this module.
const trigRefractPrdInMS = 500;
let lastTriggerTime = 0;

/**
 * Sets up the VR camera.
 * @returns void
 */
export function setup(): void {
    // Create the vr helper. See http://doc.babylonjs.com/how_to/webvr_helper
    debugger;
    vrHelper = Vars.vars.scene.createDefaultVRExperience({
        "createDeviceOrientationCamera": true,  // Because using already created
                                              // one.
    });

    // Setup different trigger VR functions (changes state, etc.)
    setupEnterAndExitVRCallbacks();
    // DEBUGG setupEnterAndExitControllersCallbacks();
}

/**
 * Sets up the enter and exit VR functions. When enters, sets up VR. When
 * exists, downgrades to non-VR navigation.
 * @returns void
 */
function setupEnterAndExitVRCallbacks(): void {
    vrHelper.onEnteringVRObservable.add((a, b) => {
        // debugger;

        // Not sure what a and b are. Both are objects.

        // Update navMode
        // DEBUGG Vars.vars.navMode = Navigation.NavMode.VRNoControllers;

        // Setup teleportation. If uncommented, this is the one that comes
        // with BABYLON.js.
        // setupCannedVRTeleportation();

        // DEBUGG setupGazeTracker();

        // Reset selected mesh.
        // DEBUGG Pickables.setCurPickedMesh(undefined);

        // DEBUGG window.vrHelper = vrHelper;
    });

    // DEBUGG
    /* vrHelper.onExitingVRObservable.add(() => {
        // Update navMode
        Vars.vars.navMode = Navigation.NavMode.NoVR;

        // Reset selected mesh.
        Pickables.setCurPickedMesh(undefined);
    }); */


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
function setupEnterAndExitControllersCallbacks(): void {
    // onControllersAttachedObservable doesn't work. I'd prefer that one...
    vrHelper.webVRCamera.onControllerMeshLoadedObservable.add((webVRController) => {
        // Update navMode
        Vars.vars.navMode = Navigation.NavMode.VRWithControllers;

        console.log("controller loaded");

        setupGazeTracker();

        console.log("Isnt there on pickable or something");

        // Monitor for triggers. Only allow one to fire every once in a while.
        // When it does, teleport to that location.
        webVRController.onTriggerStateChangedObservable.add((state) => {
            console.log("trigger");
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
 * @returns {*} The custom mesh (almost an empty).
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

/**
 * Sets up the VR gaze tracking mesh.
 * @returns void
 */
function setupGazeTracker(): void {
    vrHelper.raySelectionPredicate = (mesh) => {
        // if (!mesh.isVisible) {
        //     return false;
        // }
        return Pickables.checkIfMeshPickable(mesh);
    };

    // Make an invisible mesh that will be positioned at location of gaze.
    vrHelper.gazeTrackerMesh = makeEmptyMesh();
    vrHelper.updateGazeTrackerScale = false;  // Babylon 3.3 preview.
    vrHelper.displayGaze = true;  // Does need to be true. Otherwise, position not updated.

    vrHelper.enableInteractions();
}
