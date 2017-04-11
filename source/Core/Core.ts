namespace Core {
    /**
    A namespace to store key variables related to the BABYLON game engine.
    */

    /**
    The BABYLON engine.
    */
    export var engine: any;

    /**
    The BABYLON scene.
    */
    export var scene: any;

    /**
    The canvas where the 3D graphics are being rendered.
    */
    export var canvas: any;

    /**
    Not sure what this is.
    */
    export var tmpSpheres = [];

    /**
    A BABYLON shadowGenerator.
    */
    export var shadowGenerator;

    /**
    Whether or not to run the current app in debug mode.
    */
    export var debug: boolean = false;

    /**
    A JSON object that maps a mesh name to the mesh object.
    */
    export var meshesByName = {};

    /**
    A place to store any variable.
    */
    export var anyVar: any = undefined;

    /**
    The current frame number.
    */
    export var frameNum: number = 0;

    /**
    File location of the sene resources
    */
    export var sceneDirectory: string = "";

    // higher means more simple.
    export var textureSimplificationLevel: number = 0;

    export function debugMsg(msg: string): void {
        /**
        Write a message to the console for debugging.
        
        :param str msg: The message.
        */

        if (Core.debug === true) {
            console.log(msg);
        }
    }
}

export default Core;
