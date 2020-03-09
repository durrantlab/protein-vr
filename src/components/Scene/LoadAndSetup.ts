// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


import * as CamerasSetup from "../Cameras/Setup";
import * as VRCamera from "../Cameras/VRCamera";
import * as MolsLoad from "../Mols/Load";
import * as Navigation from "../Navigation/Navigation";
import * as LoadingScreens from "../UI/LoadingScreens";
import * as Vars from "../Vars/Vars";
import * as Optimizations from "./Optimizations";
import * as PromiseStore from "../PromiseStore";
import * as Pickables from "../Navigation/Pickables";
import * as Menus from "../UI/Menus";
import * as UrlVars from "../Vars/UrlVars";

// import * as Fullscreen from "../Navigation/Fullscreen";

declare var BABYLON: any;

/**
 * Load the scene, setup the VR, etc.
 * @returns void
 */
export function load(): void {
    PromiseStore.setPromise(
        "SceneLoaded", ["DeviceOrientationAuthorizedIfNeeded"],
        (resolve) => {
            Vars.setup();

            // Remove the initial loading javascript screen (not the babylonjs loading
            // screen... That's to come).
            LoadingScreens.removeLoadingJavascriptScreen();

            // Because of this error, you need to setup VR before loading the babylon
            // scene:
            // https://forum.babylonjs.com/t/createdefaultvrexperience-android-chrome-vr-mode-change-material-unusual-error/2738/4
            vrSetupBeforeLoadingBabylonFile();

            runLoadBabylonScene();

            Optimizations.runOptimizeScene();

            // Setup the cameras.
            CamerasSetup.runSetupCamera();

            // Setup the general things that apply regardless of the mode used. Here
            // because it requires a ground mesh. Set up the floor mesh (hidden).
            Navigation.runSetupNavigation();

            // Setup function to manage pickable objects (e.g., floor).
            Pickables.runSetupPickables();

            Menus.runSetupMenus();

            // Load molecules
            MolsLoad.runLoadMolecule();

            runFinalizeScene();


            // PromiseStore.waitFor(["LoadBabylonScene"]).then(() => {
                // There should be only one camera at this point, because the VR
                // stuff is in the callback. Make that that one camera is the
                // active one.
                // Vars.scene.activeCamera =  Vars.scene.cameras[0];

                // Attach camera to canvas inputs
                // Vars.scene.activeCamera.attachControl(Vars.canvas);

                // Setup full-screen functions.
                // Fullscreen.setup();
            // });

            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => {
                Vars.engine.resize();
            });

            resolve();
        }
    );
}

/**
 * A few VR-relevant things need to be handled before you load the babylon
 * scene. These are separated into this function so they can be called
 * separately.
 * @returns void
 */
function vrSetupBeforeLoadingBabylonFile(): void {
    // You'll need a navigation mesh.
    const navMeshToUse = BABYLON.Mesh.CreateSphere("navTargetMesh", 4, 0.1, Vars.scene);
    const navMeshMat = new BABYLON.StandardMaterial("navTargetMeshMaterial", Vars.scene);
    navMeshMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
    navMeshMat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    navMeshToUse.material = navMeshMat;
    navMeshToUse.renderingGroupId = 2;  // So always visible, in theory.

    animateCursor(navMeshMat);

    // Setup the VR here. Set up the parameters (filling in missing values,
    // for example). Also saves the modified params to the params module
    // variable. Note that this calls createDefaultVRExperience. Note that
    // this returns early if running in WebRTC (follower) mode.
    Vars.runInitVR({navTargetMesh: navMeshToUse});

    // Setup the VR camera
    VRCamera.runSetupVRListeners();

    // For debugging...
    // trackDebugSphere();
    // window.Vars = Vars;
}

