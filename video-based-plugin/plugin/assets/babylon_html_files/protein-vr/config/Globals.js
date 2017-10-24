// I'm sure there's a more elegant making a global-variable storage area that
// doesn't pollute the global name space, but I'm going with this for now...
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
            "animationData": undefined,
            "firstFrameIndex": undefined,
            "viewerSpheres": undefined,
            "sphereMaterials": undefined,
            "backgroundSphere": undefined,
            "debug": false,
            "breakCaching": true,
            "mouseDownAdvances": true,
            "isMobile": undefined,
            "numFrameTexturesLoaded": 0,
            "numNeighboringCameraPosForNavigation": 4,
            "cameraTypeToUse": "show-desktop-screen",
            "signData": [],
            "lazyLoadViewerSpheres": true,
            "meshesWithAnimations": [] // A list of all the meshes that have associated PVR meshes
        };
    }
    function get(key) {
        /*
        Get the value of a global variable.
    
        :param string key: The name of the global variable.
    
        :returns: The value.
        :rtype: :class:`any`
        */
        return window._proteinvrGlobals[key];
    }
    exports.get = get;
    function set(key, val) {
        /*
        Set the value of a global variable.
    
        :param string key: The name of the global variable.
    
        :param string val: The value.
        */
        window._proteinvrGlobals[key] = val;
    }
    exports.set = set;
    function setArrayEntry(key, index, val) {
        /*
        Set an indexed value of a global array variable.
    
        :param string key: The name of the global variable.
    
        :param int index: The array index.
    
        :param any val: The value.
        */
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
