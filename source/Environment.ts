import Core from "./Core/Core";
import CameraChar from "./CameraChar"; 
import RenderLoop from "./Core/RenderLoop"

declare var BABYLON;

interface MyDocument extends Document{
    /**
     * This interface prevents Typescript from throwing an error when the
     * browser takes control of the mouse.
     */

    mozPointerLockElement: any;
    webkitPointerLockElement: any;
    msPointerLockElement: any;
}
declare var document: MyDocument;

namespace Environment {
    /**
     * The Environment namespace is where all the functions and variables
     * related to the environment are stored.
     */

    export function setup(): void {
        /**
         * Set up the environment.
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
        optimize();

        // Set up the fog.
        setFog(0.0);

        // lensEffect();
        // timers();

    }

    export function setFog(density: number = 0.015): void {
        /**
         * Setup the fog.
         * @param {number = 0.015} density The fog density. Defaults to 0.015.
         */

        Core.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
        Core.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        Core.scene.fogDensity = density;
    }

    function optimize(): void {
        /**
         * Perform various optimizations to keep the engine running fast.
         */

        // Octrees make selections and things go faster.
        if (Core.scene._activeMeshes.length > 100) {
            Core.scene.createOrUpdateSelectionOctree();
        }

        // This optimization is great, except it merges different
        // LOD-level meshes into one visible mesh. I think this is a
        // BABYLON bug.

        // BABYLON.SceneOptimizer.OptimizeAsync(Core.scene);

        Core.scene.workerCollisions = true
    }

    function lensEffect(): void {
        /**
         * Create a lens effect. Not currently implemented.
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
         * The PointerLock namespace is where all the functions and variables
         * related to capturing the mouse are stored.
         */

        /* Whether or not the mouse has been captured. */
        export var alreadyLocked: boolean = false;

        export function pointerLock(): void {
            /**
             * Set up the pointerlock (to capture the mouse).
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
             * Request the mouse lock.
             * @param {any} canvas The canvas where the 3D scene is being
             *                     rendered.
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