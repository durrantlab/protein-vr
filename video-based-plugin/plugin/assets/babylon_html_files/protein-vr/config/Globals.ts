// I'm sure there's a more elegant making a global-variable storage area that
// doesn't pollute the global name space, but I'm going with this for now...

if ((<any>window)._proteinvrGlobals === undefined) {
    (<any>window)._proteinvrGlobals = {
        "scene": undefined,  // BABYLON.scene object.
        "engine": undefined,  // BABYLON.engine object
        "canvas": undefined,  // The canvas where the scene is rendered (from DOM)
        "camera": undefined,  // BABYLON.camera object.
        "jQuery": undefined,  // The jQuery library.
        "BABYLON": undefined,  // The BABYLON library
        "viewerSphereTemplate": undefined,  // The initial viewsphere BABYLON mesh that all others inherit.
        "cameraPositions": undefined,  // Valid camera positions, pulled from data.json (PVRJsonSetup.ts)
        "animationData": undefined,  // Stores animation data. Keys are mesh names, lists of [x, y, z, rotx, roty, rotz] as values.
        "firstFrameIndex": undefined,  // The index of the first animation frame.
        "lastFrameIndex": undefined,
        "viewerSpheres": undefined,  // The BABYLON.mesh viewerspheres (derived from the template above)
        "sphereMaterials": undefined,  // The materials associated with each viewer sphere.
        "backgroundSphere": undefined,  // The background sphere (sky box)
        "debug": false,  // Whether or not to run in debug mode.
        "breakCaching": true,  // add ?random strings to end of png textures, so doesn't cache.
        "mouseDownAdvances": true,  // Whether or not clicking the mouse advances your position.
        "isMobile": undefined,  // Mobile device?
        "numFrameTexturesLoaded": 0,  // The total number offrames loaded (from data.json?)
        "numNeighboringCameraPosForNavigation": 4,  // Max number of navigation arrows
        "cameraTypeToUse": "show-desktop-screen",  // Camera type (VR headsert vs. screen, etc.)
        "signData": [],  // Data about signs. Work in progress.
        "lazyLoadViewerSpheres": true,  // Whether or not to lazy load textures/materials.
        "meshesWithAnimations": []  // A list of all the meshes that have associated PVR meshes
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

export enum RenderingGroups {
    VisibleObjects = 3,
    ViewerSphere = 2,
    EnvironmentalSphere = 1,
    ClickableObjects = 0
}