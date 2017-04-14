///<reference path="../../js/Babylonjs/dist/babylon.2.4.d.ts" />

import Core from "../Core/Core";
import Environment from "../Environment";
import { mySceneOptimizationLOD } from "./LOD";
import { mySceneOptimizationFog } from "./Fog";

var optimizationWaitDuration = 10000;  // how to long wait after successfull
                                        // optimization to check and see if
                                        // further optimization needed.

// Sometimes BABYLON.SceneOptimizer.OptimizeAsync doesn't ever call the
// callBack functions. That breaks the periodic optimization checks. Very
// annoying! So if it's been too long since optimization was attempted,
// start checking for optimization again.
var lastTimeOptimizationChecked: number = 0;

var intervalWaitingForLODToFinishID = undefined;

export function startOptimizing() {
    oneTimeOptimization(function() {
        // So one time optimization is done (including setting up LOD)
        // Wait just a bit before starting the regular optimization. Let the scene
        // stabalize before that first big hit.
        setTimeout(function() {
            // Do the first on-the-fly optimization
            babylonOptimization();
        }, 3000);
    });
}

export function oneTimeOptimization(doneCallBack: any) {
    /**
    Perform various optimizations to keep the engine running fast. This is
    run once on the loaded scene.
    */

    // Octrees make selections and things go faster.
    if (Core.scene._activeMeshes.length > 100) {
        Core.scene.createOrUpdateSelectionOctree();
    }

    // AutoLOD all the relevant objects. You do this now, but then change the
    // distances later as you more agressively apply the LOD. Doing it here is
    // better, because trying to decimate while maintaining FPS is a no go,
    // and leads the optimizer to think drastic things need to be done to
    // maintain FPS. The default distances are so large that, for all
    // practical purposes, it is disabled.

    // Only continue once autoLOD done.
    // intervalWaitingForLODToFinishID = setInterval(function() {
    //     if (autoLODDone() === true) {
            clearInterval(intervalWaitingForLODToFinishID);

            // Every 30 seconds see if you need to restart the on-the-fly
            // optimization.
            let periodicChecksDuration = 30000;
            setInterval(function() {
                let curTime = new Date().getTime();
                if (curTime - lastTimeOptimizationChecked > periodicChecksDuration) {
                    // It's been 10 seconds since callback should have fired.
                    // Assume it's not going to happen.
                    console.log("Appears that babylon optimization never fired callback. Restarting optimization checks...");
                    babylonOptimization();
                }
            }, periodicChecksDuration + optimizationWaitDuration);

            Core.scene.workerCollisions = true;
            
            /*this.*/doneCallBack()

        // } 
    // }.bind({
    //     doneCallBack: doneCallBack
    // }), 500);

}

export function babylonOptimization() {
    // Optimization on the fly (as engine is running). Optimizes based on
    // current FPS.

    lastTimeOptimizationChecked = new Date().getTime();

    // This optimization is great, except it merges different
    // LOD-level meshes into one visible mesh. I think this is a
    // BABYLON bug.
    //console.log(Core.engine.getFps());
    console.log("optimizing... "); //FPS: ", Core.engine.getFps());
    BABYLON.SceneOptimizer.OptimizeAsync(
        Core.scene,
        //BABYLON.SceneOptimizerOptions.HighDegradationAllowed(), //optimizationOptions(), // this.optimizationOptions() doesn't work 
        optimizationOptions(),
        function() {
            // On success. This means it was eventually able to get down
            // to an acceptable FPS. I think it checks if its changes
            // worked every two seconds, so this callback could take a
            // while to be fired.
            console.log("Goal met");
            
            // Check again in 5 seconds. Could make this even longer.
            setTimeout(function() {
                babylonOptimization();
            }, optimizationWaitDuration);
        }, function() {
            // FPS target not reached. Despite all optimization attempts,
            // you were not able to get the desired FPS. If it gets here,
            // the scene is (as best I can tell) "optimized out."
            console.log("Goal not met");

            // Give it only a short time to recover before check to see if
            // further optimizations are needed.
            setTimeout(function() {
                babylonOptimization();
            }, 500);
        }
    );
}

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
    

    priority++;  // 1  
    // Minor impact on appearance. Introducing LOD.
    optim.optimizations.push(new BABYLON.PostProcessesOptimization(priority));
    optim.optimizations.push(new BABYLON.ParticlesOptimization(priority));
    optim.optimizations.push(new mySceneOptimizationLOD(priority));  // LOD #1


    // Next priority
    priority++; // 2  
    // Modest impact on appearance. Textures at 512, more aggressive LOD.
    optim.optimizations.push(new BABYLON.TextureOptimization(priority, 512));
    optim.optimizations.push(new mySceneOptimizationLOD(priority));  // LOD #2


    // Next priority
    priority++;  // 3
    // Major impact on apperance. Only 1 color texture on your custom
    // shader. Even more aggressive LOD.
    optim.optimizations.push(new mySceneOptimizationLOD(priority));  // LOD #3

    priority++;  // 4
    // Very severe impact on appearance. Bring in fog and get rid of baked
    // shadows on custom shaders.
    optim.optimizations.push(new BABYLON.RenderTargetsOptimization(priority));
    optim.optimizations.push(new mySceneOptimizationFog(priority));  // Fog #1

    priority++;  // 5
    // Fog thicker to avoid rendering things in the distance.
    optim.optimizations.push(new mySceneOptimizationFog(priority));  // Fog #2

    priority++;  // 6
    // Fog ridiculously thick, and textures down to 256.
    optim.optimizations.push(new BABYLON.TextureOptimization(priority, 256));
    optim.optimizations.push(new BABYLON.HardwareScalingOptimization(priority, 4));
    optim.optimizations.push(new mySceneOptimizationFog(priority));  // Fog #3

    return optim;
}