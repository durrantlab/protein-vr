///<reference path="../js/Babylonjs/dist/babylon.2.5.d.ts" />

import * as Core from "./Core/Core";
import * as UserVars from "./Settings/UserVars";
import * as CameraChar from "./CameraChar"; 
import * as RenderLoop from "./Core/RenderLoop"
import { startOptimizing } from "./Optimization/Optimization";
import * as LOD from "./Optimization/LOD";

interface MyDocument extends Document{
    /**
    This interface prevents Typescript from throwing an error when the
    browser takes control of the mouse.
    */

    mozPointerLockElement: any;
    webkitPointerLockElement: any;
    msPointerLockElement: any;
}
declare var document: MyDocument;

// namespace Environment {
/**
The Environment namespace is where all the functions and variables
related to the environment are stored.
*/

export function setup(): void {
    /**
    Set up the environment.
    */

    // If the window is resized, then also resize the game engine.
    window.addEventListener('resize', function() {
        PVRGlobals.engine.resize();
    });

    // If the window looses focus, pause the game.
    window.addEventListener('blur', function() {
        RenderLoop.pause();
    });

    window.addEventListener('focus', function() {
        RenderLoop.start();
    });

    // "Capture" the mouse from the browser.
    //PointerLock.pointerLock();

    // Optimize the scene to keep it running fast.
    startOptimizing();

    // Set up the fog.
    setFog(0.0);

    // Set up LOD
    let lodLevel = UserVars.getParam("objects");
    switch(lodLevel) {
        case UserVars.objects.Normal:
            LOD.adjustLODDistances(LOD.LODLevelOptions[1]);
            break;
        case UserVars.objects.Simple:
            LOD.adjustLODDistances(LOD.LODLevelOptions[2]);
            break;
        default:
            LOD.adjustLODDistances(LOD.LODLevelOptions[0]);
    }

    // lensEffect();
    // timers();

}

export function setFog(density: number = 0.015): void {
    /**
    Setup the fog.

    :param float density: The fog density. Defaults to 0.015.
    */

    let userVarFog = UserVars.getParam("fog");
    if ((userVarFog === UserVars.fog.Thin) && (density < 0.015)) {
        density = 0.35;
    } else if ((userVarFog === UserVars.fog.Thick) && (density < 0.045)) {
        density = 0.6;
    }

    if (density !== 0) {
        // Make the fog
        PVRGlobals.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        // PVRGlobals.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
        let color = new BABYLON.Color3(0.9, 0.9, 0.85);
        PVRGlobals.scene.fogColor = color;
        PVRGlobals.scene.clearColor = color;

        // If there's fog, there's no skybox, and everything is on the
        // same renderid. renderid doesn't matter... it was that your
        // custom shaders didn't accept fog.

        // No need to keep the skybox visible.
        for (let i = 0; i < PVRGlobals.scene.meshes.length; i++) {
            let m = PVRGlobals.scene.meshes[i];
            // Everything on same renderingroup
            // m.renderingGroupId = 1;
            if (m.name === "sky") {
                m.isVisible = false;
            } else {
                m.applyFog = true;
            }
        }
    } else {
        // Skybox visible.
        for (let i = 0; i < PVRGlobals.scene.meshes.length; i++) {
            let m = PVRGlobals.scene.meshes[i];
            if (m.name === "sky") {
                m.isVisible = true;
                m.renderingGroupId = 0;
            } 
            // else if (m.name === "crosshair") {
            //     m.renderingGroupId = 2;
            // } else {
            //     m.renderingGroupId = 1;
            // }
        }
        
    }

    PVRGlobals.scene.fogDensity = density;
}

export class mySceneOptimizationUpdateOctTree extends BABYLON.SceneOptimization {
    public apply = (scene): boolean => {
        scene.createOrUpdateSelectionOctree();
        return true;
    };
}

function lensEffect(): void {
    /**
    Create a lens effect. Not currently implemented.
    */

    // See http://doc.babylonjs.com/tutorials/Using_depth-of-field_and
    // _other_lens_effects
    var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
            edge_blur: 1.0,
            chromatic_aberration: 1.0,
            distortion: 1.0,
            dof_focus_distance: 50,
            dof_aperture: 2.0,	// Set very high for tilt-shift effect.
            grain_amount: 1.0,
            dof_pentagon: true,
            dof_gain: 1.0,
            dof_threshold: 1.0,
            dof_darken: 0.25
        }, PVRGlobals.scene, 1.0, PVRGlobals.camera);
}

export namespace PointerLock {
    /**
    The PointerLock namespace is where all the functions and variables
    related to capturing the mouse are stored.
    */

    /* Whether or not the mouse has been captured. */
    export var alreadyLocked: boolean = false;

    export function pointerLock(): void {
        /**
        Set up the pointerlock (to capture the mouse).
        */

        // Adapted from
        // http://www.pixelcodr.com/tutos/shooter/shooter.html

        // Get the rendering canvas.
        var canvas = PVRGlobals.scene.getEngine().getRenderingCanvas();

        // On click event, request pointer lock.
        canvas.addEventListener("click", function(evt) { 
            PointerLock.actuallyRequestLock(canvas); 
        }, false);

        // Event listener when the pointerlock is updated (or removed
        // by pressing ESC for example).
        var pointerlockchange = function(event) {
            PointerLock.alreadyLocked = (
                document.mozPointerLockElement === canvas
                || document.webkitPointerLockElement === canvas
                || document.msPointerLockElement === canvas
                || document.pointerLockElement === canvas);

            // If the user is alreday locked.
            if (!PointerLock.alreadyLocked) {
                PVRGlobals.camera.detachControl(canvas);
            } else {
                PVRGlobals.camera.attachControl(canvas);
            }
        };

        // Attach events to the document.
        document.addEventListener("pointerlockchange", 
                                    pointerlockchange, false);
        document.addEventListener("mspointerlockchange", 
                                    pointerlockchange, false);
        document.addEventListener("mozpointerlockchange", 
                                    pointerlockchange, false);
        document.addEventListener("webkitpointerlockchange", 
                                    pointerlockchange, false);

        // Tell user to click somehow.
        console.log('Tell user to click...');
    }

    export function actuallyRequestLock(canvas: any): void {
        /**
        Request the mouse lock.

        :param any canvas: The canvas where the 3D scene is being
                    rendered.
        */

        canvas.requestPointerLock = canvas.requestPointerLock || 
                                    canvas.msRequestPointerLock || 
                                    canvas.mozRequestPointerLock || 
                                    canvas.webkitRequestPointerLock;
        if (canvas.requestPointerLock) {
            canvas.requestPointerLock();
        }
    }
}
// }

// export default Environment;