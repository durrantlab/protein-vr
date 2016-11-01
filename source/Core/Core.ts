namespace Core {
    // Save key variables related to the BABYLON game engine.
    export var engine: any;
    export var scene: any;
    export var canvas: any;
    export var tmpSpheres = [];
    export var shadowGenerator;
    export var debug: boolean = false;
    export var meshesByName = {};
    export var anyVar: any = undefined;  // Just a place to storev  any variable
    export var frameNum: number = 0;

    export function debugMsg(msg: string) {
        if (Core.debug === true) {
            console.log(msg);
        }
    }

}

export default Core;