///<reference path="../../js/Babylonjs/dist/babylon.2.5.d.ts" />
define(["require", "exports", "../Environment", "./LOD", "./Fog"], function (require, exports, Environment, LOD_1, Fog_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var optimizationWaitDuration = 10000; // how to long wait after successfull
    // optimization to check and see if
    // further optimization needed.
    // Sometimes BABYLON.SceneOptimizer.OptimizeAsync doesn't ever call the
    // callBack functions. That breaks the periodic optimization checks. Very
    // annoying! So if it's been too long since optimization was attempted,
    // start checking for optimization again.
    var lastTimeOptimizationChecked = 0;
    function startOptimizing() {
        oneTimeOptimization(function () {
            // So one time optimization is done. Wait just a bit before starting
            // the regular optimization. Let the scene stabalize before that first
            // big hit.
            setTimeout(function () {
                // Do the first on-the-fly optimization
                babylonOptimization();
            }, 3000);
        });
    }
    exports.startOptimizing = startOptimizing;
    function oneTimeOptimization(doneCallBack) {
        /**
        Perform various optimizations to keep the engine running fast. This is
        run once on the loaded scene.
        */
        // Octrees make selections and things go faster.
        if (PVRGlobals.scene._activeMeshes.length > 100) {
            PVRGlobals.scene.createOrUpdateSelectionOctree();
        }
        // If the user specified lower-resolution textures, do that now...
        // setTimeout(function() {
        //     let textureDetail = UserVars.getParam("texturedetail");
        //     if (textureDetail !== UserVars.textureDetail.High) {
        //         let reso = (textureDetail === UserVars.textureDetail.Medium) ? 512 : 256;
        //         var optim = new BABYLON.SceneOptimizerOptions(100, 2000); // 100 is impossible fps to attain. 10 ms isn't enough to get accurate count, but doesn't matter.
        //         optim.optimizations.push(new BABYLON.TextureOptimization(0, reso));
        //         BABYLON.SceneOptimizer.OptimizeAsync(
        //             PVRGlobals.scene,
        //             optim,
        //             function () {
        //                 alert("Success!");
        //             },
        //             function () {
        //                 alert("Did not attain FPS!");
        //             }
        //         );
        //     }
        // }, 3000);
        // Every 30 seconds see if you need to restart the on-the-fly
        // optimization.
        var periodicChecksDuration = 30000;
        setInterval(function () {
            var curTime = new Date().getTime();
            if (curTime - lastTimeOptimizationChecked > periodicChecksDuration) {
                // It's been 10 seconds since callback should have fired.
                // Assume it's not going to happen.
                console.log("Appears that babylon optimization never fired callback. Restarting optimization checks...");
                babylonOptimization();
            }
        }, periodicChecksDuration + optimizationWaitDuration);
        PVRGlobals.scene.workerCollisions = true;
        doneCallBack();
    }
    exports.oneTimeOptimization = oneTimeOptimization;
    function babylonOptimization() {
        // Optimization on the fly (as engine is running). Optimizes based on
        // current FPS.
        lastTimeOptimizationChecked = new Date().getTime();
        // This optimization is great, except it merges different
        // LOD-level meshes into one visible mesh. I think this is a
        // BABYLON bug.
        //console.log(Core.engine.getFps());
        console.log("optimizing... "); //FPS: ", Core.engine.getFps());
        console.log("current frame rate: " + PVRGlobals.engine.getFps());
        BABYLON.SceneOptimizer.OptimizeAsync(PVRGlobals.scene, 
        //BABYLON.SceneOptimizerOptions.HighDegradationAllowed(), //optimizationOptions(), // this.optimizationOptions() doesn't work 
        optimizationOptions(), function () {
            // On success. This means it was eventually able to get down
            // to an acceptable FPS. I think it checks if its changes
            // worked every two seconds, so this callback could take a
            // while to be fired.
            console.log("Goal met");
            // Check again in 5 seconds. Could make this even longer.
            setTimeout(function () {
                babylonOptimization();
            }, optimizationWaitDuration);
        }, function () {
            // FPS target not reached. Despite all optimization attempts,
            // you were not able to get the desired FPS. If it gets here,
            // the scene is (as best I can tell) "optimized out."
            console.log("Goal not met");
            // Give it only a short time to recover before check to see if
            // further optimizations are needed.
            setTimeout(function () {
                babylonOptimization();
            }, 500);
        });
    }
    exports.babylonOptimization = babylonOptimization;
    function optimizationOptions() {
        var optim = new BABYLON.SceneOptimizerOptions(30, 2000);
        // Merge meshes that have same material.
        // In browser simplification.
        // "priority" here serves to group the optimizations. The optimizer
        // tries all with priority 0. If that fails to give desired FPS, it
        // tries all with priority 1, etc. It passes priority to the
        // individual SceneOptimization objects so they can perfrom escalating
        // degrees of optimization if needed.
        var priority = 0;
        // Things that will have a minimal impact on appearance. Textures to
        // 1024 (still high).
        optim.optimizations.push(new BABYLON.ShadowsOptimization(priority));
        optim.optimizations.push(new BABYLON.LensFlaresOptimization(priority));
        optim.optimizations.push(new Environment.mySceneOptimizationUpdateOctTree(priority));
        optim.optimizations.push(new BABYLON.TextureOptimization(priority, 1024));
        // limit post processing enhancements
        // Need to create optimization class for this for it to work...
        // Environment.limitLensEffect();
        priority++; // 1  
        // Minor impact on appearance. Introducing LOD.
        // HERE PUT SOMETHING THAT DEACTIVATES ALL POST PROCESSES BUT BARREL...
        optim.optimizations.push(new BABYLON.ParticlesOptimization(priority));
        optim.optimizations.push(new LOD_1.mySceneOptimizationLOD(priority)); // LOD #1
        // Next priority
        priority++; // 2  
        // Modest impact on appearance. Textures at 512, more aggressive LOD.
        optim.optimizations.push(new BABYLON.TextureOptimization(priority, 512));
        optim.optimizations.push(new LOD_1.mySceneOptimizationLOD(priority)); // LOD #2
        // Next priority
        priority++; // 3
        // Major impact on apperance. Only 1 color texture on your custom
        // shader. Even more aggressive LOD.
        optim.optimizations.push(new LOD_1.mySceneOptimizationLOD(priority)); // LOD #3
        optim.optimizations.push(new Fog_1.mySceneOptimizationFog(priority)); // Fog #1
        priority++; // 4
        // Very severe impact on appearance. Bring in fog and get rid of baked
        // shadows on custom shaders.
        optim.optimizations.push(new BABYLON.RenderTargetsOptimization(priority));
        optim.optimizations.push(new BABYLON.PostProcessesOptimization(priority)); // This removes barrel distortion, which might be important...
        priority++; // 5
        // Fog thicker to avoid rendering things in the distance.
        optim.optimizations.push(new Fog_1.mySceneOptimizationFog(priority)); // Fog #2
        priority++; // 6
        // Fog ridiculously thick, and textures down to 256.
        optim.optimizations.push(new BABYLON.TextureOptimization(priority, 256));
        optim.optimizations.push(new BABYLON.HardwareScalingOptimization(priority, 4));
        optim.optimizations.push(new Fog_1.mySceneOptimizationFog(priority)); // Fog #3
        return optim;
    }
});
