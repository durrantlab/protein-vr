define(["require", "exports", "./Core/Core", "./CameraChar"], function (require, exports, Core_1, CameraChar_1) {
    "use strict";
    /**
     * The Environment namespace is where all the functions and variables
     * related to the environment are stored.
     */
    var Environment;
    (function (Environment) {
        /**
         * Set up the environment.
         */
        function setup() {
            // If the window is resized, then also resize the game engine.
            window.addEventListener('resize', function () {
                Core_1.default.engine.resize();
            });
            // "Capture" the mouse from the browser.
            //PointerLock.pointerLock();
            // Optimize the scene to keep it running fast.
            optimize();
            // Set up the fog.
            setFog();
            // lensEffect();
            // timers();
        }
        Environment.setup = setup;
        /**
         * Setup the fox.
         * @param {number = 0.015} density The fog density. Defaults to 0.015.
         */
        function setFog(density) {
            if (density === void 0) { density = 0.015; }
            Core_1.default.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            Core_1.default.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            Core_1.default.scene.fogDensity = density;
        }
        Environment.setFog = setFog;
        /**
         * Perform various optimizations to keep the engine running fast.
         */
        function optimize() {
            // Octrees make selections and things go faster.
            if (Core_1.default.scene._activeMeshes.length > 100) {
                Core_1.default.scene.createOrUpdateSelectionOctree();
            }
            // This optimization is great, except it merges different
            // LOD-level meshes into one visible mesh. I think this is a
            // BABYLON bug.
            // BABYLON.SceneOptimizer.OptimizeAsync(Core.scene);
            Core_1.default.scene.workerCollisions = true;
        }
        /**
         * Create a lens effect. Not currently implemented.
         */
        function lensEffect() {
            // See http://doc.babylonjs.com/tutorials/Using_depth-of-field_and
            // _other_lens_effects
            var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
                edge_blur: 1.0,
                chromatic_aberration: 1.0,
                distortion: 1.0,
                dof_focus_distance: 50,
                dof_aperture: 2.0,
                grain_amount: 1.0,
                dof_pentagon: true,
                dof_gain: 1.0,
                dof_threshold: 1.0,
                dof_darken: 0.25
            }, Core_1.default.scene, 1.0, CameraChar_1.default.camera);
        }
        /**
         * The PointerLock namespace is where all the functions and variables
         * related to capturing the mouse are stored.
         */
        var PointerLock;
        (function (PointerLock) {
            /* Whether or not the mouse has been captured. */
            PointerLock.alreadyLocked = false;
            /**
             * Set up the pointerlock (to capture the mouse).
             */
            function pointerLock() {
                // Adapted from
                // http://www.pixelcodr.com/tutos/shooter/shooter.html
                // Get the rendering canvas.
                var canvas = Core_1.default.scene.getEngine().getRenderingCanvas();
                // On click event, request pointer lock.
                canvas.addEventListener("click", function (evt) {
                    PointerLock.actuallyRequestLock(canvas);
                }, false);
                // Event listener when the pointerlock is updated (or removed
                // by pressing ESC for example).
                var pointerlockchange = function (event) {
                    PointerLock.alreadyLocked = (document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);
                    // If the user is alreday locked.
                    if (!PointerLock.alreadyLocked) {
                        CameraChar_1.default.camera.detachControl(canvas);
                    }
                    else {
                        CameraChar_1.default.camera.attachControl(canvas);
                    }
                };
                // Attach events to the document.
                document.addEventListener("pointerlockchange", pointerlockchange, false);
                document.addEventListener("mspointerlockchange", pointerlockchange, false);
                document.addEventListener("mozpointerlockchange", pointerlockchange, false);
                document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
                // Tell user to click somehow.
                console.log('Tell user to click...');
            }
            PointerLock.pointerLock = pointerLock;
            /**
             * Request the mouse lock.
             * @param {any} canvas The canvas where the 3D scene is being
             *                     rendered.
             */
            function actuallyRequestLock(canvas) {
                canvas.requestPointerLock = canvas.requestPointerLock ||
                    canvas.msRequestPointerLock ||
                    canvas.mozRequestPointerLock ||
                    canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
            PointerLock.actuallyRequestLock = actuallyRequestLock;
        })(PointerLock = Environment.PointerLock || (Environment.PointerLock = {}));
    })(Environment || (Environment = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Environment;
});
