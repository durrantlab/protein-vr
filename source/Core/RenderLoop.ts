import Core from "./Core";
import CameraChar from "../CameraChar";
import Ground from "../Objects/Ground";

namespace RenderLoop {
    /**
     * A namespace that stores functions related to the BABYLON render loop.
     */

    /**
     * A list of functions to run in the render loop.
     */
    export var extraFunctionsToRunInLoop: any[] = [];

    /**
     * The time the loop was last run.
     */
    export var timeOfLastLoop: number = 0;

    export function start(): void {
        /**
         * Start the render loop.
         */

        // Once the scene is loaded, register a render loop and
        // start rendering the frames.
        Core.engine.runRenderLoop(function() {
            RenderLoop.inLoop();
        });
    }

    export function pause(): void {
        /**
         * Pause the game.
         */

        Core.engine.stopRenderLoop();
    }

    export function inLoop(): void {
        /**
         * The contents of the render loop.
         */

        Core.frameNum++;

        // Record loop start time.
        RenderLoop.timeOfLastLoop = new Date().getTime();

        // Some things don't need to be checked every frame.
        // Let's minimize stuff to improve speed.

        // if (Core.frameNum % 10 === 0) {
        // Assuming a fps of 30, this is about every third of a second.

        // Check for collisions
        CameraChar.repositionPlayerIfCollision();

        // Save location of camera
        CameraChar.previousPos = CameraChar.camera.position.clone();

        // }

        // These do run every frame
        // Timers.tick();

        // Make sure the character is above the ground.
        Ground.ensureCharAboveGround();

        // Set variables based on current frame rate
        // let animationRatio = Core.scene.getAnimationRatio();
        // CameraChar.camera.speed = 1.5 * animationRatio;

        for (let t = 0; t < RenderLoop.extraFunctionsToRunInLoop.length; t++) {
            let func = RenderLoop.extraFunctionsToRunInLoop[t];
            func();
        }

        // Render the scene.
        Core.scene.render();
    }
}


export default RenderLoop;