function animateCursor(navMeshMat: any): void {
    let black = new BABYLON.Color3(0.2, 0.2, 0.2);
    let white = new BABYLON.Color3(0.8, 0.8, 0.8);
    setInterval(() => {
        if (navMeshMat.diffuseColor.r === 0.2) {
            navMeshMat.diffuseColor = white;
        } else {
            navMeshMat.diffuseColor = black;
        }
    }, 1000);

    // Also add anj animation to that mesh (both color and size) so visible
    // regardless of background.
    // let numSteps = 5;
    // let updateAnimFrameFreq = 5;
    // var navMeshAnim1 = new BABYLON.Animation("navMeshAnim1", "scaling.x", updateAnimFrameFreq, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    // var navMeshAnim2 = new BABYLON.Animation("navMeshAnim2", "scaling.y", updateAnimFrameFreq, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    // var navMeshAnim3 = new BABYLON.Animation("navMeshAnim3", "scaling.z", updateAnimFrameFreq, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    // var navMeshAnim4 = new BABYLON.Animation("navMeshAnim4", "material.emissiveColor", updateAnimFrameFreq, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);
    // var navMeshAnim5 = new BABYLON.Animation("navMeshAnim5", "material.diffuseColor", updateAnimFrameFreq, BABYLON.Animation.ANIMATIONTYPE_COLOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

    // var keys = [];
    // keys.push({frame: 0, value: 0.5});
    // keys.push({frame: 0.5 * numSteps, value: 1.5});
    // keys.push({frame: numSteps, value: 0.5});
    // navMeshAnim1.setKeys(keys);
    // navMeshAnim2.setKeys(keys);
    // navMeshAnim3.setKeys(keys);

    // var keys2 = [];
    // keys2.push({frame: 0, value: new BABYLON.Color3(0, 0, 0)});
    // keys2.push({frame: 0.5 * numSteps, value: new BABYLON.Color3(0.8, 0.8, 0.8)});
    // keys2.push({frame: numSteps, value: new BABYLON.Color3(0, 0, 0)});
    // navMeshAnim4.setKeys(keys2);
    // navMeshAnim5.setKeys(keys2);

    // navMeshToUse.animations = [];
    // navMeshToUse.animations.push(navMeshAnim1);
    // navMeshToUse.animations.push(navMeshAnim2);
    // navMeshToUse.animations.push(navMeshAnim3);
    // navMeshToUse.animations.push(navMeshAnim4);
    // navMeshToUse.animations.push(navMeshAnim5);
    // Vars.scene.beginAnimation(navMeshToUse, 0, numSteps, true);
}


/**
 * Load the scene from the .babylon file.
 * @returns void
 */
function runLoadBabylonScene(): void {
    PromiseStore.setPromise(
        "LoadBabylonScene", ["InitVR"],
        (resolve) => {
            LoadingScreens.babylonJSLoadingMsg("Loading the main scene...");
            // Start loading the main scene.
            BABYLON.SceneLoader.LoadAssetContainer(Vars.sceneName, "scene.babylon", Vars.scene, (container: any) => {
                LoadingScreens.startFakeLoading(90);
                Vars.scene.executeWhenReady(() => {
                    // Now load scene_info.json too.
                    jQuery.getJSON(Vars.sceneName + "scene_info.json", (data: any) => {
                        // Save variables from scene_info.json so they can be accessed
                        // elsewhere (throughout the app).

                        // Deactivate menu if appropriate. Note that this feature is
                        // not supported (gives an error). Perhaps in the future I
                        // will reimplement it, so I'm leaving the vestigial code
                        // here.
                        if (data["menuActive"] === false) {
                            Vars.vrVars.menuActive = false;
                        }

                        if (data["positionOnFloor"] !== undefined) {
                            Vars.sceneInfo.positionOnFloor = data["positionOnFloor"];
                        }

                        if (data["infiniteDistanceSkyBox"] !== undefined) {
                            Vars.sceneInfo.infiniteDistanceSkyBox = data["infiniteDistanceSkyBox"];
                        }

                        if (data["transparentGround"] !== undefined) {
                            Vars.sceneInfo.transparentGround = data["transparentGround"];
                        }

                        container.addAllToScene();

                        resolve();
                    })
                })
            }, (progress: any) => {
                if (progress["lengthComputable"]) {
                    // Only to 90 to not give the impression that it's done loading.
                    const percent = Math.round(90 * progress["loaded"] / progress["total"]);
                    LoadingScreens.babylonJSLoadingMsg("Loading the main scene... " + percent.toString() + "%");
                }
            })
        }
    );
}

/**
 * This runs when all the assets are fully loaded. Does things like start the
 * render loop.
 * @returns void
 */
export function runFinalizeScene(): void {
    PromiseStore.setPromise(
        "FinalizeScene", ["LoadBabylonScene", "LoadMolecule"],
        (resolve) => {
            // Give it a bit to let one render cycle go through. Hackish,
            // admittedly.
            setTimeout(Optimizations.updateEnvironmentShadows, 1000);

            // Stop showing the fake loading screen.
            LoadingScreens.stopFakeLoading();

            // Make sure the camera can see far enough.
            Vars.scene.activeCamera.maxZ = 250;

            // Make sure camera can see objects that are very close.
            Vars.scene.activeCamera.minZ = 0;

            // Start the render loop. Register a render loop to repeatedly
            // render the scene
            Vars.engine.runRenderLoop(() => {
                Vars.scene.render();
            });

            resolve();
        }
    )
}
