import * as Extras from "./Extras";
import * as Vars from "./Vars";
import * as VRLoad from "./VR/Load";
import * as Optimizations from "./VR/Optimizations";
import * as Pickables from "./VR/Pickables";

declare var BABYLON;

/**
 * Load the scene, setup the VR, etc.
 * @returns void
 */
export function load(): void {
    Vars.setup();

    // Remove the initial loading screen.
    document.getElementById("loading-container").outerHTML = "";

    // Because of this error, you need to setup VR before loading the babylon
    // scene:
    // https://forum.babylonjs.com/t/createdefaultvrexperience-android-chrome-vr-mode-change-material-unusual-error/2738/4

    // Essentially a placeholder camera...
    let camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), Vars.scene);

    // You'll need a navigation mesh.
    let navMeshToUse = BABYLON.Mesh.CreateSphere("navTargetMesh", 4, 0.1, Vars.scene);
    let navMeshMat = new BABYLON.StandardMaterial("myMaterial", Vars.scene);
    navMeshMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
    navMeshToUse.material = navMeshMat;

    // Setup the VR here.
    VRLoad.setup({
        groundMeshName: "ground",
        navTargetMesh: navMeshToUse,
    });

    babylonScene(() => {
        Vars.determineCameraHeightFromActiveCamera();

        // Load extra objects
        Extras.setup();

        // Register a render loop to repeatedly render the scene
        Vars.engine.runRenderLoop(() => {
            // try {
                Vars.scene.render();
            // }  catch {
                // console.log("ERROR!");
            // }
        });
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", () => {
        Vars.engine.resize();
    });
}

/**
 * Load the scene from the .babylon file.
 * @param  {function()} callBackFunc The callback function to run when loaded.
 * @returns void
 */
function babylonScene(callBackFunc): void {
    Vars.engine.displayLoadingUI();
    Vars.engine.loadingUIText = "Loading the main scene...";

    // TODO: Use LoadAssetContainerAsync instead?
    BABYLON.SceneLoader.LoadAssetContainer("scene/", "scene.babylon", Vars.scene, (container) => {
        Vars.scene.executeWhenReady(() => {
            container.addAllToScene();

            // There should be only one camera at this point, because the VR
            // stuff is in the callback. Make that that one camera is the
            // active one.
            Vars.scene.activeCamera =  Vars.scene.cameras[0];

            // Attach camera to canvas inputs
            // Vars.scene.activeCamera.attachControl(Vars.canvas);

            // Make sure camera can see objects that are very close.
            Vars.scene.activeCamera.minZ = 0;

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

            // Remove some meshes used only for scene construction. In the
            // perfect world, these wouldn't even be included in the babylon
            // file.
            for (let meshIdx in Vars.scene.meshes) {
                if (Vars.scene.meshes[meshIdx].name === "protein_box") {
                    Vars.scene.meshes[meshIdx].dispose();
                }
            }

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

            callBackFunc();
        });
    }, (progress) => {
        if (progress["lengthComputable"]) {
            // Only to 90 to not give the impression that it's done loading.
            let percent = Math.round(90 * progress["loaded"] / progress["total"]);
            Vars.engine.loadingUIText = "Loading the main scene... " + percent.toString() + "%";
        }
    });
}
