define(["require", "exports", "./Core", "../CameraChar", "../Objects/Ground"], function (require, exports, Core_1, CameraChar_1, Ground_1) {
    "use strict";
    /**
     * A namespace that stores functions related to the BABYLON render loop.
     */
    var RenderLoop;
    (function (RenderLoop) {
        /**
         * A list of functions to run in the render loop.
         */
        RenderLoop.extraFunctionsToRunInLoop = [];
        /**
         * The time the loop was last run.
         */
        RenderLoop.timeOfLastLoop = 0;
        /**
         * Start the render loop.
         */
        function start() {
            // Once the scene is loaded, register a render loop and
            // start rendering the frames.
            Core_1.default.engine.runRenderLoop(function () {
                RenderLoop.inLoop();
            });
        }
        RenderLoop.start = start;
        /**
         * Pause the game.
         */
        function pause() {
            Core_1.default.engine.stopRenderLoop();
        }
        RenderLoop.pause = pause;
        /**
         * The contents of the render loop.
         */
        function inLoop() {
            Core_1.default.frameNum++;
            // Record loop start time.
            RenderLoop.timeOfLastLoop = new Date().getTime();
            // Some things don't need to be checked every frame.
            // Let's minimize stuff to improve speed.
            // if (Core.frameNum % 10 === 0) {
            // Assuming a fps of 30, this is about every third of a second.
            // Check for collisions
            CameraChar_1.default.repositionPlayerIfCollision();
            // Save location of camera
            CameraChar_1.default.previousPos = CameraChar_1.default.camera.position.clone();
            // }
            // These do run every frame
            // Timers.tick();
            // Make sure the character is above the ground.
            Ground_1.default.ensureCharAboveGround();
            // Set variables based on current frame rate
            // let animationRatio = Core.scene.getAnimationRatio();
            // CameraChar.camera.speed = 1.5 * animationRatio;
            for (var t = 0; t < RenderLoop.extraFunctionsToRunInLoop.length; t++) {
                var func = RenderLoop.extraFunctionsToRunInLoop[t];
                func();
            }
            // Render the scene.
            Core_1.default.scene.render();
        }
        RenderLoop.inLoop = inLoop;
    })(RenderLoop || (RenderLoop = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = RenderLoop;
});
