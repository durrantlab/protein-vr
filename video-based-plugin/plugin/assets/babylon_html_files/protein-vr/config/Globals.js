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
            // "camera": undefined,  // BABYLON.camera object.
            "jQuery": undefined,
            "BABYLON": undefined,
            "viewerSphereTemplate": undefined,
            // "cameraPositions": undefined,  // Valid camera positions, pulled from data.json (PVRJsonSetup.ts)
            "animationData": undefined,
            "firstFrameIndex": undefined,
            "lastFrameIndex": undefined,
            // "viewerSpheres": undefined,  // A Spheres.SphereCollection.SphereCollection object.
            // "sphereMaterials": undefined,  // The materials associated with each viewer sphere.
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
            "lazyLoadCount": 16,
            "meshesWithAnimations": [],
            "loadingMilestones": {},
            "milestoneAttempted": [] // Where or not a given function that will end in a milestone complete has been run at least once. To prevent milestones from running multiple times.
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
    window.loadingMilestones = {};
    function milestone(key, val = undefined) {
        /*
        A function to manage a "milestone". During the load process, certain steps
        require the completion of others. A given step can be marked as completed
        using this function. The same function can return a milestone's status if
        the val parameter is not provided. So it's a getter and a setter. I
        decided on this instead of Promises or callbacks.
    
        :param string key: The name of the milestone.
    
        :param boolean val: An optional variable, true or false, whether the
                       milestone is completed.
    
        :returns: Can return a boolean, whether the milestone is completed, if val
                  is specified.
        :rtype: :class:`boolean`
        */
        // Better than using promises during load process, I think. Set these
        // milestones as different parts of the load process complete, and check
        // them before starting the next step.
        switch (val) {
            case undefined:
                // Getting the milestone
                let response = window._proteinvrGlobals["loadingMilestones"][key];
                if (response === undefined) {
                    response = false;
                }
                return response;
            default:
                // Setting the milestone
                window._proteinvrGlobals["loadingMilestones"][key] = val;
                return;
        }
    }
    exports.milestone = milestone;
    function delayExec(func, milestoneNames, origFuncName, This) {
        /*
        Delay the execution of a function until the specified milestones are met.
    
        :param func func: The function to delay, if necessary.
    
        :param string[] milestoneNames: The names (keys) of the milestones that
                        must complete before the function will run.
        
        :param string origFuncName: The name of the function. Must be unique.
    
        :param any This: The this context in which the function should run.
        */
        // Check to see if you've already run this func.
        if (window._proteinvrGlobals["milestoneAttempted"].indexOf(origFuncName) !== -1) {
            // It's already been run.
            // console.log("Function " + origFuncName + " already run...");
            return false;
        }
        // Only run this if default user vars already set.
        for (let i = 0; i < milestoneNames.length; i++) {
            let milestoneName = milestoneNames[i];
            if (!milestone(milestoneName)) {
                console.log("Can't run function " + origFuncName + ": milestone " + milestoneName + " not yet met.");
                setTimeout(() => {
                    delayExec(func, milestoneNames, origFuncName, This);
                }, 250);
                return true;
            }
        }
        // If it gets here, you're ready to actually run the function.
        console.log("Running function " + origFuncName);
        // record that this has already been handled to avoid repeated function calls.
        window._proteinvrGlobals["milestoneAttempted"].push(origFuncName);
        // Execute the function.
        let func2 = func.bind(This);
        func2();
        return false;
    }
    exports.delayExec = delayExec;
    var RenderingGroups;
    (function (RenderingGroups) {
        RenderingGroups[RenderingGroups["VisibleObjects"] = 3] = "VisibleObjects";
        RenderingGroups[RenderingGroups["ViewerSphere"] = 2] = "ViewerSphere";
        RenderingGroups[RenderingGroups["EnvironmentalSphere"] = 1] = "EnvironmentalSphere";
        RenderingGroups[RenderingGroups["ClickableObjects"] = 0] = "ClickableObjects";
    })(RenderingGroups = exports.RenderingGroups || (exports.RenderingGroups = {}));
});
