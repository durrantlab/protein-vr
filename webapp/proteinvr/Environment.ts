///<reference path="../js/Babylonjs/dist/babylon.2.4.d.ts" />

import Core from "./Core/Core";
import CameraChar from "./CameraChar"; 
import RenderLoop from "./Core/RenderLoop"
import { startOptimizing } from "./Optimization/Optimization";

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

namespace Environment {
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
            Core.engine.resize();
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

        // lensEffect();
        // timers();

    }

    export function setFog(density: number = 0.015): void {
        /**
        Setup the fog.

        :param float density: The fog density. Defaults to 0.015.
        */

        if (density !== 0) {
            // Make the fog
            Core.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            // Core.scene.fogMode = BABYLON.Scene.FOGMODE_LINEAR;
            let color = new BABYLON.Color3(0.9, 0.9, 0.85);
            Core.scene.fogColor = color;
            Core.scene.clearColor = color;

            // If there's fog, there's no skybox, and everything is on the
            // same renderid. renderid doesn't matter... it was that your
            // custom shaders didn't accept fog.

            // No need to keep the skybox visible.
            for (let i = 0; i < Core.scene.meshes.length; i++) {
                let m = Core.scene.meshes[i];
                // Everything on same renderingroup
                // m.renderingGroupId = 1;
                if (m.name === "sky") {
                    m.isVisible = false;
                }
            }
        } else {
            // Skybox visible.
            for (let i = 0; i < Core.scene.meshes.length; i++) {
                let m = Core.scene.meshes[i];
                if (m.name === "sky") {
                    m.isVisible = true;
                    // m.renderingGroupId = 0;
                } 
                // else if (m.name === "crosshair") {
                //     // m.renderingGroupId = 2;
                // } else {
                //     // m.renderingGroupId = 1;
                // }
            }
            
        }

        Core.scene.fogDensity = density;
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
            }, Core.scene, 1.0, CameraChar.camera);
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
            var canvas = Core.scene.getEngine().getRenderingCanvas();

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
                    CameraChar.camera.detachControl(canvas);
                } else {
                    CameraChar.camera.attachControl(canvas);
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
}

export default Environment;