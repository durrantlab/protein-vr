define(["require", "exports", "./Extras", "./Lights", "./Vars", "./VR/Load"], function (require, exports, Extras, Lights, Vars, VRLoad) {
    "use strict";
    exports.__esModule = true;
    function load() {
        Vars.setup();
        // algorithmScene(() => {
        babylonScene(function () {
            VRLoad.setup({
                canvas: Vars.canvas,
                engine: Vars.engine,
                floorMeshName: "ground",
                navTargetMesh: BABYLON.Mesh.CreateSphere("navTargetMesh", 4, 0.1, Vars.scene),
                scene: Vars.scene
            });
            // Load extra objects
            Extras.setup();
            // Register a render loop to repeatedly render the scene
            Vars.engine.runRenderLoop(function () {
                // Run funcs in renderLoopFuncs
                for (var i in Vars.renderLoopFuncs) {
                    if (Vars.renderLoopFuncs.hasOwnProperty(i)) {
                        Vars.renderLoopFuncs[i]();
                    }
                }
                Vars.scene.render();
            });
        });
        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () {
            Vars.engine.resize();
        });
    }
    exports.load = load;
    function algorithmScene(callBackFunc) {
        Lights.setup();
        Extras.setup();
        callBackFunc();
    }
    function babylonScene(callBackFunc) {
        // callBackFunc();
        // return;
        BABYLON.SceneLoader.Load("scene/", "scene.babylon", Vars.engine, function (newScene) {
            // Wait for textures and shaders to be ready
            newScene.executeWhenReady(function () {
                // Attach camera to canvas inputs
                newScene.activeCamera.attachControl(Vars.canvas);
                Vars.setScene(newScene);
                // Delete all the lights but the first one that has the substring
                // shadowlight or shadow_light.
                var foundFirstShadowLight = false;
                var indexToUse = 0;
                while (Vars.scene.lights.length > 1) {
                    var light = Vars.scene.lights[indexToUse];
                    var lightName = light.name.toLowerCase();
                    var isShadowLight = ((lightName.indexOf("shadowlight") !== -1) ||
                        (lightName.indexOf("shadow_light") !== -1));
                    if (!isShadowLight) {
                        // It's not a shadow light. Delete it.
                        Vars.scene.lights[indexToUse].dispose();
                    }
                    else if (foundFirstShadowLight) {
                        // You've already found a shadow light. Delete additional
                        // ones.
                        Vars.scene.lights[indexToUse].dispose();
                    }
                    else {
                        // Must be the first shadow light. Don't delete, but make
                        // note of it.
                        foundFirstShadowLight = true;
                        indexToUse++;
                    }
                }
                callBackFunc();
            });
        }, function (progress) {
            console.log(progress);
        });
    }
});
