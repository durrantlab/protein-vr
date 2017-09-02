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
    // var canvas = jQuery("canvas"); // PVRGlobals.scene.getEngine().getRenderingCanvas();
    let canvas = document.getElementsByTagName("canvas")[0];

    // On click event, request pointer lock.
    // canvas.addEventListener("click", function(evt) { 
    //     PointerLock.actuallyRequestLock(canvas); 
    // }, false);

    // Event listener when the pointerlock is updated (or removed
    // by pressing ESC for example).
    var pointerlockchange = function(event) {
        alreadyLocked = (
            document.mozPointerLockElement === canvas
            || document.webkitPointerLockElement === canvas
            || document.msPointerLockElement === canvas
            || document.pointerLockElement === canvas);

        // If the user is alreday locked.
        // if (!alreadyLocked) {
        //     PVRGlobals.camera.detachControl(canvas);
        // } else {
        //     PVRGlobals.camera.attachControl(canvas);
        // }
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
    // console.log('Tell user to click...');

    actuallyRequestLock(canvas);
}
    // if limiting fps, remove dof_gain and dof_aperature first

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
