import * as CamerasSetup from "../Cameras/Setup";
import * as VRCamera from "../Cameras/VRCamera";
import * as MolsLoad from "../Mols/Load";
import * as Navigation from "../Navigation/Navigation";
import * as Pickables from "../Navigation/Pickables";
import * as LoadingScreens from "../UI/LoadingScreens";
import * as UI2D from "../UI/UI2D";
import * as Vars from "../Vars";
import * as Optimizations from "./Optimizations";

declare var BABYLON;

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

        // Setup the general things that apply regardless of the mode used.
        // Here because it requires a ground mesh. Set up the floor mesh
        // (hidden).
        Navigation.setup();

        // Setup function to manage pickable objects (e.g., floor).
        Pickables.setup();

        // Sets up nav selection buttons in DOM.
        UI2D.setup();

        // Load extra objects
        MolsLoad.setup();

        // loadingAssetsDone(), below, will run once all assets loaded.
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", () => {
        Vars.engine.resize();
    });
}

function vrSetupBeforeBabylonFileLoaded(): void {
    // You'll need a navigation mesh.
    let navMeshToUse = BABYLON.Mesh.CreateSphere("navTargetMesh", 4, 0.1, Vars.scene);
    let navMeshMat = new BABYLON.StandardMaterial("myMaterial", Vars.scene);
    navMeshMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
    navMeshToUse.material = navMeshMat;

    // Setup the VR here. Set up the parameters (filling in missing values,
    // for example). Also saves the modified params to the params module
    // variable.
    Vars.setupVR({
        groundMeshName: "ground",
        navTargetMesh: navMeshToUse,
    });

    // Setup the VR camera
    VRCamera.setup();

    // Optimize the scene to make it run better.
    Optimizations.setup();

    // For debugging...
    // trackDebugSphere();

    window.Vars = Vars;
}

/**
 * Load the scene from the .babylon file.
 * @param  {Function} callBackFunc The callback function to run when loaded.
 * @returns void
 */
function babylonScene(callBackFunc): void {
    LoadingScreens.babylonJSLoadingMsg("Loading the main scene...");

    // TODO: Use LoadAssetContainerAsync instead?
    BABYLON.SceneLoader.LoadAssetContainer("scene/", "scene.babylon", Vars.scene, (container) => {
        LoadingScreens.startFakeLoading(90);
        Vars.scene.executeWhenReady(() => {
            container.addAllToScene();

            // There should be only one camera at this point, because the VR
            // stuff is in the callback. Make that that one camera is the
            // active one.
            Vars.scene.activeCamera =  Vars.scene.cameras[0];

            // Attach camera to canvas inputs
            // Vars.scene.activeCamera.attachControl(Vars.canvas);

            keepOnlyLightWithShadowlightSubstr();

            hideObjectsUsedForSceneCreation();

            optimizeMeshesAndMakeClickable();

            callBackFunc();
        });
    }, (progress) => {
        if (progress["lengthComputable"]) {
            // Only to 90 to not give the impression that it's done loading.
            let percent = Math.round(90 * progress["loaded"] / progress["total"]);
            LoadingScreens.babylonJSLoadingMsg("ALoading the main scene... " + percent.toString() + "%");
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
        let light = Vars.scene.lights[indexToUse];
        let lightName = light.name.toLowerCase();
        let isShadowLight = (
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
 * Hides meshes that are only used ofr scene creation.
 * @returns void
 */
function hideObjectsUsedForSceneCreation(): void {
    // Hide objects used for scene creation.
    for (let meshIdx in Vars.scene.meshes) {
        if (Vars.scene.meshes[meshIdx].name === "protein_box") {
            // Vars.scene.meshes[meshIdx].dispose();
            Vars.scene.getMeshByName("protein_box").isVisible = false;
            // scene.getMeshByName("protein_box").visibility
        }
    }
}

/**
 * Optimizes meshes and makes them clickable.
 * @returns void
 */
function optimizeMeshesAndMakeClickable(): void {
    // Optimize and make meshes clickable. Also, make sure all meshes
    // are emmissive.
    for (let meshIdx in Vars.scene.meshes) {
        if (Vars.scene.meshes[meshIdx].material) {
            let mesh = Vars.scene.meshes[meshIdx];

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
        // try {
            Vars.scene.render();
        // }  catch {
            // console.log("ERROR!");
        // }
        // console.log("render");
    });
}
