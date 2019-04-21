define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (window._babylonGlobals === undefined) {
        window._babylonGlobals = {
            "scene": undefined,
            "engine": undefined,
            "canvas": undefined,
            "camera": undefined,
            "jQuery": undefined,
            "BABYLON": undefined
        };
    }
    function get(key) {
        // debugger;
        return window._babylonGlobals[key];
    }
    exports.get = get;
    function set(key, val) {
        window._babylonGlobals[key] = val;
    }
    exports.set = set;
});
