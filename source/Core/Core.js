define(["require", "exports"], function (require, exports) {
    "use strict";
    /**
     * A namespace to store key variables related to the BABYLON game engine.
     */
    var Core;
    (function (Core) {
        /**
         * Not sure what this is.
         */
        Core.tmpSpheres = [];
        /**
         * Whether or not to run the current app in debug mode.
         */
        Core.debug = false;
        /**
         * A JSON object that maps a mesh name to the mesh object.
         */
        Core.meshesByName = {};
        /**
         * A place to store any variable.
         */
        Core.anyVar = undefined;
        /**
         * The current frame number.
         */
        Core.frameNum = 0;
        /**
         * Write a message to the console for debugging.
         * @param {string} msg The message.
         */
        function debugMsg(msg) {
            if (Core.debug === true) {
                console.log(msg);
            }
        }
        Core.debugMsg = debugMsg;
    })(Core || (Core = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Core;
});
