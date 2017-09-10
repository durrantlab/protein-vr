define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    if (window._proteinvrGlobals === undefined) {
        window._proteinvrGlobals = {
            "scene": undefined,
            "engine": undefined,
            "canvas": undefined,
            "camera": undefined,
            "jQuery": undefined,
            "BABYLON": undefined,
            "cameraPositionsAndTextures": undefined,
            "viewerSphere": undefined,
            "debug": false,
            "mouseDownAdvances": true,
            "mobileDetect": undefined,
            "numFrameTexturesLoaded": 0
        };
    }
    function get(key) {
        // debugger;
        return window._proteinvrGlobals[key];
    }
    exports.get = get;
    function set(key, val) {
        window._proteinvrGlobals[key] = val;
    }
    exports.set = set;
    function setArrayEntry(key, index, val) {
        window._proteinvrGlobals[key][index] = val;
    }
    exports.setArrayEntry = setArrayEntry;
});
