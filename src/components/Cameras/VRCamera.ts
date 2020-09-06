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
import * as Menu3D from "../UI/Menus/Menu3D/Menu3D";
import * as PromiseStore from "../PromiseStore";
import * as Points from "../Navigation/Points";
import * as NonVRCamera from "./NonVRCamera";

declare var BABYLON: any;

let lastTimeJSRunningChecked: number;

// Note that the xrHelper is initialized in Vars.ts.

/**
 * Sets up the VR camera (listens for enter/exit, controllers added, etc.).
 * @returns void
 */
export function runSetupVRListeners(): void {
    // debugger;
    // setTimeout(() => {
    //     PromiseStore.debug();
    // }, 5000);

    PromiseStore.setPromise(
        "SetupVRListeners", ["InitVR"],
        (resolve) => {
            if (UrlVars.checkIfWebRTCInUrl()) {
                // Never do VR in webrtc mode.
                resolve();
                return;
            }

            if (Vars.vrHelper.baseExperience === undefined) {
                // Apparently there is no WebXR.
                resolve();
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

            resolve();
        }
    )
}

/**
 * Exits VR and/or full-screen mode, if necessary.
 * @returns void
 */
export function exitVRAndFS(): void {
    if (Vars.vrHelper === undefined) {
        return;
    }

    if (Vars.vrHelper.baseExperience.state === BABYLON.WebXRState.IN_XR) {
        // Be sure you only exit if you're in XR. Otherwise it will cause
        // problems (Oculus Go).
        Vars.vrHelper.baseExperience.exitXRAsync();
    }

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
    Vars.vrHelper.baseExperience.onStateChangedObservable.add((state) => {
        switch (state) {
            case BABYLON.WebXRState.ENTERING_XR:
                // Prevent url update while waiting for user to authorize xr.
                // console.log("ENTERING_XR");
                UrlVars.enableAutoUpdateUrl(false);
                break;
            case BABYLON.WebXRState.IN_XR:
                // XR is initialized and already submitted one frame
                // console.log("IN_XR");
                UrlVars.enableAutoUpdateUrl(true);

                // Below doesn't work, but just setting the position does.
                // Vars.vrHelper.baseExperience.camera.setTransformationFromNonVRCamera(
                //     NonVRCamera.nonVRCamera, true
                // );
                Vars.vrHelper.baseExperience.camera.position = NonVRCamera.nonVRCamera.position.clone();

                // Resize the engine to get it working in VR headset.
                Vars.engine.resize();

                // Update navMode
                Vars.vrVars.navMode = Navigation.NavMode.VRNoControllers;

                // Update the object used to position the nav mesh. Now VR
                // camera.
                Points.useGazeForNavMeshPos();

                // Setup teleportation. If uncommented, this is the one that comes
                // with BABYLON.js.
                // setupCannedVRTeleportation();

                // Reset selected mesh.
                Pickables.setCurPickedMesh(undefined);

                // You need to recalculate the shadows. I've found you get back
                // shadows in VR otherwise.
                Optimizations.updateEnvironmentShadows();

                // Hide the 2D buttons.
                jQuery(".ui-button").hide();
                // jQuery(".babylonVRicon").hide();  // Keep this one visible to exit.

                // Update menu, too, so there's an exit VR button.
                Menu3D.menuInf["Exit VR ×"] = () => { exitVRAndFS(); }

                // Active camera needs to be XR camera..
                // console.log(Vars.scene.activeCamera);
                break;
            case BABYLON.WebXRState.EXITING_XR:
                // xr exit request was made. not yet done.
                // console.log("EXITING_XR");
                UrlVars.enableAutoUpdateUrl(true);
                break;
            case BABYLON.WebXRState.NOT_IN_XR:
                // console.log("NOT_IN_XR");
                UrlVars.enableAutoUpdateUrl(true);

                // Resize the engine to get it working in VR headset.
                Vars.engine.resize();

                // Update navMode
                Vars.vrVars.navMode = Navigation.NavMode.NoVR;

                // Reset selected mesh.
                Pickables.setCurPickedMesh(undefined);

                // Let's recalculate the shadows here again too, just to be on the
                // safe side.
                Optimizations.updateEnvironmentShadows();

                // Update the object used to position the nav mesh. Now back
                // to non-VR camera.
                Points.useGazeForNavMeshPos();

                // Show the 2D buttons.
                jQuery(".ui-button").show();
                jQuery(".babylonVRicon").show();

                // Update menu, too, so there's an exit VR button.
                delete Menu3D.menuInf["Exit VR ×"];
                break;
        }
    });
}
