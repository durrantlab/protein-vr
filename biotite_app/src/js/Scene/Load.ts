import * as Extras from "./Extras";
import * as Lights from "./Lights";
import * as Vars from "./Vars";
import * as VRLoad from "./VR/Load";

declare var BABYLON;

export function load() {
    Vars.setup();

    babylonScene(() => {
        let navMeshToUse = BABYLON.Mesh.CreateSphere("navTargetMesh", 4, 0.1, Vars.scene);
        let navMeshMat = new BABYLON.StandardMaterial("myMaterial", Vars.scene);
        navMeshMat.diffuseColor = new BABYLON.Color3(1, 0, 1);
        navMeshToUse.material = navMeshMat;

        VRLoad.setup({
            canvas: Vars.canvas,
            engine: Vars.engine,
            groundMeshName: "ground",
            navTargetMesh: navMeshToUse,
            scene: Vars.scene,
        });

        // Load extra objects
        Extras.setup();

        // Register a render loop to repeatedly render the scene
        Vars.engine.runRenderLoop(() => {
            // Run funcs in renderLoopFuncs
            for (let i in Vars.renderLoopFuncs) {
                if (Vars.renderLoopFuncs.hasOwnProperty(i)) {
                    Vars.renderLoopFuncs[i]();
                }
            }

            Vars.scene.render();
        });
    });

    // Watch for browser/canvas resize events
    window.addEventListener("resize", () => {
        Vars.engine.resize();
    });
}

function algorithmScene(callBackFunc) {
    Lights.setup();
    Extras.setup();
    callBackFunc();
}

function babylonScene(callBackFunc) {
    // callBackFunc();
    // return;

    BABYLON.SceneLoader.Load("scene/", "scene.babylon", Vars.engine, (newScene) => {
        // Wait for textures and shaders to be ready
        newScene.executeWhenReady(() => {
            // Attach camera to canvas inputs
            newScene.activeCamera.attachControl(Vars.canvas);
            Vars.setScene(newScene);

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

            callBackFunc();
        });
    }, (progress) => {
        console.log(progress);
    });
}
