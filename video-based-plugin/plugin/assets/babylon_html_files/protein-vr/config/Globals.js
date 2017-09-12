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
            "viewerSphereTemplate": undefined,
            "cameraPositions": undefined,
            "viewerSpheres": undefined,
            "sphereShaders": undefined,
            "backgroundSphere": undefined,
            "debug": false,
            "mouseDownAdvances": true,
            "mobileDetect": undefined,
            "numFrameTexturesLoaded": 0,
            "numNeighboringCameraPosForNavigation": 4
        };
    }
    function get(key) {
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
    var RenderingGroups;
    (function (RenderingGroups) {
        RenderingGroups[RenderingGroups["VisibleObjects"] = 3] = "VisibleObjects";
        RenderingGroups[RenderingGroups["ViewerSphere"] = 2] = "ViewerSphere";
        RenderingGroups[RenderingGroups["EnvironmentalSphere"] = 1] = "EnvironmentalSphere";
        RenderingGroups[RenderingGroups["ClickableObjects"] = 0] = "ClickableObjects";
    })(RenderingGroups = exports.RenderingGroups || (exports.RenderingGroups = {}));
});
