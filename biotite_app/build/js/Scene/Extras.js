define(["require", "exports", "./GUI", "./Vars", "./VR/Pickables"], function (require, exports, GUI, Vars, Pickables) {
    "use strict";
    exports.__esModule = true;
    function setup() {
        // Set up the shadow generator.
        setupShadowGenerator();
        jQuery.getJSON("scene_info.json", function (data) {
            // Make UVs work
            BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
            // Go through each of the protein meshes.
            var loaderPromises = [];
            var _loop_1 = function (idx) {
                if (data["objIDs"].hasOwnProperty(idx)) {
                    var objID_1 = data["objIDs"][idx];
                    // Load the mesh.
                    var loader = BABYLON.SceneLoader.LoadAssetContainerAsync("./", objID_1 + ".gltf", Vars.scene).then(function (container) {
                        // Get the meshes.
                        for (var uniqStrID in container.meshes) {
                            if (container.meshes.hasOwnProperty(uniqStrID)) {
                                var uniqIntID = parseInt(uniqStrID, 10);
                                var mesh = container.meshes[uniqIntID];
                                setupMesh(mesh, objID_1, data["shadowQuality"], uniqIntID);
                            }
                        }
                        // Add the object to the scene.
                        container.addAllToScene();
                    });
                    loaderPromises.push(loader);
                }
            };
            for (var idx in data["objIDs"]) {
                _loop_1(idx);
            }
            setupShadowCatchers();
            Promise.all(loaderPromises).then(function () {
                // Give it a bit to let one render cycle go through. Hackish,
                // admittedly.
                setTimeout(updateEnvironmentShadows, 1000);
                // "ShadowCatcher",
                // ["baked__Ceiling", "baked__Wall.001", "baked__floor",
                // "ground"].map((m) => {Vars.scene.getMeshByName(m).visibility = 0;
                // return 0; }); "";
            });
            GUI.setupGUI(data);
        });
    }
    exports.setup = setup;
    function setupShadowGenerator() {
        // Set up the shadow generator.
        exports.shadowGenerator = new BABYLON.ShadowGenerator(4096, Vars.scene.lights[0]);
        // shadowGenerator.usePoissonSampling = true;  // Good but slow.
        exports.shadowGenerator.useBlurExponentialShadowMap = true;
        exports.shadowGenerator.blurScale = 7; // Good for surfaces and ribbon.
        exports.shadowGenerator.setDarkness(0.9625);
        exports.shadowGenerator.blurBoxOffset = 5;
        // window.shadowGenerator = shadowGenerator;
    }
    function setupMesh(mesh, objID, shadowQuality, uniqIntID) {
        if (mesh.material !== undefined) {
            if (shadowQuality !== "Skip") {
                // So using shadows baked from blender.
                // Save the side orientation before removing mesh.
                var oldMatOrien = mesh.material.sideOrientation;
                // Remove existing material
                mesh.material.dispose();
                mesh.material = null;
                // Make sure not alpha blended.
                mesh.hasVertexAlpha = false;
                mesh.visibility = true;
                // Create new material
                var mat = new BABYLON.StandardMaterial("molMat" + uniqIntID.toString(), Vars.scene);
                mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
                mat.specularColor = new BABYLON.Color3(0, 0, 0);
                mat.opacityTexture = null;
                mat.sideOrientation = oldMatOrien;
                // mat.diffuseTexture.hasAlpha = false;
                var texName = objID + ".png";
                var tex = new BABYLON.Texture(// lightmapTexture
                texName, Vars.scene);
                tex.vScale = -1;
                mat.emissiveTexture = tex;
                mat.disableLighting = true;
                mat.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
                mat.backFaceCulling = false;
                // Add it to the mesh
                mesh.material = mat;
            }
            else {
                // Not using baked shadows. Add a small emission color so the dark
                // side of the protein isn't too dark. Is this like ambient
                // occlusion?
                mesh.material.emissiveColor = new BABYLON.Color3(0.01, 0.01, 0.01);
                // let ssao = new BABYLON.SSAORenderingPipeline("ssaopipeline", Vars.scene, 0.75);
            }
        }
        // This is required to position correctly.
        mesh.scaling.z = -1;
        if (uniqIntID > 0) {
            mesh.scaling.x = -1;
        }
        // Make it so it casts a shadow.
        exports.shadowGenerator.getShadowMap().renderList.push(mesh);
        // Make it pickable
        Pickables.addPickableMolecule(mesh);
    }
    function setupShadowCatchers() {
        // Go through and find the shdow catchers
        for (var idx in Vars.scene.meshes) {
            if (Vars.scene.meshes.hasOwnProperty(idx)) {
                var mesh = Vars.scene.meshes[idx];
                if ((mesh.name.toLowerCase().indexOf("shadowcatcher") !== -1) || (mesh.name.toLowerCase().indexOf("shadow_catcher") !== -1)) {
                    // Make the material
                    mesh.material = new BABYLON.ShadowOnlyMaterial("shadow_catch" + idx.toString(), Vars.scene);
                    mesh.material.activeLight = Vars.scene.lights[0];
                    // mesh.material.alpha = 0.1;
                    // It can receive shadows.
                    mesh.receiveShadows = true;
                }
            }
        }
    }
    function updateEnvironmentShadows() {
        // Update the shadows. They are frozen otherwise.
        Vars.scene.lights[0].autoUpdateExtends = true;
        exports.shadowGenerator.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
        Vars.scene.lights[0].autoUpdateExtends = false;
    }
    exports.updateEnvironmentShadows = updateEnvironmentShadows;
});
// window.updateEnvironmentShadows = updateEnvironmentShadows;
