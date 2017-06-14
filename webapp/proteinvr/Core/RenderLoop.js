define(["require", "exports", "../CameraChar", "../Core/Sound"], function (require, exports, CameraChar, Sound) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // namespace RenderLoop {
    /**
    A namespace that stores functions related to the BABYLON render loop.
    */
    /**
    The time the loop was last run.
    */
    exports.timeOfLastLoop = 0;
    function start() {
        /**
        Start the render loop.
        */
        Sound.playAll();
        // Once the scene is loaded, register a render loop and
        // start rendering the frames.
        PVRGlobals.engine.runRenderLoop(function () {
            inLoop();
        });
    }
    exports.start = start;
    function pause() {
        /**
        Pause the game.
        */
        if (window.location.href.indexOf("?id=") !== -1) {
            // It's a student following a teacher. Pausing not allowed.
            return;
        }
        Sound.pauseAll();
        PVRGlobals.engine.stopRenderLoop();
    }
    exports.pause = pause;
    function inLoop() {
        /**
        The contents of the render loop.
        */
        PVRGlobals.frameNum = PVRGlobals.frameNum + 1;
        // Record loop start time.
        exports.timeOfLastLoop = new Date().getTime();
        // Some things don't need to be checked every frame.
        // Let's minimize stuff to improve speed.
        // if (Core.frameNum % 10 === 0) {
        // Assuming a fps of 30, this is about every third of a second.
        // Check for collisions
        CameraChar.repositionPlayerIfCollision();
        // Save location of camera
        PVRGlobals.previousPos = PVRGlobals.camera.position.clone();
        // }
        // Set variables based on current frame rate
        // let animationRatio = PVRGlobals.scene.getAnimationRatio();
        // PVRGlobals.camera.speed = 1.5 * animationRatio;
        for (var t = 0; t < PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized.length; t++) {
            var func = PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized[t];
            func();
        }
        // Make sure the character is above the ground.
        //Ground.ensureCharAboveGround();
        for (var t = 0; t < PVRGlobals.extraFunctionsToRunInLoop_AfterCameraLocFinalized.length; t++) {
            var func = PVRGlobals.extraFunctionsToRunInLoop_AfterCameraLocFinalized[t];
            func();
        }
        // Render the scene.
        PVRGlobals.scene.render();
    }
    exports.inLoop = inLoop;
});
// }
// export default RenderLoop;
