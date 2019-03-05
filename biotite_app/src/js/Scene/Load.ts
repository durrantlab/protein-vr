// DEBUGG import * as Extras from "./Extras";
import * as Vars from "./Vars";
import * as VRLoad from "./VR/Load";
// DEBUGG import * as Optimizations from "./VR/Optimizations";
// DEBUGG import * as Pickables from "./VR/Pickables";

declare var BABYLON;

/**
 * Load the scene, setup the VR, etc.
 * @returns void
 */
export function load(): void {
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
        // DEBUGG Extras.setup();

        // Register a render loop to repeatedly render the scene
        Vars.engine.runRenderLoop(() => {
            console.log(Vars.scene.activeCamera.id);
            window.camera = Vars.scene.activeCamera;
            Vars.scene.render();
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
    BABYLON.SceneLoader.Load("scene/", "scene.babylon", Vars.engine, (newScene) => {
        // Wait for textures and shaders to be ready
        newScene.executeWhenReady(() => {
            // Attach camera to canvas inputs
            newScene.activeCamera.attachControl(Vars.canvas);
            Vars.setScene(newScene);

            // Delete all the lights but the first one that has the substring
            // shadowlight or shadow_light.
            // DEBUGG
            /*let foundFirstShadowLight = false;
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
            */

            // Remove some meshes used only for scene construction. In the
            // perfect world, these wouldn't even be included in the babylon
            // file.
            // DEBUGG (BELOW)
            /*  for (let meshIdx in Vars.scene.meshes) {
                if (Vars.scene.meshes[meshIdx].name === "protein_box") {
                    Vars.scene.meshes[meshIdx].dispose();
                }
            }
            */

            // Optimize and make meshes clickable. Also, make sure all meshes
            // are emmissive.
            // DEBUGG (BELOW)
            /* for (let meshIdx in Vars.scene.meshes) {
                if (Vars.scene.meshes[meshIdx].material) {
                    let mesh = Vars.scene.meshes[meshIdx];

                    // It needs to be emmisive (so always baked).
                    if (mesh.material.emissiveTexture === undefined) {
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
            } */

            callBackFunc();
        });
    }, (progress) => {
        console.log(progress);
    });
}
