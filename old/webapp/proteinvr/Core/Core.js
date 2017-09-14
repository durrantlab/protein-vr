// export namespace Core {
/**
A namespace to store key variables related to the BABYLON game engine.
Note that these are set internally. For externally set variables, see
UserVars.ts.
*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
    Not sure what this is.
    */
    exports.tmpSpheres = [];
    /**
    A place to store any variable.
    */
    exports.anyVar = undefined;
    // Whether or not currently fullscreen.
    exports.fullScreen = false;
    function debugMsg(msg) {
        /**
        Write a message to the console for debugging.
        
        :param str msg: The message.
        */
        if (PVRGlobals.debug === true) {
            console.log(msg);
        }
    }
    exports.debugMsg = debugMsg;
});
// }
// export default Core;
