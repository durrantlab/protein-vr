// This module sets up the VR camera.

import * as Vars from "../Vars";
import * as Navigation from "./Navigation";
import * as Optimizations from "./Optimizations";
import * as Pickables from "./Pickables";
import * as VRControllers from "./VRControllers";

declare let BABYLON;

/**
 * Sets up the VR camera.
 * @returns void
 */
export function setup(): void {
    // Setup different trigger VR functions (changes state, etc.)
    setupEnterAndExitVRCallbacks();
    VRControllers.setup();
}

/**
 * Sets up the enter and exit VR functions. When enters, sets up VR. When
 * exists, downgrades to non-VR navigation.
 * @returns void
 */
function setupEnterAndExitVRCallbacks(): void {
    Vars.vrHelper.onEnteringVRObservable.add((a, b) => {
        // debugger;

        // Not sure what a and b are. Both are objects.

        // Update navMode
        Vars.vrVars.navMode = Navigation.NavMode.VRNoControllers;

        // Setup teleportation. If uncommented, this is the one that comes
        // with BABYLON.js.
        // setupCannedVRTeleportation();

        setupGazeTracker();

        // Reset selected mesh.
        Pickables.setCurPickedMesh(undefined);

        // You need to recalculate the shadows. I've found you get back
        // shadows in VR otherwise.
        Optimizations.updateEnvironmentShadows();

        window["vrHelper"] = Vars.vrHelper;
    });

    Vars.vrHelper.onExitingVRObservable.add(() => {
        // Update navMode
        Vars.vrVars.navMode = Navigation.NavMode.NoVR;

        // Reset selected mesh.
        Pickables.setCurPickedMesh(undefined);

        // Let's recalculate the shadows here again too, just to be on the
        // safe side.
        Optimizations.updateEnvironmentShadows();
    });


    // Vars.vrHelper.onNewMeshPicked.add((pickingInfo) => {
    //     // Callback receiving ray cast picking info
    //     Pickables.setCurPickedMesh(pickingInfo.pickedMesh);
    // });

    // Vars.vrHelper.onSelectedMeshUnselected.add((mesh) => {
        // Mesh has been unselected
        // Pickables.setCurPickedMesh(undefined);
        // Navigation.setCurStarePt(Navigation.pointWayOffScreen);
        // console.log(mesh, Pickables.curPickedMesh, Navigation.curStarePt);
        // console.log("GGGG");
    // });
}

/**
 * A placeholder mesh. Not technically empty, but pretty close.
 * @returns {*} The custom mesh (almost an empty).
 */
function makeEmptyMesh(): any {
    const customMesh = new BABYLON.Mesh("vrNavTargetMesh", Vars.scene);
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
export function setupGazeTracker(): void {
    Vars.vrHelper.raySelectionPredicate = (mesh) => {
        // if (!mesh.isVisible) {
        //     return false;
        // }
        return Pickables.checkIfMeshPickable(mesh);
    };

    // Make an invisible mesh that will be positioned at location of gaze.
    Vars.vrHelper.gazeTrackerMesh = makeEmptyMesh();
    Vars.vrHelper.updateGazeTrackerScale = false;  // Babylon 3.3 preview.
    Vars.vrHelper.displayGaze = true;  // Does need to be true. Otherwise, position not updated.

    Vars.vrHelper.enableInteractions();
}