// I'm sure there's a more elegant making a global-variable storage area that
// doesn't pollute the global name space, but I'm going with this for now...

if ((<any>window)._proteinvrGlobals === undefined) {
    (<any>window)._proteinvrGlobals = {
        "scene": undefined,  // BABYLON.scene object.
        "engine": undefined,  // BABYLON.engine object
        "canvas": undefined,  // The canvas where the scene is rendered (from DOM)
        // "camera": undefined,  // BABYLON.camera object.
        "jQuery": undefined,  // The jQuery library.
        "BABYLON": undefined,  // The BABYLON library
        "viewerSphereTemplate": undefined,  // The initial viewsphere BABYLON mesh that all others inherit.
        // "cameraPositions": undefined,  // Valid camera positions, pulled from data.json (PVRJsonSetup.ts)
        "animationData": undefined,  // Stores animation data. Keys are mesh names, lists of [x, y, z, rotx, roty, rotz] as values.
        "firstFrameIndex": undefined,  // The index of the first animation frame.
        "lastFrameIndex": undefined,
        "pngFileSizes": undefined,
        "nextMoves": undefined,
        "uniqID": undefined,  // unique id associated with this project.
        // "triggers": undefined,
        // "viewerSpheres": undefined,  // A Spheres.SphereCollection.SphereCollection object.
        // "sphereMaterials": undefined,  // The materials associated with each viewer sphere.
        "skyboxSphere": undefined,  // The skybox sphere (sky box)
        // "destinationNeighborSphere": undefined, // sphere that shows where used is looking (for some kinds of navigation)
        "debug": false,  // Whether or not to run in debug mode.
        "breakCaching": true,  // add ?random strings to end of png textures, so doesn't cache.
        "mouseDownAdvances": true,  // Whether or not clicking the mouse advances your position.
        "isMobile": undefined,  // Mobile device?
        "numFrameTexturesLoaded": 0,  // The total number offrames loaded (from data.json?)
        "numNeighboringCameraPosForNavigation": 4,  // Max number of navigation arrows
        "cameraTypeToUse": "show-desktop-screen",  // Camera type (VR headsert vs. screen, etc.)
        "signData": [],  // Data about signs. Work in progress.
        "lazyLoadViewerSpheres": true,  // Whether or not to lazy load textures/materials.
        "lazyLoadCount": 10, // Number of viewer spheres to lazy load at a time
        // "lazyLoadedSpheres": [], // An array which will contain all spheres which have had their assets loaded, used for removing unwanted assets from memory
        "meshesWithAnimations": [],  // A list of all the meshes that have associated PVR meshes
        "loadingMilestones": {}, // Flags used to tell different steps in the loading process whether or not they can proceed. Cleaner than promises, I think.
        "milestoneAttempted": [] // Where or not a given function that will end in a milestone complete has been run at least once. To prevent milestones from running multiple times.
    }
}

export function get(key: string): any {
    /*
    Get the value of a global variable.

    :param string key: The name of the global variable.

    :returns: The value.
    :rtype: :class:`any`
    */

    return (<any>window)._proteinvrGlobals[key];
}

export function set(key: string, val: any): void {
    /*
    Set the value of a global variable.

    :param string key: The name of the global variable.

    :param string val: The value.
    */

    (<any>window)._proteinvrGlobals[key] = val;
}

export function setArrayEntry(key: string, index: number, val: any): void {
    /*
    Set an indexed value of a global array variable.

    :param string key: The name of the global variable.

    :param int index: The array index.

    :param any val: The value.
    */

    (<any>window)._proteinvrGlobals[key][index] = val;
}

(<any>window).loadingMilestones = {};
export function milestone(key: string, val: any = undefined): any {
    /*
    A function to manage a "milestone". During the load process, certain steps
    require the completion of others. A given step can be marked as completed
    using this function. The same function can return a milestone's status if
    the val parameter is not provided. So it's a getter and a setter. I
    decided on this instead of Promises or callbacks.

    :param string key: The name of the milestone.

    :param boolean val: An optional variable, true or false, whether the
                   milestone is completed.

    :returns: Can return a boolean, whether the milestone is completed, if val
              is specified. 
    :rtype: :class:`boolean`
    */

    // Better than using promises during load process, I think. Set these
    // milestones as different parts of the load process complete, and check
    // them before starting the next step.
    switch (val) {
        case undefined:
            // Getting the milestone
            let response = (<any>window)._proteinvrGlobals["loadingMilestones"][key];
            if (response === undefined) {
                response = false;
            }
            return response;
        default:
            // Setting the milestone
            (<any>window)._proteinvrGlobals["loadingMilestones"][key] = val;
            return 
    }
}

export function delayExec(func: any, milestoneNames: string[], origFuncName: string, This: any): boolean {
    /*
    Delay the execution of a function until the specified milestones are met.

    :param func func: The function to delay, if necessary.

    :param string[] milestoneNames: The names (keys) of the milestones that
                    must complete before the function will run.
    
    :param string origFuncName: The name of the function. Must be unique.

    :param any This: The this context in which the function should run.
    */

    // Check to see if you've already run this func.
    if ((<any>window)._proteinvrGlobals["milestoneAttempted"].indexOf(origFuncName) !== -1) {
        // It's already been run.
        // console.log("Function " + origFuncName + " already run...");
        return false;
    }

    // Only run this if default user vars already set.
    for (let i=0; i<milestoneNames.length; i++) {
        let milestoneName = milestoneNames[i];
        if (!milestone(milestoneName)) {
            // console.log("Can't run function " + origFuncName + ": milestone " + milestoneName + " not yet met.");
            setTimeout(() => {
                delayExec(func, milestoneNames, origFuncName, This);
            }, 250)
            return true;
        }
    }

    // If it gets here, you're ready to actually run the function.
    // console.log("Running function " + origFuncName);    

    // record that this has already been handled to avoid repeated function calls.
    (<any>window)._proteinvrGlobals["milestoneAttempted"].push(origFuncName);

    // Execute the function.
    let func2 = func.bind(This);
    func2();

    return false;
}

export enum RenderingGroups {
    VisibleObjects = 3,
    ViewerSphere = 2,
    EnvironmentalSphere = 1,
    ClickableObjects = 0
}