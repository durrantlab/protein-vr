import * as Core from "./Core";
import * as CameraChar from "../CameraChar";
import Ground from "../Objects/Ground";

// namespace RenderLoop {
/**
A namespace that stores functions related to the BABYLON render loop.
*/

/**
The time the loop was last run.
*/
export var timeOfLastLoop: number = 0;
declare var PVRGlobals;

export function start(): void {
    /**
    Start the render loop.
    */

    // Once the scene is loaded, register a render loop and
    // start rendering the frames.
    PVRGlobals.engine.runRenderLoop(function() {
        inLoop();
    });
}

export function pause(): void {
    /**
    Pause the game.
    */

    PVRGlobals.engine.stopRenderLoop();
}

export function inLoop(): void {
    /**
    The contents of the render loop.
    */

    PVRGlobals.frameNum = PVRGlobals.frameNum + 1;

    // Record loop start time.
    timeOfLastLoop = new Date().getTime();

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

    for (let t = 0; t < PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized.length; t++) {
        let func = PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized[t];
        func();
    }

    // Make sure the character is above the ground.
    //Ground.ensureCharAboveGround();

    for (let t = 0; t < PVRGlobals.extraFunctionsToRunInLoop_AfterCameraLocFinalized.length; t++) {
        let func = PVRGlobals.extraFunctionsToRunInLoop_AfterCameraLocFinalized[t];
        func();
    }

    // Render the scene.
    PVRGlobals.scene.render();
}
// }

// export default RenderLoop;
