// export namespace Core {
/**
A namespace to store key variables related to the BABYLON game engine.
Note that these are set internally. For externally set variables, see
UserVars.ts.
*/

/**
Not sure what this is.
*/
export var tmpSpheres = [];

/**
A BABYLON shadowGenerator.
*/
export var shadowGenerator;

/**
A place to store any variable.
*/
export var anyVar: any = undefined;

// Whether or not currently fullscreen.
export var fullScreen: boolean = false;

export function debugMsg(msg: string): void {
    /**
    Write a message to the console for debugging.
    
    :param str msg: The message.
    */

    if (PVRGlobals.debug === true) {
        console.log(msg);
    }
}

// }

// export default Core;
