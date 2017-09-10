if ((<any>window)._proteinvrGlobals === undefined) {
    (<any>window)._proteinvrGlobals = {
        "scene": undefined,
        "engine": undefined,
        "canvas": undefined,
        "camera": undefined,
        "jQuery": undefined,
        "BABYLON": undefined,
        "cameraPositionsAndTextures": undefined,
        "viewerSphere": undefined,
        "backgroundSphere": undefined,
        "debug": false,
        "mouseDownAdvances": true,
        "mobileDetect": undefined,
        "numFrameTexturesLoaded": 0
    }
}

export function get(key: string) {
    // debugger;
    return (<any>window)._proteinvrGlobals[key];
}

export function set(key: string, val: any) {
    (<any>window)._proteinvrGlobals[key] = val;
}

export function setArrayEntry(key: string, index: number, val: any) {
    (<any>window)._proteinvrGlobals[key][index] = val;
}

export enum RenderingGroups {
    VisibleObjects = 3,
    ViewerSphere = 2,
    EnvironmentalSphere = 1,
    ClickableObjects = 0
}