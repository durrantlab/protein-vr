// This module sets up the VR camera.

import * as Navigation from "../Navigation/Navigation";
import * as Pickables from "../Navigation/Pickables";
import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars";
import * as VRControllers from "./VRControllers";

declare var BABYLON: any;
declare var jQuery: any;

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
    Vars.vrHelper.onEnteringVRObservable.add((a: any, b: any) => {
        // When you enter VR. Not sure what a and b are. Both are objects.

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

        // window["vrHelper"] = Vars.vrHelper;
    });

    // Vars.vrHelper.onAfterEnteringVRObservable.add(() => {
    //     // Make sure camera starts off at same location as babylon camera
    //     debugger;
    // });

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
    /** @const {*} */
    const customMesh = new BABYLON.Mesh("vrNavTargetMesh", Vars.scene);

    /** @const {Array<number>} */
    const positions = [0, 0, 0];

    /** @const {Array<number>} */
    const indices = [0];

    /** @const {*} */
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

    /**
     * @param {*}
     * @returns boolean
     */
    Vars.vrHelper.raySelectionPredicate = (mesh: any): boolean => {
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

    // window.vrHelper = Vars.vrHelper;
}
