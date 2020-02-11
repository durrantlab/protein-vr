// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


// This module sets up the VR camera.

import * as Navigation from "../Navigation/Navigation";
import * as Pickables from "../Navigation/Pickables";
import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars/Vars";
import * as VRControllers from "./VRControllers";
import * as UrlVars from "../Vars/UrlVars";
import * as Menu3D from "../UI/Menu3D/Menu3D";

declare var BABYLON: any;

let lastTimeJSRunningChecked: number;

/**
 * Sets up the VR camera.
 * @returns void
 */
export function setup(): void {
    if (UrlVars.checkWebrtcInUrl()) {
        // Never do VR in webrtc mode.
        return;
    }

    // Setup different trigger VR functions (changes state, etc.)
    setupEnterAndExitVRCallbacks();
    VRControllers.setup();

    // When you gain or loose focus, always exit VR mode. Doing this for
    // iphone pwa, which otherwise can't exit VR mode.
    // jQuery(window).focus(() => { exitVRAndFS(); });
    // jQuery(window).blur(() => { exitVRAndFS(); });
    // jQuery("body").focus(() => { exitVRAndFS(); });
    // jQuery("body").blur(() => { exitVRAndFS(); });
    // document.addEventListener("visibilitychange", () => { exitVRAndFS(); }, false);

    // Surprizingly, none of the above are triggering on ios pwa! Let's try an
    // additional approach...
    setInterval(() => {
        const now = new Date().getTime();
        if (lastTimeJSRunningChecked === undefined) {
            lastTimeJSRunningChecked = now;
        }
        const deltaTime = now - lastTimeJSRunningChecked;
        if (deltaTime > 2000) {
            // Javascript must have stopped recently.
            exitVRAndFS();
        }
        lastTimeJSRunningChecked = now;
    }, 1000);
}

/**
 * Exits VR and/or full-screen mode, if necessary.
 * @returns void
 */
export function exitVRAndFS(): void {
    if (Vars.vrHelper === undefined) {
        return;
    }

    // I wondered if the if statements below prevented ios pwa from working.
    // Could be wrong, but doesn't hurt to omit them. Leave them commented in
    // case you need them in the future.

    // if (Vars.vrHelper.isInVRMode) {
        Vars.vrHelper.exitVR();
    // }

    // if (Vars.vrHelper._fullscreenVRpresenting) {
    Vars.scene.getEngine().exitFullscreen();
    // }
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

        // Hide the 2D buttons.
        jQuery(".ui-button").hide();
        jQuery(".babylonVRicon").hide();

        // Start trying to initialive the controllers (in case they weren't
        // initalized already).
        VRControllers.startCheckingForControlers();

        // Update menu, too, so there's an exit VR button.
        Menu3D.menuInf["Exit VR ×"] = () => { exitVRAndFS(); }

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

        // Show the 2D buttons.
        jQuery(".ui-button").show();
        jQuery(".babylonVRicon").show();

        // Update menu, too, so there's an exit VR button.
        delete Menu3D.menuInf["Exit VR ×"];
        console.log(Menu3D.menuInf);
    });
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
    Vars.vrHelper.enableGazeEvenWhenNoPointerLock = true;
    // console.log(Vars.vrHelper);

    Vars.vrHelper.enableInteractions();

    // For debugging...
    // window.vrHelper = Vars.vrHelper;
}
