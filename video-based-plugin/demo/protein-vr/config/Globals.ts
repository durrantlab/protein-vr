// I'm sure there's a more elegant making a global-variable storage area that
// doesn't pollute the global name space, but I'm going with this for now...

if ((<any>window)._proteinvrGlobals === undefined) {
    (<any>window)._proteinvrGlobals = {
        "scene": undefined,
        "engine": undefined,
        "canvas": undefined,
        "camera": undefined,
        "jQuery": undefined,
        "BABYLON": undefined,
        "viewerSphereTemplate": undefined,
        "cameraPositions": undefined,
        "viewerSpheres": undefined,
        "sphereMaterials": undefined,
        "backgroundSphere": undefined,
        "debug": false,
        "breakCaching": true,  // add ?random strings to end of png textures, so doesn't cache.
        "mouseDownAdvances": true,
        "isMobile": undefined,
        "numFrameTexturesLoaded": 0,
        "numNeighboringCameraPosForNavigation": 4,
        "cameraTypeToUse": "show-desktop-screen",  // default
        "signData": [],
        "lazyLoadViewerSpheres": true
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