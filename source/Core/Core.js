define(["require", "exports"], function (require, exports) {
    "use strict";
    var Core;
    (function (Core) {
        Core.tmpSpheres = [];
        Core.debug = false;
        Core.meshesByName = {};
        Core.anyVar = undefined; // Just a place to storev  any variable
        Core.frameNum = 0;
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
