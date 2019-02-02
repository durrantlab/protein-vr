define(["require", "exports", "./Vars"], function (require, exports, Vars) {
    "use strict";
    exports.__esModule = true;
    function setup() {
        // Turn on scene optimizer
        BABYLON.SceneOptimizer.OptimizeAsync(Vars.vars.scene);
        // Assume no part of the scene goes on to empty (skybox?)
        Vars.vars.scene.autoClear = false; // Color buffer
        Vars.vars.scene.autoClearDepthAndStencil = false; // Depth and stencil, obviously
        // Modify some meshes
        for (var idx in Vars.vars.scene.meshes) {
            if (Vars.vars.scene.meshes.hasOwnProperty(idx)) {
                var mesh = Vars.vars.scene.meshes[idx];
                // Meshes that contain the word "baked" should be shadeless
                if ((mesh.name.indexOf("baked") !== -1) && (mesh.material !== undefined)) {
                    // Make material shadeless
                    mesh.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                    mesh.material.specularColor = new BABYLON.Color3(0, 0, 0);
                    mesh.material.emissiveTexture = mesh.material.diffuseTexture;
                    mesh.material.diffuseTexture = null;
                    // Material won't be changing. But apparently this is no
                    // longer a needed optimization:
                    // http://www.html5gamedevs.com/topic/37540-when-is-it-safe-to-freeze-materials/
                    // mesh.material.freeze();
                    // Assume no change in location (because that would require
                    // recalculating shadows)
                    mesh.freezeWorldMatrix();
                }
            }
        }
    }
    exports.setup = setup;
});
