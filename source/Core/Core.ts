/**
 * A namespace to store key variables related to the BABYLON game engine.
 */
namespace Core {
    export var engine: any;
    export var scene: any;
    export var canvas: any;
    export var tmpSpheres = [];
    export var shadowGenerator;
    export var debug: boolean = false;
    export var meshesByName = {};
    export var anyVar: any = undefined;  // Just a place to store any variable
    export var frameNum: number = 0;

    /**
     * Write a message to the console for debugging.
     * @param {string} msg The message.
     */
    export function debugMsg(msg: string): void {
        if (Core.debug === true) {
            console.log(msg);
        }
    }
}

export default Core;
