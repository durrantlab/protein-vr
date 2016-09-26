/**
 * This interface prevents Typescript from throwing an error when the
 * browser takes control of the mouse.
 */
interface Document {
    mozPointerLockElement: any;
    webkitPointerLockElement: any;
    msPointerLockElement: any;
}

/**
 * This interface prevents Typescript from throwing an error when the
 * browser takes control of the mouse.
 */
interface document {
    mozPointerLockElement: any;
    webkitPointerLockElement: any;
    msPointerLockElement: any;
}

/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
namespace World {

    /**
     * The Environment namespace is where all the functions and variables
     * related to the environment are stored.
     */
    export namespace Environment {

        /**
         * Set up the environment.
         */
        export function setup(): void {

            // If the window is resized, then also resize the game engine.
            window.addEventListener('resize', function() {
                World.engine.resize();
            });

            // "Capture" the mouse from the browser.
            PointerLock.pointerLock();

            // Optimize the scene to keep it running fast.
            optimize();

            // Set up the fog.
            World.Environment.setFog();

            // lensEffect();
            // timers();

        }

        /**
         * Setup the fox.
         * @param {number = 0.015} density The fog density. Defaults to 0.015.
         */
        export function setFog(density: number = 0.015): void {
            World.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            World.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            World.scene.fogDensity = density;
        }

        /**
         * Perform various optimizations to keep the engine running fast.
         */
        function optimize(): void {
            // Octrees make selections and things go faster.
            if (World.scene._activeMeshes.length > 100) {
                World.scene.createOrUpdateSelectionOctree();
            }

            // This optimization is great, except it merges different
            // LOD-level meshes into one visible mesh. I think this is a
            // BABYLON bug.

            // BABYLON.SceneOptimizer.OptimizeAsync(World.scene);

            World.scene.workerCollisions = true
        }

        /**
         * Create a lens effect. Not currently implemented.
         */
        function lensEffect(): void {
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
                }, World.scene, 1.0, World.CameraChar.camera);
        }

        /**
         * The PointerLock namespace is where all the functions and variables
         * related to capturing the mouse are stored.
         */
        export namespace PointerLock {

            /* Whether or not the mouse has been captured. */
            export var alreadyLocked: boolean = false;

            /**
             * Set up the pointerlock (to capture the mouse).
             */
            export function pointerLock(): void {
                // Adapted from
                // http://www.pixelcodr.com/tutos/shooter/shooter.html

                // Get the rendering canvas.
                var canvas = World.scene.getEngine().getRenderingCanvas();

                // On click event, request pointer lock.
                canvas.addEventListener("click", function(evt) { 
                    World.Environment.PointerLock.actuallyRequestLock(canvas); 
                }, false);

                // Event listener when the pointerlock is updated (or removed
                // by pressing ESC for example).
                var pointerlockchange = function(event) {
                    World.Environment.PointerLock.alreadyLocked = (
                        document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);

                    // If the user is alreday locked.
                    if (!World.Environment.PointerLock.alreadyLocked) {
                        World.CameraChar.camera.detachControl(canvas);
                    } else {
                        World.CameraChar.camera.attachControl(canvas);
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

            /**
             * Request the mouse lock.
             * @param {any} canvas The canvas where the 3D scene is being
             *                     rendered.
             */
            export function actuallyRequestLock(canvas: any): void {
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
}
