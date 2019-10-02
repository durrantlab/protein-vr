// Copyright 2019 Jacob D. Durrant

import * as CamerasSetup from "../Cameras/Setup";
import * as VRCamera from "../Cameras/VRCamera";
import * as MolsLoad from "../Mols/Load";
import * as Navigation from "../Navigation/Navigation";
import * as Pickables from "../Navigation/Pickables";
import * as LoadingScreens from "../UI/LoadingScreens";
import * as UI2D from "../UI/UI2D";
import * as Vars from "../Vars/Vars";
import * as Lecturer from "../WebRTC/Lecturer";
import * as Optimizations from "./Optimizations";
import * as UrlVars from "../Vars/UrlVars";
// import * as Fullscreen from "../Navigation/Fullscreen";

declare var BABYLON: any;

/**
 * Load the scene, setup the VR, etc.
 * @returns void
 */
export function load(): void {
    Vars.setup();

    // Remove the initial loading javascript screen (not the babylonjs loading
    // screen... That's to come).
    LoadingScreens.removeLoadingJavascriptScreen();

    // Because of this error, you need to setup VR before loading the babylon
    // scene:
    // https://forum.babylonjs.com/t/createdefaultvrexperience-android-chrome-vr-mode-change-material-unusual-error/2738/4
    vrSetupBeforeBabylonFileLoaded();


    babylonScene(() => {
        // Setup the cameras.
        CamerasSetup.setup();

        // Setup full-screen functions.
        // Fullscreen.setup();

        if (!UrlVars.checkWebrtcInUrl()) {
            // The below are run if not in webrtc (leader) mode.

            // Setup the general things that apply regardless of the mode used.
            // Here because it requires a ground mesh. Set up the floor mesh
            // (hidden).
            Navigation.setup();

            // Setup function to manage pickable objects (e.g., floor).
            Pickables.setup();
        } else {
            // Initially, no VR.
            Vars.vrVars.navMode = Navigation.NavMode.NoVR;

            // Also, make sure ground is not visible.
            const groundMesh = Vars.scene.getMeshByID("ground");
            groundMesh.visibility = 0;

            // Also hide navigation sphere.
            Vars.vrVars.navTargetMesh.isVisible = false;
        }

        // Load extra objects
        MolsLoad.setup();

        // loadingAssetsDone(), below, will run once all assets loaded.

        // Sets up nav selection buttons in DOM.
        UI2D.setup();
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", () => {
        Vars.engine.resize();
    });
}

/**
 * A few VR-relevant things need to be handled before you load the babylon
 * scene. These are separated into this function so they can be called
 * separately.
 * @returns void
 */
function vrSetupBeforeBabylonFileLoaded(): void {
    // You'll need a navigation mesh.
    const navMeshToUse = BABYLON.Mesh.CreateSphere("navTargetMesh", 4, 0.1, Vars.scene);
    const navMeshMat = new BABYLON.StandardMaterial("myMaterial", Vars.scene);
    navMeshMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
    navMeshToUse.material = navMeshMat;
    navMeshToUse.renderingGroupId = 2;  // So always visible, in theory.

    // Setup the VR here. Set up the parameters (filling in missing values,
    // for example). Also saves the modified params to the params module
    // variable. Note that this calls createDefaultVRExperience.
    Vars.setupVR({
        navTargetMesh: navMeshToUse,
    });

    // Setup the VR camera
    VRCamera.setup();

    // Optimize the scene to make it run better.
    Optimizations.setup();

    // For debugging...
    // trackDebugSphere();
    // window.Vars = Vars;
}

/**
 * Load the scene from the .babylon file.
 * @param  {Function} callBackFunc The callback function to run when loaded.
 * @returns void
 */
function babylonScene(callBackFunc: any): void {
    LoadingScreens.babylonJSLoadingMsg("Loading the main scene...");

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

                // There should be only one camera at this point, because the VR
                // stuff is in the callback. Make that that one camera is the
                // active one.
                // Vars.scene.activeCamera =  Vars.scene.cameras[0];

                // Make sure the active camera is the one loaded from the babylon
                // file. Should be the only one without the string VR in it.
                Vars.scene.activeCamera = Vars.scene.cameras.filter((c: any) => c.name.indexOf("VR") === -1)[0];

                // Attach camera to canvas inputs
                // Vars.scene.activeCamera.attachControl(Vars.canvas);

                keepOnlyLightWithShadowlightSubstr();

                furtherProcessKeyMeshes();

                allMaterialsShadeless();

                optimizeMeshesAndMakeClickable();

                callBackFunc();
            });
        });
    }, (progress: any) => {
        if (progress["lengthComputable"]) {
            // Only to 90 to not give the impression that it's done loading.
            const percent = Math.round(90 * progress["loaded"] / progress["total"]);
            LoadingScreens.babylonJSLoadingMsg("Loading the main scene... " + percent.toString() + "%");
        }
    });
}

/**
 * Only the light with shadowlight should be retained.
 * @returns void
 */
