define(["require", "exports"], function (require, exports) {
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
            "breakCaching": true,
            "mouseDownAdvances": true,
            "isMobile": undefined,
            "numFrameTexturesLoaded": 0,
            "numNeighboringCameraPosForNavigation": 4,
            "cameraTypeToUse": "show-desktop-screen",
            "signData": []
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
    (function (RenderingGroups) {
        RenderingGroups[RenderingGroups["VisibleObjects"] = 3] = "VisibleObjects";
        RenderingGroups[RenderingGroups["ViewerSphere"] = 2] = "ViewerSphere";
        RenderingGroups[RenderingGroups["EnvironmentalSphere"] = 1] = "EnvironmentalSphere";
        RenderingGroups[RenderingGroups["ClickableObjects"] = 0] = "ClickableObjects";
    })(exports.RenderingGroups || (exports.RenderingGroups = {}));
    var RenderingGroups = exports.RenderingGroups;
});