function keepOnlyLightWithShadowlightSubstr(): void {
    // Delete all the lights but the first one that has the substring
    // shadowlight or shadow_light.
    let foundFirstShadowLight = false;
    let indexToUse = 0;
    while (Vars.scene.lights.length > 1) {
        const light = Vars.scene.lights[indexToUse];
        const lightName = light.name.toLowerCase();
        const isShadowLight = (
            (lightName.indexOf("shadowlight") !== -1) ||
            (lightName.indexOf("shadow_light") !== -1)
        );

        if (!isShadowLight) {
            // It's not a shadow light. Delete it.
            Vars.scene.lights[indexToUse].dispose();
        } else if (foundFirstShadowLight) {
            // You've already found a shadow light. Delete additional
            // ones.
            Vars.scene.lights[indexToUse].dispose();
        } else {
            // Must be the first shadow light. Don't delete, but make
            // note of it.
            foundFirstShadowLight = true;
            indexToUse++;
        }
    }
}

/**
 * Hides meshes that are only used for scene creation. Also deals with
 * skyboxes and other objects.
 * @returns void
 */
function furtherProcessKeyMeshes(): void {
    // Hide objects used for scene creation.
    /** @type {number} */
    const len = Vars.scene.meshes.length;
    for (let meshIdx = 0; meshIdx < len; meshIdx++) {
        const mesh = Vars.scene.meshes[meshIdx];
        if (mesh.name === "protein_box") {
            mesh.isVisible = false;
        } else if (mesh.name.toLowerCase().indexOf("skybox") !== -1) {
            if (Vars.sceneInfo.infiniteDistanceSkyBox) {
                mesh.material.disableLighting = true;
                mesh.infiniteDistance = true;
            }

            // Causes skybox to go black. I think you'd need to set to 0, and
            // all other meshes to 1.
            // mesh.renderingGroupId = -1;
        }
    }
}

/**
 * All objects with materials that have emissive textures should be shadeless.
 * @returns void
 */
function allMaterialsShadeless(): void {
    /** @type {number} */
    const len = Vars.scene.meshes.length;
    for (let meshIdx = 0; meshIdx < len; meshIdx++) {
        const mesh = Vars.scene.meshes[meshIdx];
        if (!mesh.material) { continue; }

        // It has a material
        if (mesh.material.emissiveTexture) {
            mesh.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
            mesh.material.albedoColor = new BABYLON.Color3(0, 0, 0);
            mesh.material.ambientColor = new BABYLON.Color3(0, 0, 0);
        }

        // It has submaterials.
        /** @type {number} */
        // if (mesh.material.subMaterials) {
        //     let len2 = mesh.material.subMaterials.length;
        //     for (let matIdx = 0; matIdx < len2; matIdx++) {
        //         let mat = mesh.material.subMaterials[matIdx];
        //         if (mat.emissiveTexture) {
        //             mat.emissiveColor = new BABYLON.Color3(1, 1, 1);
        //             mat.albedoColor = new BABYLON.Color3(0, 0, 0);
        //             mat.ambientColor = new BABYLON.Color3(0, 0, 0);
        //         }
        //     }
        // }
    }
}

/**
 * Optimizes meshes and makes them clickable.
 * @returns void
 */
function optimizeMeshesAndMakeClickable(): void {
    // Optimize and make meshes clickable. Also, make sure all meshes
    // are emmissive.
    /** @type {number} */
    const len = Vars.scene.meshes.length;
    for (let meshIdx = 0; meshIdx < len; meshIdx++) {
        if (Vars.scene.meshes[meshIdx].material) {
            const mesh = Vars.scene.meshes[meshIdx];

            // It needs to be emmisive (so always baked).
            if ((mesh.material.emissiveTexture === undefined) || (mesh.material.emissiveTexture === null)) {
                mesh.material.emissiveTexture = mesh.material.diffuseTexture;

                // Below seems important to comment out. .clone()
                // above and .dispose() below doesn't work. Also,
                // below = null and = undefined didn't work. No good
                // solutions, so leave diffuse texture in place?

                // mesh.material.diffuseTexture = undefined;

                mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
                mesh.material.emissiveColor = new BABYLON.Color3(0, 0, 0);
            }

            // TODO: Using false below to not freeze materials.
            // They are white otherwise. Good to figure out why.
            Optimizations.freezeMeshProps(mesh, false);
            Pickables.makeMeshMouseClickable({
                mesh,
                scene: Vars.scene,
            });
        }
    }
}

/**
 * This runs when all the assets are fully loaded. Does things like start the
 * render loop.
 * @returns void
 */
export function loadingAssetsDone(): void {
    // Give it a bit to let one render cycle go through. Hackish,
    // admittedly.
    setTimeout(Optimizations.updateEnvironmentShadows, 1000);

    // Stop showing the fake loading screen.
    LoadingScreens.stopFakeLoading();

    // Make sure the camera can see far enough.
    Vars.scene.activeCamera.maxZ = 250;

    // Make sure camera can see objects that are very close.
    Vars.scene.activeCamera.minZ = 0;

    // Start the render loop. Register a render loop to repeatedly render the
    // scene
    Vars.engine.runRenderLoop(() => {
        Vars.scene.render();
    });
}
