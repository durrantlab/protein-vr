(function () {
/**
 * @license almond 0.3.3 Copyright jQuery Foundation and other contributors.
 * Released under MIT license, http://github.com/requirejs/almond/LICENSE
 */
//Going sloppy to avoid 'use strict' string cost, but strict practices should
//be followed.
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {
    var main, req, makeMap, handlers,
        defined = {},
        waiting = {},
        config = {},
        defining = {},
        hasOwn = Object.prototype.hasOwnProperty,
        aps = [].slice,
        jsSuffixRegExp = /\.js$/;

    function hasProp(obj, prop) {
        return hasOwn.call(obj, prop);
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        var nameParts, nameSegment, mapValue, foundMap, lastIndex,
            foundI, foundStarMap, starI, i, j, part, normalizedBaseParts,
            baseParts = baseName && baseName.split("/"),
            map = config.map,
            starMap = (map && map['*']) || {};

        //Adjust any relative paths.
        if (name) {
            name = name.split('/');
            lastIndex = name.length - 1;

            // If wanting node ID compatibility, strip .js from end
            // of IDs. Have to do this here, and not in nameToUrl
            // because node allows either .js or non .js to map
            // to same file.
            if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
                name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
            }

            // Starts with a '.' so need the baseName
            if (name[0].charAt(0) === '.' && baseParts) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that 'directory' and not name of the baseName's
                //module. For instance, baseName of 'one/two/three', maps to
                //'one/two/three.js', but we want the directory, 'one/two' for
                //this normalization.
                normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
                name = normalizedBaseParts.concat(name);
            }

            //start trimDots
            for (i = 0; i < name.length; i++) {
                part = name[i];
                if (part === '.') {
                    name.splice(i, 1);
                    i -= 1;
                } else if (part === '..') {
                    // If at the start, or previous value is still ..,
                    // keep them so that when converted to a path it may
                    // still work when converted to a path, even though
                    // as an ID it is less than ideal. In larger point
                    // releases, may be better to just kick out an error.
                    if (i === 0 || (i === 1 && name[2] === '..') || name[i - 1] === '..') {
                        continue;
                    } else if (i > 0) {
                        name.splice(i - 1, 2);
                        i -= 2;
                    }
                }
            }
            //end trimDots

            name = name.join('/');
        }

        //Apply map config if available.
        if ((baseParts || starMap) && map) {
            nameParts = name.split('/');

            for (i = nameParts.length; i > 0; i -= 1) {
                nameSegment = nameParts.slice(0, i).join("/");

                if (baseParts) {
                    //Find the longest baseName segment match in the config.
                    //So, do joins on the biggest to smallest lengths of baseParts.
                    for (j = baseParts.length; j > 0; j -= 1) {
                        mapValue = map[baseParts.slice(0, j).join('/')];

                        //baseName segment has  config, find if it has one for
                        //this name.
                        if (mapValue) {
                            mapValue = mapValue[nameSegment];
                            if (mapValue) {
                                //Match, update name to the new value.
                                foundMap = mapValue;
                                foundI = i;
                                break;
                            }
                        }
                    }
                }

                if (foundMap) {
                    break;
                }

                //Check for a star map match, but just hold on to it,
                //if there is a shorter segment match later in a matching
                //config, then favor over this star map.
                if (!foundStarMap && starMap && starMap[nameSegment]) {
                    foundStarMap = starMap[nameSegment];
                    starI = i;
                }
            }

            if (!foundMap && foundStarMap) {
                foundMap = foundStarMap;
                foundI = starI;
            }

            if (foundMap) {
                nameParts.splice(0, foundI, foundMap);
                name = nameParts.join('/');
            }
        }

        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            var args = aps.call(arguments, 0);

            //If first arg is not require('string'), and there is only
            //one arg, it is the array form without a callback. Insert
            //a null so that the following concat is correct.
            if (typeof args[0] !== 'string' && args.length === 1) {
                args.push(null);
            }
            return req.apply(undef, args.concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (hasProp(waiting, name)) {
            var args = waiting[name];
            delete waiting[name];
            defining[name] = true;
            main.apply(undef, args);
        }

        if (!hasProp(defined, name) && !hasProp(defining, name)) {
            throw new Error('No ' + name);
        }
        return defined[name];
    }

    //Turns a plugin!resource to [plugin, resource]
    //with the plugin being undefined if the name
    //did not have a plugin prefix.
    function splitPrefix(name) {
        var prefix,
            index = name ? name.indexOf('!') : -1;
        if (index > -1) {
            prefix = name.substring(0, index);
            name = name.substring(index + 1, name.length);
        }
        return [prefix, name];
    }

    //Creates a parts array for a relName where first part is plugin ID,
    //second part is resource ID. Assumes relName has already been normalized.
    function makeRelParts(relName) {
        return relName ? splitPrefix(relName) : [];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    makeMap = function (name, relParts) {
        var plugin,
            parts = splitPrefix(name),
            prefix = parts[0],
            relResourceName = relParts[1];

        name = parts[1];

        if (prefix) {
            prefix = normalize(prefix, relResourceName);
            plugin = callDep(prefix);
        }

        //Normalize according
        if (prefix) {
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relResourceName));
            } else {
                name = normalize(name, relResourceName);
            }
        } else {
            name = normalize(name, relResourceName);
            parts = splitPrefix(name);
            prefix = parts[0];
            name = parts[1];
            if (prefix) {
                plugin = callDep(prefix);
            }
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            pr: prefix,
            p: plugin
        };
    };

    function makeConfig(name) {
        return function () {
            return (config && config.config && config.config[name]) || {};
        };
    }

    handlers = {
        require: function (name) {
            return makeRequire(name);
        },
        exports: function (name) {
            var e = defined[name];
            if (typeof e !== 'undefined') {
                return e;
            } else {
                return (defined[name] = {});
            }
        },
        module: function (name) {
            return {
                id: name,
                uri: '',
                exports: defined[name],
                config: makeConfig(name)
            };
        }
    };

    main = function (name, deps, callback, relName) {
        var cjsModule, depName, ret, map, i, relParts,
            args = [],
            callbackType = typeof callback,
            usingExports;

        //Use name if no relName
        relName = relName || name;
        relParts = makeRelParts(relName);

        //Call the callback to define the module, if necessary.
        if (callbackType === 'undefined' || callbackType === 'function') {
            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            //Default to [require, exports, module] if no deps
            deps = !deps.length && callback.length ? ['require', 'exports', 'module'] : deps;
            for (i = 0; i < deps.length; i += 1) {
                map = makeMap(deps[i], relParts);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = handlers.require(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = handlers.exports(name);
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = handlers.module(name);
                } else if (hasProp(defined, depName) ||
                           hasProp(waiting, depName) ||
                           hasProp(defining, depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw new Error(name + ' missing ' + depName);
                }
            }

            ret = callback ? callback.apply(defined[name], args) : undefined;

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef &&
                        cjsModule.exports !== defined[name]) {
                    defined[name] = cjsModule.exports;
                } else if (ret !== undef || !usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = require = req = function (deps, callback, relName, forceSync, alt) {
        if (typeof deps === "string") {
            if (handlers[deps]) {
                //callback in this case is really relName
                return handlers[deps](callback);
            }
            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, makeRelParts(callback)).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            config = deps;
            if (config.deps) {
                req(config.deps, config.callback);
            }
            if (!callback) {
                return;
            }

            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = relName;
                relName = null;
            } else {
                deps = undef;
            }
        }

        //Support require(['a'])
        callback = callback || function () {};

        //If relName is a function, it is an errback handler,
        //so remove it.
        if (typeof relName === 'function') {
            relName = forceSync;
            forceSync = alt;
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            //Using a non-zero value because of concern for what old browsers
            //do, and latest browsers "upgrade" to 4 if lower value is used:
            //http://www.whatwg.org/specs/web-apps/current-work/multipage/timers.html#dom-windowtimers-settimeout:
            //If want a value immediately, use require('id') instead -- something
            //that works in almond on the global level, but not guaranteed and
            //unlikely to work in other AMD implementations.
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 4);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function (cfg) {
        return req(cfg);
    };

    /**
     * Expose module registry for debugging and tooling
     */
    requirejs._defined = defined;

    define = function (name, deps, callback) {
        if (typeof name !== 'string') {
            throw new Error('See almond README: incorrect module build, no module name');
        }

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (!hasProp(defined, name) && !hasProp(waiting, name)) {
            waiting[name] = [name, deps, callback];
        }
    };

    define.amd = {
        jQuery: true
    };
}());

define("almond", function(){});

// I'm sure there's a more elegant making a global-variable storage area that
// doesn't pollute the global name space, but I'm going with this for now...
define('../config/Globals',["require", "exports"], function (require, exports) {
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
            "pngFileSizes": undefined,
            "nextMoves": undefined,
            "uniqID": undefined,
            // "triggers": undefined,
            // "viewerSpheres": undefined,  // A Spheres.SphereCollection.SphereCollection object.
            // "sphereMaterials": undefined,  // The materials associated with each viewer sphere.
            "skyboxSphere": undefined,
            // "destinationNeighborSphere": undefined, // sphere that shows where used is looking (for some kinds of navigation)
            "debug": false,
            "breakCaching": true,
            "mouseDownAdvances": true,
            "isMobile": undefined,
            "numFrameTexturesLoaded": 0,
            "numNeighboringCameraPosForNavigation": 4,
            "cameraTypeToUse": "show-desktop-screen",
            "signData": [],
            "lazyLoadViewerSpheres": true,
            "lazyLoadCount": 20,
            // "lazyLoadedSpheres": [], // An array which will contain all spheres which have had their assets loaded, used for removing unwanted assets from memory
            "meshesWithAnimations": [],
            "loadingMilestones": {},
            "milestoneAttempted": [],
            "cameraInitialAngle": [] // The initial camera angle. Useful for some cameras.
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
                // console.log("Can't run function " + origFuncName + ": milestone " + milestoneName + " not yet met.");
                setTimeout(() => {
                    delayExec(func, milestoneNames, origFuncName, This);
                }, 250);
                return true;
            }
        }
        // If it gets here, you're ready to actually run the function.
        // console.log("Running function " + origFuncName);    
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

define('../Utils',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Modified: https://stackoverflow.com/questions/979975/how-to-get-the-value-from-the-get-parameters
    function userParam(name, url = undefined) {
        if (url === undefined)
            url = location.href;
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(url);
        return results == null ? null : results[1];
    }
    exports.userParam = userParam;
});

/**
 * Module to create/store/maintain system variables
 */
define('../config/UserVars',["require", "exports", "./Globals", "../Utils"], function (require, exports, Globals, Utils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Setting up user parameters
    let mobileDefaults;
    let laptopDefaults;
    let desktopDefaults;
    exports.paramDefaults = {
        "mobile": {},
        "laptop": {},
        "desktop": {}
    };
    exports.paramNames = {};
    var audios;
    (function (audios) {
        audios[audios["Speakers"] = 0] = "Speakers";
        audios[audios["Headphones"] = 1] = "Headphones";
        audios[audios["None"] = 2] = "None";
    })(audios = exports.audios || (exports.audios = {}));
    exports.paramNames["audio"] = ["Speakers", "Headphones", "None"];
    exports.paramDefaults["mobile"]["audio"] = audios["Headphones"];
    exports.paramDefaults["laptop"]["audio"] = audios["Speakers"];
    exports.paramDefaults["desktop"]["audio"] = audios["Speakers"];
    var viewers;
    (function (viewers) {
        viewers[viewers["Screen"] = 0] = "Screen";
        viewers[viewers["VRHeadset"] = 1] = "VRHeadset";
    })(viewers = exports.viewers || (exports.viewers = {}));
    exports.paramNames["viewer"] = ["Screen", "VR Headset"];
    exports.paramDefaults["mobile"]["viewer"] = viewers["Screen"];
    exports.paramDefaults["laptop"]["viewer"] = viewers["Screen"];
    exports.paramDefaults["desktop"]["viewer"] = viewers["Screen"];
    var devices;
    (function (devices) {
        devices[devices["Mobile"] = 0] = "Mobile";
        devices[devices["Laptop"] = 1] = "Laptop";
        devices[devices["Desktop"] = 2] = "Desktop";
    })(devices = exports.devices || (exports.devices = {}));
    exports.paramNames["device"] = ["Mobile", "Laptop", "Desktop"];
    exports.paramDefaults["mobile"]["device"] = devices["Mobile"];
    exports.paramDefaults["laptop"]["device"] = devices["Laptop"];
    exports.paramDefaults["desktop"]["device"] = devices["Desktop"];
    // export enum textures {
    //     Sharp,  // no modification
    //     Medium,  // 512
    //     Grainy  // 256
    // }
    // paramNames["textures"] = ["Sharp", "Medium", "Grainy"];
    // paramDefaults["mobile"]["textures"] = textures["Medium"];
    // paramDefaults["laptop"]["textures"] = textures["Sharp"];
    // paramDefaults["desktop"]["textures"] = textures["Sharp"];
    // export enum fog {
    //     Clear,
    //     Thin,
    //     Thick
    // }
    // paramNames["fog"] = ["Clear", "Thin", "Thick"];
    // paramDefaults["mobile"]["fog"] = fog["Clear"];
    // paramDefaults["laptop"]["fog"] = fog["Thin"];
    // paramDefaults["desktop"]["fog"] = fog["Thick"];
    // export enum objects {  // actually LOD settings
    //     Detailed,
    //     Normal,
    //     Simple
    // }
    // paramNames["objects"] = ["Detailed", "Normal", "Simple"];
    // paramDefaults["mobile"]["objects"] = objects["Normal"];
    // paramDefaults["laptop"]["objects"] = objects["Detailed"];
    // paramDefaults["desktop"]["objects"] = objects["Detailed"];
    // export enum displays {
    //     FullScreen,
    //     Windowed
    // }
    // paramNames["display"] = ["Full Screen", "Windowed"];
    // paramDefaults["mobile"]["display"] = displays["FullScreen"];
    // paramDefaults["laptop"]["display"] = displays["FullScreen"];
    // paramDefaults["desktop"]["display"] = displays["FullScreen"];
    // export enum moving {
    //     Advance,
    //     Jump,
    //     Teleport
    // }
    // paramNames["moving"] = ["Advance", "Jump", "Teleport"];
    // paramDefaults["mobile"]["moving"] = moving["Advance"];
    // paramDefaults["laptop"]["moving"] = moving["Advance"];
    // paramDefaults["desktop"]["moving"] = moving["Advance"];
    // export enum looking {
    //     MouseMove,
    //     Click
    // }
    // paramNames["looking"] = ["Mouse Move", "Click"];
    // paramDefaults["mobile"]["looking"] = looking["Click"];
    // paramDefaults["laptop"]["looking"] = looking["MouseMove"];
    // paramDefaults["desktop"]["looking"] = looking["MouseMove"];
    // export enum animations {
    //     Moving,
    //     Fixed
    // }
    // paramNames["animations"] = ["Moving", "Fixed"];
    // paramDefaults["mobile"]["animations"] = animations["Fixed"];
    // paramDefaults["laptop"]["animations"] = animations["Moving"];
    // paramDefaults["desktop"]["animations"] = animations["Moving"];
    /**
     * This function will assign values to the system variables based on user input.
     */
    function setupDefaults() {
        /*
        Setup the user variables (defaults and any in local storage).
        */
        // Default values before anything. For now just use laptop defaults,
        // but in future would be good to detect device...
        var userVars;
        let isMobile = Globals.get("isMobile");
        if (isMobile) {
            userVars = exports.paramDefaults["mobile"];
        }
        else {
            userVars = exports.paramDefaults["laptop"];
        }
        // Here you overwrite with values from params.json. At this point,
        // this is just the proteinvr scene to use.
        let keys = Object.keys(userVars);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let val = stringToEnumVal(userVars[key]);
            userVars[key] = val;
        }
        // Now overwrite with copies from localstorage if you've got them.
        let localStorageParams = getLocalStorageParams();
        keys = Object.keys(localStorageParams);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (["scenePath"].indexOf(key) === -1) {
                let val = stringToEnumVal(localStorageParams[key]);
                userVars[key] = val;
            }
        }
        // Finally, what's in the url overwrites EVERYTHING
        let urlViewer = Utils.userParam("viewer");
        if (urlViewer !== null) {
            switch (urlViewer) {
                case "screen":
                    userVars["viewer"] = viewers["Screen"];
                    break;
                case "vrheadset":
                    userVars["viewer"] = viewers["VRHeadset"];
                    break;
            }
        }
        // Save to local storage what you've got so far.
        saveLocalStorageParams(userVars);
        Globals.milestone("DefaultUserVarsSet", true);
    }
    exports.setupDefaults = setupDefaults;
    function getLocalStorageParams() {
        /*
        Gets the user variables from local storage.
    
        :returns: The user variables, as a JSON object.
        :rtype: :class:`string`
        */
        // Get params from local storage
        let localStorageParamsStr = localStorage.getItem("proteinvr_params");
        let localStorageParams;
        if (localStorageParamsStr !== null) {
            localStorageParams = Globals.get("jQuery").parseJSON(localStorageParamsStr);
        }
        else {
            localStorageParams = {};
        }
        return localStorageParams;
    }
    exports.getLocalStorageParams = getLocalStorageParams;
    function getParam(key) {
        /*
        Gets the value of a user variable in local storage.
    
        :param string key: The name of the variable.
    
        :returns: The value of the variable.
        :rtype: :class:`any`
        */
        let localStorageParams = getLocalStorageParams();
        return localStorageParams[key];
    }
    exports.getParam = getParam;
    function saveLocalStorageParams(params) {
        /*
        Sets user-defined variables in local storage.
    
        :param obj params: A JSON object containing the user variables.
        */
        // let paramsToSave = jQuery.parseJSON(JSON.stringify(params));  // This makes a copy
        // delete paramsToSave["scenePath"];  // Don't save this one.
        // localStorage.setItem("proteinvr_params", JSON.stringify(paramsToSave));    
        localStorage.setItem("proteinvr_params", JSON.stringify(params));
    }
    exports.saveLocalStorageParams = saveLocalStorageParams;
    function updateLocalStorageParams(paramName, value) {
        /*
        Update a user variable in local storage.
    
        :param string praamName: The name of the user variable.
    
        :param any value: The new value of the variable.
        */
        // Get params from local storage
        let localStorageParams = getLocalStorageParams();
        // Update those params
        localStorageParams[paramName] = value;
        // Save the params
        saveLocalStorageParams(localStorageParams);
    }
    exports.updateLocalStorageParams = updateLocalStorageParams;
    // Convert strings to enums. A helper function.
    function stringToEnumVal(s) {
        /*
        Map a enum name to its value. Isn't this built into typescript?
    
        :param string s: The enum name.
    
        :returns: The enum value.
        :rtype: :class:`string`
        */
        if (typeof (s) === "string") {
            s = s.toLowerCase().replace(/ /g, '');
        }
        // see http://stackoverflow.com/questions/684672/how-do-i-loop-through-or-enumerate-a-javascript-object
        for (var key in exports.paramNames) {
            if (exports.paramNames.hasOwnProperty(key)) {
                let paramNamesOptions = exports.paramNames[key];
                let newParamNamesOptions = [];
                for (let p = 0; p < paramNamesOptions.length; p++) {
                    newParamNamesOptions.push(paramNamesOptions[p].toLowerCase().replace(/ /g, ''));
                }
                let loc = newParamNamesOptions.indexOf(s);
                if (loc !== -1) {
                    return loc;
                }
            }
        }
        return s;
    }
    exports.stringToEnumVal = stringToEnumVal;
});

define('../config/SettingsPanel',["require", "exports", "./UserVars", "./Globals", "../Utils"], function (require, exports, UserVars, Globals, Utils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function allowUserToModifySettings() {
        /*
        Setup and show the settings panel.
        */
        if (Globals.delayExec(allowUserToModifySettings, ["DefaultUserVarsSet"], "allowUserToModifySettings", this)) {
            return;
        }
        let jQuery = Globals.get("jQuery");
        // Check if the viewer is specified in the url (to auto advance)
        let viewer = Utils.userParam("viewer");
        // Add div to contain all settings.
        if (viewer !== null) {
            jQuery("body").css("visibility", "hidden");
        }
        jQuery("body").append(`<div id="settings_panel"></div>`);
        let settingsPanel = jQuery("#settings_panel");
        // Make the settings panel fluid using bootstrap class
        settingsPanel.addClass("container-fluid");
        // Create the panel html
        let html = panel('ProteinVR 1.0', `<div id="hardware-msg" class="alert alert-info">
            Select your hardware setup:
        </div>` +
            panel("Hardware", 
            //row_even_split(
            // [3,4,5],
            radioBoxes("Viewer", UserVars.paramNames["viewer"], ['<i class="icon-imac"></i>', '<i class="icon-glassesalt"></i>']
            // [85, 115]
            )
            /* radioBoxes(
                "Audio",
                UserVars.paramNames["audio"],
                ['<i class="icon-speaker"></i>', '<i class="icon-headphones"></i>', '<span class="glyphicon glyphicon-volume-off" aria-hidden=true></span>']
                // [100, 120, 75]
            )*/
            /*) +
            row_even_split(
                radioBoxes(
                    "Device",
                    UserVars.paramNames["device"],
                    ['<i class="icon-iphone"></i>', '<i class="icon-laptop"></i>', '<i class="icon-connectedpc"></i>']
                    // [100, 100, 100]
                ), "" */ /*,
            radioBoxes(
                "Moving",
                UserVars.paramNames["moving"],
                ['<i class="icon-upright"></i>', '<i class="icon-manalt"></i>', '<i class="icon-lightning"></i>'] //, '<i class="icon-connectedpc"></i>']
                // [100, 100, 100]
            )  + radioBoxes(  // commented out because of simplified UI
                "Looking",
                UserVars.paramNames["looking"],
                ['<i class="icon-mouse"></i>', '<i class="icon-hand-up"></i>'] //, '<i class="icon-connectedpc"></i>']
                // [100, 100, 100]
            ) */ /*,
        )*/
            ) /* +
        panelCollapsible(
            "Initial Performance Settings",
            `<div id="settings-msg" class="alert alert-info">
                Initial performance settings. ProteinVR will adjust in game to maintain 30 frames per second.
            </div>` +
            row_thirds_split(
                [4, 4, 4],
                radioBoxes(
                    "Textures",
                    UserVars.paramNames["textures"],
                    // [70, 85, 80]
                ),
                radioBoxes(
                    "Objects",
                    UserVars.paramNames["objects"],
                    // [90, 85, 85]
                ),
                radioBoxes(
                    "Fog",
                    UserVars.paramNames["fog"],
                    // [60, 55, 55]
                )
            ) +
            row_thirds_split(
                [4, 4, 4],
                radioBoxes(
                    "Display",
                    UserVars.paramNames["display"],
                    // [70, 85, 80]
                ),
                radioBoxes(
                    "Animations",
                    UserVars.paramNames["animations"],
                    // [70, 85, 80]
                ),
                ""
            )
        ) */
            +
                `<button id="user_settings_continue_button" type="button" class="btn btn-primary">Continue</button>`
        // <button id="broadcast_game_button" style="display: none;" type="button" class="btn btn-primary">Broadcast</button>`
        );
        // Add that HTML to the DOM.
        settingsPanel.html(html);
        // ???
        addJavaScript(() => {
            Globals.milestone("UserSettingsSpecifiedDialogClosed", true);
        });
        // Set default or previously saved values on the GUI.
        this.setGUIState();
        if (viewer !== null) {
            // Viewer is specified in url, so auto advance
            _autoAdvance(jQuery);
        }
    }
    exports.allowUserToModifySettings = allowUserToModifySettings;
    function _autoAdvance(jQuery) {
        // In some circumstances, you might want to skip this scene. For example,
        // if the URL says what the settings should be.
        jQuery("#user_settings_continue_button").click();
    }
    function panel(title, html) {
        /*
        Return the HTML for a simple bootstrap panel.
    
        :param string title: The title of the panel.
    
        :param string html: The html contained in the panel.
    
        :returns: The panel HTML.
        :rtype: :class:`string`
        */
        return `
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">
                    ${title}
                </h3>
            </div>
            <div class="panel-body">${html}</div>
        </div>
    `;
    }
    function panelCollapsible(title, html) {
        /*
        Return the HTML for a simple collapsible bootstrap panel.
    
        :param string title: The title of the panel.
    
        :param string html: The html contained in the panel.
    
        :returns: The panel HTML.
        :rtype: :class:`string`
        */
        let rnd = Math.floor(Math.random() * 1000000).toString();
        return `
        <div class="panel panel-primary">
            <div class="panel-heading" onclick="jQuery('#collapse-${rnd}-href').get(0).click();" style="cursor: pointer;">
                <h3 class="panel-title">
                    <a data-toggle="collapse" id="collapse-${rnd}-href" href="#collapse-${rnd}"></a>${title}
                    <i class="indicator glyphicon glyphicon-chevron-up pull-right"></i>
                </h3>
            </div>
            <div id="collapse-${rnd}" class="panel-collapse collapse">
                <div class="panel-body">${html}</div>
            </div>
        </div>
    `;
    }
    function section(html) {
        /*
        Return the HTML for a simple section (panel without header).
    
        :param string html: The html contained in the section.
    
        :returns: The section HTML.
        :rtype: :class:`string`
        */
        return `
        <div class="panel panel-default">
            <div class="panel-body">${html}</div>
        </div>
    `;
    }
    function row_even_split(html1, html2) {
        /*
        Return a row with two columns.
    
        :param string html1: The html contained in the first column.
    
        :param string html2: The html contained in the second column.
    
        :returns: The row HTML.
        :rtype: :class:`string`
        */
        return `
        <div class="row">
            <div class="col-sm-6 col-xs-12">
                ${html1}
            </div>
            <div class="col-sm-6 col-xs-12">
                ${html2}
            </div>
        </div>                
    `;
    }
    function row_thirds_split(widths, html1, html2, html3) {
        /*
        Return a row with three columns.
    
        :param number[] widths: The widths of the columns (should sum to 12).
    
        :param string html1: The html contained in the first column.
    
        :param string html2: The html contained in the second column.
    
        :param string html3: The html contained in the third column.
    
        :returns: The row HTML.
        :rtype: :class:`string`
        */
        return `
        <div class="row">
            <div class="col-lg-${widths[0]} col-xs-12">
                ${html1}
            </div>
            <div class="col-lg-${widths[1]} col-xs-12">
                ${html2}
            </div>
            <div class="col-lg-${widths[2]} col-xs-12">
                ${html3}
            </div>
        </div>                
    `;
    }
    function radioBoxes(label, values, icons_if_phone = undefined) {
        /* TODO: Docstring needed here! */
        let id = label.toLowerCase().replace(/ /g, '');
        let html = `<div class="form-group buttonbar-${id}">
                    <div class="btn-group btn-group-justified" data-toggle="buttons">
                        <div class="btn disabled btn-default" style="background-color: #eeeeee; opacity: 1;">${label}</div>`;
        for (let i = 0; i < values.length; i++) {
            let value = values[i];
            let iconHtml = "";
            if (icons_if_phone !== undefined) {
                iconHtml = icons_if_phone[i];
            }
            else {
                iconHtml = value;
            }
            let valueNoSpaces = value.replace(/ /g, '');
            html += `<label class="btn btn-default ${id}-labels proteinvr-radio-label ${valueNoSpaces.toLowerCase()}-label" data-description="${label}: ${value}" style="padding-left: 0; padding-right: 0; left:-${i + 1}px;">
                            <input type="radio" name="${id}" id="${id}${i}" autocomplete="off" value="${valueNoSpaces}"><span class="the-icon visible-xs">${iconHtml}</span><span class="hidden-xs">${value}</span>
                        </label>`;
        }
        html += `</div>
                </div>`;
        return html;
    }
    function setRadioState(id, varsToUse) {
        /* TODO: Docstring needed here! */
        setTimeout(() => {
            // Get all the labels and make them default colored, no checkboxes.
            let labels = Globals.get("jQuery")(`.${id}-labels`);
            labels.removeClass("btn-primary");
            labels.addClass("btn-default");
            labels.removeClass("active"); // these don't look so great IMHO
            labels.removeClass("focus");
            // Now find the one that should be checked.
            let labelToUse = labels.find(`#${id}${varsToUse[id]}`).closest("label");
            labelToUse.removeClass('btn-default');
            labelToUse.addClass("btn-primary");
            // Also make sure associated radio input is checked.
            let inputToUse = labelToUse.find('input');
            inputToUse.prop("checked", "checked");
        }, 0);
    }
    function setGUIState() {
        /* TODO: Docstring needed here! */
        let jQuery = Globals.get("jQuery");
        let varsToUse = jQuery.parseJSON(localStorage.getItem("proteinvr_params"));
        // Set the various radio states
        for (var key in UserVars.paramNames) {
            if (UserVars.paramNames.hasOwnProperty(key)) {
                let key2 = key.toLowerCase();
                setRadioState(key2, varsToUse);
            }
        }
    }
    exports.setGUIState = setGUIState;
    function addJavaScript(onSettingsPanelClosed) {
        /*
        Sets up all the javascript required to make the settings panel work (i.e.,
        when buttons pressed).
    
        :param func onSettingsPanelClosed: A callback function to run when
                    settings panel is closed.
        */
        let jQuery = Globals.get("jQuery");
        let engine = Globals.get("engine");
        // Make toggle boxes clickable.
        jQuery(".toggle_box").mouseup(function () {
            setTimeout(function () {
                // This to move it to bottom of stack.
                let This = jQuery(this);
                This.removeClass("focus");
            }.bind(this));
        });
        // Make radio buttons clickable
        jQuery(".proteinvr-radio-label").mouseup(function () {
            setTimeout(function () {
                let This = jQuery(this);
                let associatedInput = This.find("input");
                let key = associatedInput.attr("name");
                let val = associatedInput.val();
                let valNum = UserVars.stringToEnumVal(val);
                UserVars.updateLocalStorageParams(key, valNum);
                setGUIState();
                let description = This.data("description");
                jQuery("#hardware-msg").html(description);
            }.bind(this));
        });
        // The Device radio buttons are special. They don't control the program,
        // but rather the settings. So add another click to them.
        jQuery(".device-labels").mouseup(function () {
            let This = jQuery(this);
            let msg = jQuery("#settings-msg");
            msg.html(`Performance set to ${This.find("input").val().toLowerCase()} default.`);
            msg.removeClass("alert-info");
            msg.addClass("alert-warning");
        });
        function toggleChevron(e) {
            jQuery(e.target)
                .prev('.panel-heading')
                .find("i.indicator")
                .toggleClass('glyphicon-chevron-down glyphicon-chevron-right');
        }
        let collapsibles = jQuery('.panel-collapse');
        collapsibles.on('hidden.bs.collapse', toggleChevron);
        collapsibles.on('shown.bs.collapse', toggleChevron);
        // start button. Wrapped in screenful in case you want to go full screen
        // when you press the start button.
        // This does need to be registered on the window. If you do it
        // through a click in babylonjs, browsers will reject the
        // full-screen request.
        jQuery("#user_settings_continue_button").click(function () {
            figureOutWhichCameraToUse();
            jQuery("#settings_panel").fadeOut(() => {
                jQuery("#loading_panel").fadeIn();
            });
            this.onSettingsPanelClosed();
        }.bind({
            onSettingsPanelClosed: onSettingsPanelClosed,
        }));
    }
    function figureOutWhichCameraToUse() {
        /*
        Figures out what kind of camera to use based on hardware and user
        settings. Shows appropriate instructions in loading panel for that camera.
        */
        let isMobile = Globals.get("isMobile");
        let jQuery = Globals.get("jQuery");
        // Figure out which kind of camera to use.
        let cameraTypeToUse = "";
        switch (UserVars.getParam("viewer")) {
            case UserVars.viewers["Screen"]:
                // On a screen (not VR headset)
                switch (isMobile) {
                    case true:
                        // VR joy camera
                        cameraTypeToUse = "show-mobile-virtual-joystick";
                        break;
                    case false:
                        // For example, laptop screns.
                        cameraTypeToUse = "show-desktop-screen";
                        break;
                }
                break;
            case UserVars.viewers["VRHeadset"]:
                // On a VR headset
                switch (isMobile) {
                    case true:
                        // google cardboard, for example.
                        cameraTypeToUse = "show-mobile-vr";
                        break;
                    case false:
                        // Oculus rift or HTC vive.
                        cameraTypeToUse = "show-desktop-vr";
                        break;
                }
        }
        // Show the instructions relevant to that camera.
        jQuery("head").append(`
        <style>
            .show-mobile-virtual-joystick, .show-mobile-vr, .show-desktop-screen, .show-desktop-vr {
                display: none;
            }
            .${cameraTypeToUse} {
                display: inline-block; 
            }
        </style>
    `);
        if (cameraTypeToUse === "show-mobile-vr") {
            // Make sure no guide line shown.
            jQuery("#vr_overlay2").show();
        }
        Globals.set("cameraTypeToUse", cameraTypeToUse);
    }
    function addBroadcastModal() {
        /* TODO: Not currently implemented in this version of ProteinVR! */
        let jQuery = Globals.get("jQuery");
        let broadcastURL = window.location.href + '?id=' + PVRGlobals.broadcastID;
        jQuery("body").append(`
        <div class="modal fade" id="broadcast_modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Broadcast ProteinVR Session</h4>
                    </div>
                    <div class="modal-body">
                        <div id="hardware-msg" class="alert alert-info">
                            Give your students the URL below so they can accompany you in the virtual-reality world. Then click the "Start" button to enter the world yourself.
                        </div>
                        <div class="input-group">
                            <span class="input-group-addon" id="url_text">URL:</span>
                            <input type="text" value="${broadcastURL}" class="form-control" id="broadcast-url" aria-describedby="url_text">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button id="start_game_from_modal" type="button" class="btn btn-primary">Start</button>
                    </div>
                </div>
            </div>
        </div>`);
        jQuery("#start_game_from_modal").click(function () {
            jQuery('#broadcast_modal').modal('hide');
            PVRGlobals.teacherBroadcasting = true;
            jQuery("#user_settings_continue_button").click();
        });
        jQuery('#broadcast_modal').on('shown.bs.modal', function () {
            jQuery('#broadcast-url').focus();
        });
        // Start trying to get a tinyurl link instead
        jQuery.ajax({
            url: "js/url-shortener/shortener.php?url=" + broadcastURL,
            dataType: 'text',
        }).done(function (newUrl) {
            jQuery("#broadcast-url").val(newUrl);
        });
    }
});

define('../Spheres/Material',["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextureType;
    (function (TextureType) {
        TextureType[TextureType["None"] = 0] = "None";
        TextureType[TextureType["Transition"] = 1] = "Transition";
        TextureType[TextureType["Mobile"] = 2] = "Mobile";
        TextureType[TextureType["Full"] = 3] = "Full";
    })(TextureType = exports.TextureType || (exports.TextureType = {}));
    class Material {
        constructor(textureHasTransparency = false) {
            this.material = undefined; // BABYLON.Material
            this._textureHasTransparency = false;
            this.textureType = TextureType.None;
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            this._textureHasTransparency = textureHasTransparency;
            this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
            this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            this.material.specularColor = new BABYLON.Color3(0, 0, 0);
            this.material.diffuseTexture = null;
            this.material.backFaceCulling = false;
        }
        loadTexture(textureFileName, callBack = function () { }, pickTextureType) {
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            // let isMobile: boolean = Globals.get("isMobile");
            // let recentlyMoved: boolean = SphereCollection.hasEnoughTimePastSinceLastMove();
            let filename = "";
            // Use the TextureType specified
            switch (pickTextureType) {
                case TextureType.Transition:
                    // Load the very low-res texture, for transitions
                    filename = textureFileName + ".transition.png";
                    this.textureType = TextureType.Transition;
                    break;
                case TextureType.Mobile:
                    // Load the low-res texture
                    filename = textureFileName + ".small.png";
                    this.textureType = TextureType.Mobile;
                    break;
                case TextureType.Full:
                    // Load high-res texture
                    filename = textureFileName;
                    this.textureType = TextureType.Full;
                    break;
                default:
                    console.log("ERROR!");
                    debugger;
            }
            if (filename !== "") {
                // Need to load new texture, so proceed
                if (Globals.get("breakCaching") === false) {
                    filename = filename + "?" + Math.random().toString();
                }
                var assetsManager = new BABYLON.AssetsManager(scene);
                assetsManager.useDefaultLoadingScreen = false;
                assetsManager.addTextureTask("textureId" + Math.random().toString(), filename);
                assetsManager.onTaskSuccess = (tasks) => {
                    // Get rid of old texture to free memory
                    if ((this.material.emissiveTexture !== undefined) && (this.material.emissiveTexture !== null)) {
                        this.material.emissiveTexture.dispose();
                    }
                    this.material.emissiveTexture = tasks.texture; // videoTexture;
                    if (this._textureHasTransparency) {
                        this.material.opacityTexture = tasks.texture;
                    }
                    // console.log("=================");
                    // console.log("Material loaded: " + filename);
                    // try {
                    //     console.log("Current material:" + SphereCollection.getCurrentSphere().textureFileName);
                    // } catch(err) {
                    // }
                    callBack();
                };
                // assetsManager.onTaskError = (tasks) => {
                //     alert("ERROR!");
                //     debugger;
                // }
                assetsManager.load();
                return true; // because it changed
            }
            else {
                // No need to load new texture.
                callBack();
                return false;
            }
        }
        unloadTextureFromMemory() {
            this.textureType = TextureType.None;
            if (this.material !== undefined) {
                this.material.emissiveTexture.dispose();
                this.material.emissiveTexture = null;
                // this.material.dispose();
                // this.material = null;
            }
        }
    }
    exports.Material = Material;
});

/* Makes guide arrows work in VR world. */
define('../scene/Arrows',["require", "exports", "../config/Globals", "../config/Globals", "./Setup"], function (require, exports, Globals, Globals_1, Setup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _arrowMeshes = [];
    function setup() {
        /*
        Setup the arrows.
        */
        let BABYLON = Globals.get("BABYLON");
        let scene = Globals.get("scene");
        // Get the arrow mesh
        let arrowMesh = Setup_1.getMeshThatContainsStr("ProteinVR_Arrow", scene);
        // Clone it and put it in an array.
        _arrowMeshes = [arrowMesh];
        for (let i = 1; i < Globals.get("numNeighboringCameraPosForNavigation"); i++) {
            _arrowMeshes.push(arrowMesh.clone("ProteinVR_Arrow_clone" + i.toString()));
        }
        // Set the materials and other properties on all arrows
        for (let i = 0; i < _arrowMeshes.length; i++) {
            let thisArrowMesh = _arrowMeshes[i];
            // Make it's material.
            let mat = new BABYLON.StandardMaterial("arrowMat" + i.toString(), scene);
            mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            mat.specularColor = new BABYLON.Color3(0, 0, 0);
            mat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
            mat.diffuseTexture = null;
            mat.emissiveTexture = null;
            ; // videoTexture;
            thisArrowMesh.material = mat;
            // Additional settings
            thisArrowMesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
            thisArrowMesh.isPickable = false;
            thisArrowMesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
            thisArrowMesh.backFaceCulling = false;
            // Make it a ghost arrow.
            thisArrowMesh.visibility = 1.0; // ghost arrow.        
        }
    }
    exports.setup = setup;
    function fadeDownAll(val) {
        /*
        An easy function to set the visibility on all presently visible arrows.
    
        :param num val: The visibility to set.
        */
        // fade all arrows that are visible down.
        for (let i = 0; i < _arrowMeshes.length; i++) {
            let arrow = _arrowMeshes[i];
            if (arrow.visibility > 0) {
                arrow.visibility = val;
            }
        }
    }
    exports.fadeDownAll = fadeDownAll;
    function update(cameraPoints) {
        /*
        Update the location and position of the arrows.
    
        :param Camera.CameraPoints cameraPoints: An object containing information
                                   about nearby locations to which the camera can
                                   move.
        */
        let scene = Globals.get("scene");
        // All arrows are initially hidden
        for (let i = 0; i < _arrowMeshes.length; i++) {
            _arrowMeshes[i].visibility = 0.0;
        }
        // Get the camera position
        let cameraPos = scene.activeCamera.position;
        // Go through each of the cameraPoints and position an arrow there.
        for (let i = 0; i < cameraPoints.length(); i++) {
            let arrowToUse = _arrowMeshes[i];
            arrowToUse.visibility = 1.0;
            let neighboringCameraPointPosition = cameraPoints.get(i).position;
            let vec = neighboringCameraPointPosition.subtract(cameraPos).normalize().scale(4.0);
            arrowToUse.position = cameraPos.add(vec);
            // console.log(arrowToUse.position);
            // console.log(neighboringCameraPointPosition, cameraPos, vec, arrowToUse.position);
            // console.log(cameraPos, arrowToUse.position)
            arrowToUse.position.y = arrowToUse.position.y - 2.0;
            arrowToUse.lookAt(cameraPos.add(vec.scale(8.0)));
        }
    }
    exports.update = update;
});

/* Add signs to the scene to guide the student. */
define('../scene/Sign',["require", "exports", "../config/Globals", "../config/Globals"], function (require, exports, Globals, Globals_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function setupAllSigns() {
        /*
        Sets up the signs that have been loaded from the external json file.
        */
        // Get the sign data
        let signData = Globals.get("signData");
        // Go through each one
        let BABYLON = Globals.get("BABYLON");
        let scene = Globals.get("scene");
        for (let i = 0; i < signData.length; i++) {
            // Get variables
            let sd = signData[i];
            let pos = sd["location"];
            pos = new BABYLON.Vector3(pos[0], pos[2], pos[1]); // note y and z reversed
            let text = sd["text"];
            // text = "This is a test dude. This is a test dude. This is a test dude. This is a test dude. This is a test dude. This is a test dude. "
            // Add plane
            let plane = BABYLON.Mesh.CreatePlane("signPlane" + i.toString(), 2.0, scene); // size of plane hardcoded?
            plane.position = pos;
            plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
            plane.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
            // Make the texture with the text on it.
            let textureResolution = 1024;
            let fontSize = 80;
            let margin = 40;
            var planeTexture = new BABYLON.DynamicTexture("dynamicTexture" + i.toString(), textureResolution, scene, true); // resolution hardcoded
            let textureContext = planeTexture.getContext();
            textureContext.font = `bold ${fontSize}px Arial`;
            textureContext.save();
            // textureContext.clearColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            textureContext.fillStyle = "white";
            _wrapText(textureContext, text, margin, textureResolution, fontSize, textureResolution);
            textureContext.restore();
            planeTexture.update();
            // Make plane material
            let dynamicMaterial = new BABYLON.StandardMaterial('dynamicMaterial' + i.toString(), scene);
            dynamicMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            ;
            dynamicMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
            dynamicMaterial.emissiveTexture = planeTexture;
            // dynamicMaterial.opacityTexture = planeTexture;
            dynamicMaterial.backFaceCulling = false;
            plane.material = dynamicMaterial;
        }
    }
    exports.setupAllSigns = setupAllSigns;
    function _getLineData(line, context) {
        /*
        Format the text to put on the sign and determine the total length of that
        text when rendered in the browser.
    
        :param string line: The text.
    
        :param ??? context: The texture context.
    
        :returns: A JSON object containing the formatted line and linewidth.
        :rtype: :class:`obj`
        */
        // Remove terminal and inital spaces
        line = line.replace(/\t/g, " ");
        line = line.replace(/ $/g, "");
        line = line.replace(/^ /g, "");
        // Get width
        let lineWidth = context.measureText(line).width;
        return {
            line: line,
            width: lineWidth
        };
    }
    function _wrapText(context, text, margin, maxWidth, lineHeight, textureResolution) {
        /*
        Wraps text appropriately and draws it on the texture context.
    
        :param ??? context: The texture context.
    
        :param string text: The text.
    
        :param number margin: The margin around the text.
    
        :param number maxWidth: Can't remember what this is for.
    
        :param number lineHeight: The height of the line (used for spacing).
    
        :param number textureResolution: The resolution of the texture.
        */
        // Adapted from http://www.html5gamedevs.com/topic/8958-dynamic-texure-drawtext-attributes-get-text-to-wrap/
        // Set some variables
        let line = '';
        let words = text.split(' ');
        let align = "CENTER";
        // Get the lines
        let lines = [];
        let lineWidths = [];
        for (let n = 0; n < words.length; n++) {
            let testLine = line + words[n] + ' ';
            let testLineInf = _getLineData(testLine, context);
            if (testLineInf.width > maxWidth - 2 * margin && n > 0) {
                let lineInf = _getLineData(line, context);
                lines.push(lineInf.line);
                lineWidths.push(lineInf.width);
                line = words[n] + ' ';
            }
            else {
                line = testLine;
            }
        }
        let lineInf = _getLineData(line, context);
        lines.push(lineInf.line);
        lineWidths.push(lineInf.width);
        // Now draw those lines.
        let y = margin + lineHeight;
        if (align === "CENTER") {
            y = 0.5 * (textureResolution - (lines.length - 1) * lineHeight);
        }
        for (let n = 0; n < lines.length; n++) {
            let line = lines[n];
            let x = margin;
            if (align === "CENTER") {
                x = 0.5 * (textureResolution - lineWidths[n]);
            }
            context.fillText(line, x, y);
            y += lineHeight;
        }
    }
    function makeSign(params) {
        // TODO: Need stuff here.
    }
});

// Sets up the scene.
define('../scene/Setup',["require", "exports", "../config/Globals", "../config/Globals", "../Spheres/Material", "./Arrows", "./Sign", "../Spheres/Material"], function (require, exports, Globals, Globals_1, Material_1, Arrows, Sign_1, Material_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadBabylonFile() {
        /*
        Loads and sets up the main scene.
        */
        var engine = Globals.get("engine");
        var scene = new BABYLON.Scene(engine);
        Globals.set("scene", scene);
        let uniqID = window.uniqID;
        BABYLON.SceneLoader.Append("", uniqID + ".babylon.babylon", scene, () => {
            window.scrollTo(0, 1); // supposed to autohide scroll bar.
            // Wait for textures and materials to be ready
            scene.executeWhenReady(() => {
                // Make it so subsequent textures are stored in indexeddb. This is
                // hackish, but it works.
                scene.database = new BABYLON.Database(uniqID + '.babylon.babylon', function () { });
                // Delay textures until needed. Cool, but too slow for our
                // purposes here... Keep it commented out for now.
                // newScene.useDelayedTextureLoading = true
                // Setup viewer sphere template
                let radius = 12; // When using VR, this needs to be farther away that what it was rendered at. this._JSONData["viewerSphereSize"];
                _setupViewerSphereTemplate(scene, radius);
                // Set up environmental (skybox) sphere
                _setupEnvironmentalSphere(radius);
                // Setup arrows
                Arrows.setup();
                // Setup signs
                Sign_1.setupAllSigns();
                // window.debugit = scene.debugLayer;
                window.scene = scene;
                // scene.debugLayer.show();
                scene.clearColor = new BABYLON.Color3(0, 0, 0);
                // No built-in loading screen.
                BABYLON.SceneLoader.ShowLoadingScreen = false;
                if (Globals.get("debug")) {
                    scene.debugLayer.show();
                }
                // Add a sphere to the scene to mark where you're looking.
                // (advanced navigation system)
                // let destinationNeighborSphere = BABYLON.MeshBuilder.CreateSphere("destinationNeighborSphere", {diameter: 0.05}, scene);
                // var destinationNeighborSphereMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
                // destinationNeighborSphereMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
                // destinationNeighborSphereMaterial.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);  // Make it shiny.
                // destinationNeighborSphereMaterial.emissiveColor = new BABYLON.Color3(1, 0, 1);
                // destinationNeighborSphere.material = destinationNeighborSphereMaterial;
                // destinationNeighborSphere.renderingGroupId = RenderingGroups.VisibleObjects;
                // destinationNeighborSphere.isVisible = false;  // Make it initially invisible.
                // Globals.set("destinationNeighborSphere", destinationNeighborSphere);
                // Make the scene right handed.
                // scene.useRightHandedSystem = true;
                Globals.milestone("BabylonSceneLoaded", true);
            });
        });
    }
    exports.loadBabylonFile = loadBabylonFile;
    function getMeshThatContainsStr(str, scene) {
        /*
        Gets the first mesh with a name that contains the given substring.
    
        :param string str: The substring.
    
        :param ??? scene: The BABYLON scene.
    
        :returns: The first mesh.
        :rtype: :class:`???`
        */
        // Identify viewer sphere template
        let theMesh;
        for (let t = 0; t < scene.meshes.length; t++) {
            if (scene.meshes[t].name.indexOf(str) !== -1) {
                theMesh = scene.meshes[t];
                break;
            }
        }
        return theMesh;
    }
    exports.getMeshThatContainsStr = getMeshThatContainsStr;
    var ROTATE_SPHERES = -0.5 * Math.PI;
    function _setupViewerSphereTemplate(scene, radius) {
        /*
        Sets up the initial viewer sphere. This will be cloned for each valid
        camera location in the scene.
    
        :param ??? scene: The BABYLON scene.
    
        :param number radius: The size of the viewer sphere.
        */
        // Identify viewer sphere template
        let viewerSphereTemplate = getMeshThatContainsStr("ProteinVR_ViewerSphere", scene);
        viewerSphereTemplate.scaling = new BABYLON.Vector3(radius, radius, -radius);
        viewerSphereTemplate.isPickable = false;
        viewerSphereTemplate.renderingGroupId = Globals_1.RenderingGroups.ViewerSphere;
        viewerSphereTemplate.rotation.y = ROTATE_SPHERES; //4.908738521234052;  // To align export with scene. 281.25 degrees = 25/32*360
        Globals.set("viewerSphereTemplate", viewerSphereTemplate);
    }
    function _setupEnvironmentalSphere(radius) {
        /*
        Sets up the environmental sphere (unchanging depending on position). Note
        that Alex's blender plugin uses a different nomenclature. You should
        standardize these names.
    
        :param number radius: The size of the environmenal sphere.
        */
        let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
        let skyboxSphere = viewerSphereTemplate.clone("skyboxSphere");
        let slightlyBiggerRadius = radius * 1.05;
        skyboxSphere.scaling = new BABYLON.Vector3(slightlyBiggerRadius, slightlyBiggerRadius, -slightlyBiggerRadius);
        skyboxSphere.rotation.y = ROTATE_SPHERES; // 4.908738521234052;  // To align export with scene. 281.25 degrees = 25/32*360
        skyboxSphere.isPickable = false;
        skyboxSphere.renderingGroupId = Globals_1.RenderingGroups.EnvironmentalSphere;
        let sphereMaterial2 = new Material_1.Material(true);
        Globals.set("skyboxSphere", skyboxSphere); // to make sure the object t least exists. Material comes later.
        let skyboxFilename = window.uniqID + '.skybox.png';
        if (Globals.get("isMobile")) {
            skyboxFilename = window.uniqID + '.skybox.png.small.png';
        }
        sphereMaterial2.loadTexture(skyboxFilename, () => {
            skyboxSphere.material = sphereMaterial2.material;
            Globals.set("skyboxSphere", skyboxSphere);
        }, Material_2.TextureType.Full);
    }
});

define('../scene/Animations/CubicSpline',["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Spline {
        constructor(pointArray) {
            this.pointArray = pointArray;
            this.splineSet = this.setupSpline();
        }
        getSplineSet() {
            return this.splineSet;
        }
        get(input) {
            if (input >= this.pointArray[this.pointArray.length - 1].getX()) {
                return this.pointArray[this.pointArray.length - 1].getY();
            }
            for (var i = 0; i < this.splineSet.length; i++) {
                if (input >= this.splineSet[i].getX()) {
                    if (this.splineSet[i + 1] != undefined && input < this.splineSet[i + 1].getX()) {
                        return this.splineSet[i].getY(input);
                    }
                }
            }
        }
        setupSpline() {
            let arrayA = new Array();
            for (let entry of this.pointArray) {
                arrayA.push(entry.getY());
            }
            let arrayB = new Array(); // Make size n.
            let arrayD = new Array(); // Make size n.
            let arrayH = new Array(); // Make size n.
            for (var _i = 0; _i < this.pointArray.length - 1; _i++) {
                arrayH.push(this.pointArray[_i + 1].getX() - this.pointArray[_i].getX());
            }
            let arrayAlpha = new Array(); // Make size n.
            for (var _i = 1; _i < this.pointArray.length - 1; _i++) {
                arrayAlpha[_i] = ((3 / arrayH[_i]) * (arrayA[_i + 1] - arrayA[_i])) -
                    ((3 / arrayH[_i - 1]) * (arrayA[_i] - arrayA[_i - 1]));
            }
            let arrayC = new Array(); // Make size n + 1.
            let arrayL = new Array(); // Make size n + 1.
            let arrayMicro = new Array(); // Make size n + 1.
            let arrayZ = new Array(); // Make size n + 1.
            arrayL[0] = 1;
            arrayMicro[0] = 0;
            arrayZ[0] = 0;
            for (var _i = 1; _i < this.pointArray.length - 1; _i++) {
                arrayL[_i] = (2 * (this.pointArray[_i + 1].getX() - this.pointArray[_i - 1].getX())) -
                    ((arrayH[_i - 1]) * arrayMicro[_i - 1]); // Part 1
                arrayMicro[_i] = arrayH[_i] / arrayL[_i]; // Part 2
                arrayZ[_i] = (arrayAlpha[_i] - (arrayH[_i - 1] * arrayZ[_i - 1])) / arrayL[_i]; // Part 3
            }
            arrayL[this.pointArray.length - 1] = 1; // Step 8
            arrayZ[this.pointArray.length - 1] = 0; // Step 8
            arrayC[this.pointArray.length - 1] = 0; // Step 8
            for (var j = this.pointArray.length - 2; j >= 0; j--) {
                arrayC[j] = arrayZ[j] - (arrayMicro[j] * arrayC[j + 1]); // Part 1
                arrayB[j] = (((arrayA[j + 1] - arrayA[j])) / arrayH[j]) - (arrayH[j] * (arrayC[j + 1] + (2 * arrayC[j])) / 3); // Part 2
                arrayD[j] = (arrayC[j + 1] - arrayC[j]) / (3 * arrayH[j]); // Part 3
            }
            let output_set = new Array();
            for (var i = 0; i < this.pointArray.length; i++) {
                let aValue = arrayA[i];
                let bValue = arrayB[i];
                let cValue = arrayC[i];
                let dValue = arrayD[i];
                let xValue = this.pointArray[i].getX();
                output_set.push(new SplineData(aValue, bValue, cValue, dValue, xValue));
            }
            return output_set;
        }
    }
    class SplineData {
        constructor(a, b, c, d, x) {
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.x = x;
        }
        getX() {
            return this.x;
        }
        getY(input) {
            return this.a + (this.b * (input - this.x)) + (this.c * Math.pow((input - this.x), 2)) +
                (this.d * Math.pow((input - this.x), 3));
        }
    }
    class Point {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }
        getX() {
            return this.x;
        }
        setX(newX) {
            this.x = newX;
        }
        getY() {
            return this.y;
        }
        setY(newY) {
            this.y = newY;
        }
    }
    // let point1 = new Point(1, 1);
    // let point2 = new Point(2, 2);
    // let point3 = new Point(3, 3);
    // let spline = new Spline([point1, point2, point3]);
    // for (let x = 1.1; x <= 3.1; x += 0.1) {
    //    console.log("x: " + x.toFixed(3) + " y: " + spline.get(x).toFixed(3));
    // }
    class MultiDimenSpline {
        constructor(xs, ys) {
            this.splines = [];
            for (let y_col = 0; y_col < ys[0].length; y_col++) {
                let pts_this_spline = [];
                for (let i = 0; i < ys.length; i++) {
                    let pt = new Point(xs[i], ys[i][y_col]);
                    pts_this_spline.push(pt);
                }
                this.splines.push(new Spline(pts_this_spline));
            }
        }
        get(input) {
            let numberArray = new Array();
            for (let entry of this.splines) {
                numberArray.push(entry.get(input));
            }
            return numberArray;
        }
    }
    exports.MultiDimenSpline = MultiDimenSpline;
});
// let xs = [1, 2, 3, 4, 5];
// let ys = [
//     [1, 2, 3],
//     [2, 3, 4],
//     [3, 4, 5],
//     [4, 5, 6],
//     [5, 6, 7]
// ]
// let spline2 = new MultiDimenSpline(xs, ys);
// for (let x = 1; x <= 5; x += 0.1) {
//    console.log("x: " + x.toFixed(3) + " ys: " + spline2.get(x));
// }
;
// Controls animations, loaded through data.json. Just translation and
// rotation.
define('../scene/Animations/Animations',["require", "exports", "../../config/Globals", "./CubicSpline"], function (require, exports, Globals, CubicSpline) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Animation {
        constructor(obj) {
            /*
            Construct the Animation object for a mesh.
    
            :param ??? obj: The BABYLON.Mesh object to animate.
            */
            /*
            A class to manage animations (not armature animations... just translation
            and rotation).
            */
            this._animationSpline = undefined;
            this._obj = undefined;
            this._BABYLON = Globals.get("BABYLON");
            this._firstFrameIndex = undefined;
            this._lastFrameIndex = undefined;
            this._playing = false;
            this._playStartTime = undefined;
            this._playStartFrame = undefined;
            this._playEndFrame = undefined;
            this._playDurationInSeconds = undefined;
            this._playDeltaFrames = undefined;
            this._playLoop = "FALSE";
            if (typeof (obj) === "string") {
                let scene = Globals.get("scene");
                obj = scene.getMeshByName(obj);
            }
            this._obj = obj;
            // Get the data that will be processed.
            let objName = obj.name;
            let animationData = Globals.get("animationData");
            let firstFrameIndex = Globals.get("firstFrameIndex");
            this._firstFrameIndex = firstFrameIndex;
            let lastFrameIndex = Globals.get("lastFrameIndex");
            this._lastFrameIndex = lastFrameIndex;
            let objAnimData = animationData[objName];
            // Extract just the desired frames.
            let framesToKeep = [];
            let posAndRot = [];
            let lastPosAndRot = undefined;
            for (let i = firstFrameIndex; i <= lastFrameIndex; i++) {
                framesToKeep.push(i);
                let thisPosAndRot = (objAnimData[i] !== undefined) ? objAnimData[i] : lastPosAndRot;
                // Be sure to convert to babylonjs space.
                // ******** MOOSE
                posAndRot.push(thisPosAndRot);
                lastPosAndRot = thisPosAndRot;
            }
            // Make a spline.
            this._animationSpline = new CubicSpline.MultiDimenSpline(framesToKeep, posAndRot);
            // Set pivot point to location of first frame?
            this.setAnimationFrame(firstFrameIndex);
            // Save this object to the mesh
            this._obj.PVRAnimation = this;
            let meshesWithAnimations = Globals.get("meshesWithAnimations");
            meshesWithAnimations.push(this._obj);
            Globals.set("meshesWithAnimations", meshesWithAnimations);
        }
        setAnimationFrame(frameIndex) {
            /*
            Positions and rotates the object tomatch a given animation frame.
    
            :param number frameIndex: The frame number.
            */
            // See https://doc.babylonjs.com/tutorials/position,_rotate,_translate_and_spaces
            let vals = this._animationSpline.get(frameIndex);
            let pos = new this._BABYLON.Vector3(vals[0], vals[2], vals[1]);
            this._obj.position = pos;
            this._obj.setPivotMatrix(this._BABYLON.Matrix.Translation(0, 0, 0));
            this._obj.rotation = new this._BABYLON.Vector3(vals[3], vals[5], vals[4]);
        }
        play(durationInSeconds, animationStartFrame = undefined, animationEndFrame = undefined, playLoop = "FALSE") {
            /*
            Play the animation.
    
            :param number durationInSeconds: The duration of the animation.
    
            :param number animationStartFrame: The starting frame number.
    
            :param number animationEndFrame: The ending frame number.
    
            :param string playLoop: How to play the animation. "FALSE" means no
                          loop. "LOOP" means loop the animation. "ROCK" means go
                          forward through the animation, then back, then forward.
            */
            animationStartFrame = animationStartFrame === undefined ? this._firstFrameIndex : animationStartFrame;
            animationEndFrame = animationEndFrame === undefined ? this._lastFrameIndex : animationEndFrame;
            this._playStartTime = new Date().getTime() / 1000;
            this._playStartFrame = animationStartFrame;
            this._playEndFrame = animationEndFrame;
            this._playDurationInSeconds = durationInSeconds;
            this._playDeltaFrames = animationEndFrame - animationStartFrame;
            this._playing = true;
            this._playLoop = playLoop;
        }
        stop() {
            /*
            Stop playing the animation.
            */
            this._playing = false;
        }
        updatePos() {
            /*
            Update the animation based on the amount of time that has passed since
            the animation was started. Also iniates looping.
            */
            if (this._playing) {
                let deltaTimeInSecs = new Date().getTime() / 1000 - this._playStartTime;
                if (deltaTimeInSecs <= this._playDurationInSeconds) {
                    let timeRatio = deltaTimeInSecs / this._playDurationInSeconds;
                    let deltaFrames = this._playDeltaFrames * timeRatio;
                    let currentFrame = this._playStartFrame + deltaFrames;
                    this.setAnimationFrame(currentFrame);
                }
                else {
                    // Reached end of animation.
                    switch (this._playLoop) {
                        case "FALSE":
                            // stop animation.
                            this.stop();
                            break;
                        case "LOOP":
                            // Restart animation.
                            this.stop();
                            this.play(this._playDurationInSeconds, this._playStartFrame, this._playEndFrame, this._playLoop);
                            break;
                        case "ROCK":
                            this.stop();
                            this.play(this._playDurationInSeconds, this._playEndFrame, this._playStartFrame, this._playLoop);
                            break;
                        default:
                            console.log("ERROR");
                            debugger;
                    }
                }
            }
        }
    }
    exports.Animation = Animation;
});

define('../Spheres/CameraPoints',["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class CameraPoints {
        constructor() {
            /*
            A class that keeps track of and processes the valid locations where the
            camera can reside (i.e., at the centers of viewer spheres.)
            */
            this.data = [];
        }
        push(d) {
            /*
            Add a point to the list of camera points.
    
            :param CameraPointData d: The data point to add.
            */
            this.data.push(d);
        }
        _getValBasedOnCriteria(d, criteria = "distance") {
            /*
            Each camera data point contains several values (distance, angle,
            score). This function retrieves a specific kind of value from a data
            point.
    
            :param CameraPointData d: The data point to get data from.
    
            :param string criteria: The name of the kind of data to get. Defaults
                          to "distance"
    
            :returns: The corresponding value.
            :rtype: :class:`number`
            */
            let val;
            switch (criteria) {
                case "distance":
                    return d.distance;
                case "angle":
                    return d.angle;
                case "score":
                    return d.score;
                default:
                    debugger;
            }
        }
        sort(criteria = "distance") {
            /*
            Sorts the data points by a given criteria.
    
            :param string criteria: The criteria to use. "distance", "angle", or
                          "score". Defaults to "distance".
            */
            this.data.sort(function (a, b) {
                let aVal = this.This._getValBasedOnCriteria(a, this.criteria);
                let bVal = this.This._getValBasedOnCriteria(b, this.criteria);
                if (aVal < bVal) {
                    return -1;
                }
                else if (aVal > bVal) {
                    return 1;
                }
                else {
                    return 0;
                }
            }.bind({
                criteria: criteria,
                This: this
            }));
        }
        removeFirst() {
            /*
            Remove the first item presently in the list of data points. This
            function is generally only useful if you've sorted the data points
            first.
            */
            this.data.shift();
        }
        firstPoint() {
            /*
            Get the first item presently in the list of data points. This function
            is generally only useful if you've sorted the data points first.
    
            :returns: The first camera point.
            :rtype: :class:`CameraPointData`
            */
            return this.data[0];
        }
        firstFewPoints(num) {
            /*
            Get the first several items presently in the list of data points. This
            function is generally only useful if you've sorted the data points
            first.
    
            :param int num: The number of top points to return.
    
            :returns: A CameraPoints containing the top points.
            :rtype: :class:`CameraPoints`
            */
            let newCameraPoints = new CameraPoints();
            for (let i = 0; i < num; i++) {
                newCameraPoints.push(this.data[i]);
            }
            return newCameraPoints;
        }
        copy() {
            return this.firstFewPoints(this.length());
        }
        length() {
            /*
            Get the number of points in the current list.
    
            :returns: the number of points.
            :rtype: :class:`int`
            */
            return this.data.length;
        }
        get(index) {
            /*
            Get a specific data point from the list.
    
            :param int index: The index of the data point.
    
            :returns: The data point.
            :rtype: :class:`CameraPointData`
            */
            return this.data[index];
        }
        lessThanCutoff(cutoff, criteria = "distance") {
            /*
            Get a list of all points that have values less than some cutoff.
    
            :param number cutoff: The cutoff to use.
    
            :param string criteria: The criteria to use. "distance", "angle", or
                          "score". Defaults to "distance".
    
            :param int num: The number of top points to return.
    
            :returns: A CameraPoints containing the points that meet the criteria.
            :rtype: :class:`CameraPoints`
            */
            let newCameraPoints = new CameraPoints();
            for (let dIndex = 0; dIndex < this.data.length; dIndex++) {
                let d = this.data[dIndex];
                let val = this._getValBasedOnCriteria(d, criteria);
                if (val <= cutoff) {
                    newCameraPoints.push(d);
                }
            }
            return newCameraPoints;
        }
        addAnglesInPlace(pivotPoint, vec1) {
            /*
            Calculate angles between each of the points in this list and another
            point, with a third central ("pivot") point specified..
    
            :param BABYLON.Vector3 pivotPoint: The central point of the three
                                   points that form the angle.
    
            :param BABYLON.Vector3 vec1: The third vector used to calculate the angle.
            */
            let BABYLON = Globals.get("BABYLON");
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                let vec2 = d.position.subtract(pivotPoint).normalize();
                let angle = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
                this.data[i].angle = angle;
            }
        }
        addScoresInPlace(maxAngle, maxDistance) {
            /*
            Calculate scores for each of the points in this. Points right in front
            of the camera are given higher values, so both distance and angle play
            roles.
    
            :param number maxAngle: The maximum acceptable angle.
    
            :param number maxDistance: The maximum acceptable distance.
            */
            // Combination of angle (should be close to 0) and distance (should be
            // close to 0). But need to be normalized.
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                // Note that lower scores are better.
                let score = 0.5 * ((d.angle / maxAngle) + (d.distance / maxDistance));
                this.data[i].score = score;
            }
        }
        removePointsInSameGeneralDirection(pivotPt) {
            /*
            Get a list of data points without those points that are off more or
            less the same direction relative to the camera. No need for two arrows
            pointing in the same direction.
    
            :param BABYLON.Vector3 pivotPt: Probably the camera location.
    
            :returns: A CameraPoints containing the points that meet the criteria.
            :rtype: :class:`CameraPoints`
            */
            // This removes any points in the same general direction, keeping the
            // one that is closest.
            let BABYLON = Globals.get("BABYLON");
            for (let dIndex1 = 0; dIndex1 < this.data.length - 1; dIndex1++) {
                if (this.data[dIndex1] !== null) {
                    let pt1 = this.data[dIndex1].position;
                    let vec1 = pt1.subtract(pivotPt).normalize();
                    for (let dIndex2 = dIndex1 + 1; dIndex2 < this.data.length; dIndex2++) {
                        if (this.data[dIndex2] !== null) {
                            let pt2 = this.data[dIndex2].position;
                            let vec2 = pt2.subtract(pivotPt).normalize();
                            let angleBetweenVecs = Math.acos(BABYLON.Vector3.Dot(vec1, vec2));
                            if (angleBetweenVecs < 0.785398) {
                                let dist1 = this.data[dIndex1].distance;
                                let dist2 = this.data[dIndex2].distance;
                                // Note that the below alters the data in the source list.
                                // So don't use that list anymore. (Just use what this
                                // function returns...)
                                if (dist1 <= dist2) {
                                    this.data[dIndex2] = null;
                                }
                                else {
                                    this.data[dIndex1] = null;
                                }
                            }
                        }
                    }
                }
            }
            // Now keep only ones that are not null
            let newCameraPoints = new CameraPoints();
            for (let dIndex = 0; dIndex < this.data.length; dIndex++) {
                let d = this.data[dIndex];
                if (d !== null) {
                    newCameraPoints.push(d);
                }
            }
            // Return the kept ones.
            return newCameraPoints;
        }
        toString() {
            /*
            Return a string repreesentation of this CameraPoints object. For
            debugging.
    
            :returns: A string representation.
            :rtype: :class:`string`
            */
            let response = "";
            for (let i = 0; i < this.data.length; i++) {
                let d = this.data[i];
                response = response + "Pt" + i.toString() + "; ";
                response = response + "distance: " + d.distance.toFixed(2) + "; ";
                response = response + "position: " + d.position.toString(2) + "; ";
                response = response + "associatedViewerSphere: " + d.associatedViewerSphere.textureFileName + "; ";
                if (d.angle !== undefined) {
                    response = response + "angle: " + d.angle.toFixed(2) + "; ";
                }
                if (d.score !== undefined) {
                    response = response + "score: " + d.score.toFixed(2) + "; ";
                }
                response = response + "\n";
            }
            return response;
        }
        associatedSphereTextureNamesInOrder() {
            /*
            Returns a list of the texture names associated with the points viewer
            spheres, in the proper sorted order. Just for debugging purposes.
    
            :returns: The list of texture names.
            :rtype: :class:`string[]`
            */
            // for debugging purposes
            let names = [];
            for (let i = 0; i < this.data.length; i++) {
                names.push(this.data[i].associatedViewerSphere.textureFileName);
            }
            return names;
        }
    }
    exports.CameraPoints = CameraPoints;
});

define('../Spheres/Sphere',["require", "exports", "./Material", "./Material", "../config/Globals", "./CameraPoints", "./SphereCollection", "../Triggers/TriggerCollection"], function (require, exports, Material_1, Material_2, Globals, CameraPoints_1, SphereCollection, TriggerCollection) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Sphere {
        constructor(textureFileName, meshFileName, position) {
            /*
            Creates the sphere object, but doesn't load any textures of meshes.
    
            :param string textureFileName: The name of the texture associated with
                          this sphere. Probably ends in ".png"
    
            :param string meshFileName: The name of the mesh. Maybe ends in .obj?
                          For now ignored, since creates sphere programmatically
                          via cloning.
    
            :param BABYLON.Vector3 position: The location of the sphere in 3D
                                   space.
            */
            this.sphereMesh = null; // BABYLON.Mesh
            this.assetsLoaded = false; // assets are not loaded to begin with
            this.index = undefined;
            this._neighboringSpheresByDist = undefined;
            this._navNeighboringSpheresByDist = undefined;
            this.__deltaVecsToOther = undefined;
            // Specify the meshFileName location and textureFileName location when
            // you create the sphere object, though it doesn't load them on object
            // creation.
            this.textureFileName = textureFileName;
            this.meshFileName = meshFileName;
            this.position = position;
            this.material = new Material_1.Material(true); // but no texture yet
        }
        loadMesh(callBack = function () { }) {
            /*
            Loads the mesh specifically. This is in a separate private function
            because it can only be called after the material is loaded, and I
            thought it would be more organized to separate it into a seprate
            function rather than placing the code itself in the above callback.
            mesh). Note that this does not happen on Sphere object creation.
    
            :param func callBack: A callback function to run when the assets
                        associated with this sphere are loaded.
            */
            // Now load the mesh (with material now loaded)
            // Eventually separate viewer meshes might be loaded remotely. For
            // example, if we decide to deform the meshes slightly to give a more
            // 3D look. But for now, just duplicate the template.
            if ((this.sphereMesh === undefined) || (this.sphereMesh === null)) {
                // Get the template sphere
                let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
                viewerSphereTemplate.isVisible = false;
                // Clone the sphere for this specific PNG/materials
                this.sphereMesh = viewerSphereTemplate.clone("viewer_sphere_" + this.textureFileName);
                // Position that sphere at the associated camera location (in same order).
                this.sphereMesh.position = this.position;
                // Hide the sphere. In ViewerSphere.ts, show just the first one.
                this.opacity(0.0);
                // console.log("Mesh loaded: ", this.textureFileName);
                this.assetsLoaded = true; // Assets have now been loaded. Because spheres are always loaded after textures.
            }
            // Do this regardless. If texture updated, need to update material.
            this.sphereMesh.material = this.material.material;
            callBack();
        }
        tryToUpgradeTextureIfAppropriate() {
            // Upgrades the texture of this sphere if it's appropriate.
            if (this.material.textureType === Material_2.TextureType.Full) {
                // Already maxed out;
                return;
            }
            if (!SphereCollection.hasEnoughTimePastSinceLastMove()) {
                // Not enough time has passed since the user sat still. Only load
                // if not much movement.
                return;
            }
            if (Globals.get("isMobile")) {
                // It's mobile, so try to upgrade to a mobile texture.
                this.material.loadTexture("frames/" + this.textureFileName, () => {
                    this.loadMesh(); // Mesh has never been loaded, so take care of that.
                    // console.log(this.sphereMesh.visibility, this.sphereMesh.isVisible);
                }, Material_2.TextureType.Mobile);
            }
            else {
                // It's full, so try to load full texture.
                this.material.loadTexture("frames/" + this.textureFileName, () => {
                    this.loadMesh(); // Mesh has never been loaded, so take care of that.
                    // console.log(this.sphereMesh.visibility, this.sphereMesh.isVisible);
                }, Material_2.TextureType.Full);
            }
            // For debugging...
            // console.log("==========");
            // for (let i=0; i<Globals.get("lazyLoadCount"); i++) {
            //     let cameraPt = neighborPts.get(i);
            //     let sphere: Sphere = cameraPt.associatedViewerSphere;
            //     // Load the texture.
            //     console.log("frames/" + sphere.textureFileName, sphere.material.textureType);
            // }
        }
        loadAssets() {
            if (!this.assetsLoaded) {
                // let typeToLoad = TextureType.Mobile;
                let typeToLoad = Material_2.TextureType.Transition;
                // If you're not on mobile, and if the full texture isn't very
                // big, just load the full texture instead.
                let pngFileSizes = Globals.get("pngFileSizes");
                if (pngFileSizes !== undefined) {
                    // console.log("MOO", pngFileSizes[sphere.textureFileName]);
                    if (pngFileSizes[this.textureFileName] < 100) {
                        typeToLoad = Material_2.TextureType.Full;
                    }
                }
                this.material.loadTexture("frames/" + this.textureFileName, () => {
                    this.loadMesh(); // Mesh has never been loaded, so take care of that.
                }, typeToLoad);
            }
        }
        unloadAssets() {
            /*
            Unload the assets associated with this sphere (material and mesh) from
            memory. Probably as part of some lazy-loading scheme.
            */
            if (this.assetsLoaded) {
                this._unloadMesh();
                this._unloadTexture();
                this.assetsLoaded = false;
            }
        }
        _unloadTexture() {
            /*
            This function will remove the material from memory, probably as part
            of some lazy-loading scheme.
            */
            // Remove it from memory.
            // delete this.material;
            if ((this.material !== undefined) && (this.material !== null)) {
                this.material.unloadTextureFromMemory();
                // delete this.material;
            }
            // console.log("Material unloaded: ", this.textureFileName);
        }
        _unloadMesh() {
            /*
            This function will remove the sphere mesh from memory, probably as
            part of some lazy-loading scheme.
            */
            // Remove it from memory.
            if ((this.sphereMesh !== undefined) && (this.sphereMesh !== null)) {
                this.sphereMesh.dispose();
                this.sphereMesh = null;
                delete this.sphereMesh;
            }
            // console.log("Mesh unloaded: ", this.textureFileName);
        }
        opacity(val = undefined) {
            /*
            Sets the opacity of this sphere.
    
            :param number val: The opacity, between 0.0 and 1.0.
            */
            if (val === undefined) {
                // Getter
                return this.sphereMesh.visibility;
            }
            else if ((this.sphereMesh !== undefined) && (this.sphereMesh !== null)) {
                this.sphereMesh.visibility = val;
                // Might as well make entirely invisible if opacity is 0.
                if (val === 0.0) {
                    this.sphereMesh.isVisible = false;
                }
                else {
                    this.sphereMesh.isVisible = true;
                }
                return;
            }
        }
        _intersectionArrayOfSpheres(arr1, arr2) {
            let arr1Ids = [];
        }
        setToCurrentSphere() {
            // Update the current sphere variable
            SphereCollection.setCurrentSphereVar(this);
            // Update last move time.
            SphereCollection.setTimeOfLastMoveVar();
            // Trigger any triggers
            TriggerCollection.checkAll();
            // Make sure at least low-res neighbor textures loaded.
            let neighborPts = this.neighboringSpheresOrderedByDistance();
            let lazyLoadCount = Globals.get("lazyLoadCount");
            // Here load the low-res for all of close neighbors (one swoop)
            for (let i = 0; i < neighborPts.length(); i++) {
                // for (let i=0; i<Globals.get("lazyLoadCount"); i++) {
                let cameraPt = neighborPts.get(i);
                let sphere = cameraPt.associatedViewerSphere;
                if (i < lazyLoadCount) {
                    // They need to be loaded, because it's within the lazy-load
                    // range.
                    sphere.loadAssets();
                    // if (!sphere.assetsLoaded) {
                    //     let typeToLoad = TextureType.Mobile;
                    //     // If you're not on mobile, and if the full texture isn't very
                    //     // big, just load the full texture instead.
                    //     let pngFileSizes = Globals.get("pngFileSizes");
                    //     if (pngFileSizes !== undefined) {
                    //         // console.log("MOO", pngFileSizes[sphere.textureFileName]);
                    //         if (pngFileSizes[sphere.textureFileName] < 100) {  // 100 kb is arbitrary.
                    //             typeToLoad = TextureType.Full;
                    //         }
                    //     }
                    //     sphere.material.loadTexture("frames/" + sphere.textureFileName, () => {
                    //         sphere.loadMesh();  // Mesh has never been loaded, so take care of that.
                    //     }, typeToLoad);
                    // }
                }
                else {
                    // It needs to be unloaded, because it's outside the lazy-load
                    // range.
                    // if (sphere.assetsLoaded) {
                    sphere.unloadAssets();
                    // }
                }
            }
            let output = "";
            for (let i = 0; i < SphereCollection.spheres.length; i++) {
                if (i === SphereCollection.getIndexOfCurrentSphere()) {
                    output = output + "+";
                }
                else {
                    output = output + (SphereCollection.spheres[i].assetsLoaded ? "1" : ".");
                }
            }
            // Remove extra textures and meshes
            // SphereCollection.removeExtraSphereTexturesAndMeshesFromMemory();
        }
        neighboringSpheresOrderedByDistance() {
            /*
            Provides a list containing information about other spheres, ordered by
            their distances from this one. Calculates this only one. Uses cache on
            subsequent calls.
    
            :returns: An object with the data.
            :rtype: :class:`CameraPoints`
            */
            // This list includes the positions of all other spheres. So could be
            // a long list.
            if (this._neighboringSpheresByDist === undefined) {
                // Let's get the points close to this sphere, since never before
                // calculated. Includes even this sphere.
                let tmp = SphereCollection;
                this._neighboringSpheresByDist = new CameraPoints_1.CameraPoints();
                for (let i = 0; i < SphereCollection.count(); i++) {
                    let cameraPos = SphereCollection.getByIndex(i).position;
                    let pos = cameraPos.clone();
                    let dist = pos.subtract(this.position).length();
                    this._neighboringSpheresByDist.push({
                        distance: dist,
                        position: pos,
                        associatedViewerSphere: SphereCollection.getByIndex(i)
                    });
                }
                // Sort by distance
                this._neighboringSpheresByDist.sort();
                // Keep only the closest ones.
                // Not doing this anymore...
                // this._neighboringSpheresByDist = this._neighboringSpheresByDist.firstFewPoints(Globals.get("lazyLoadCount"));
            }
            return this._neighboringSpheresByDist;
        }
        navigationNeighboringSpheresOrderedByDistance() {
            /*
            Provides a list containing information about the closest spheres,
            ordered by their distances from this one. Calculates this only one.
            Uses cache on subsequent calls. These are the spheres that should be
            considered when positioning navigation arrows or considering where to
            move the camera next.
    
            :returns: An object with the data.
            :rtype: :class:`CameraPoints`
            */
            // This is just a few neighboring spheres near this sphere. User to
            // position arrows and for next-step destinations when moving through
            // the scene.
            if (this._navNeighboringSpheresByDist === undefined) {
                // // Start by considering all neighbors
                // this._navNeighboringSpheresByDist = this.neighboringSpheresOrderedByDistance().copy();
                // // Remove first one (closest). To make sure any movement is to a new
                // // sphere, not the one where you already are.
                // this._navNeighboringSpheresByDist.removeFirst();
                // // Keep only four points. So I guess paths can't be too bifurcated.
                // this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.firstFewPoints(Globals.get("numNeighboringCameraPosForNavigation"));  // choose four close points
                // // Remove the points that are off in the same general direction
                // this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.removePointsInSameGeneralDirection(this.position);
                // Need to index camera points by associated spheres. So {textureName: Sphere}
                var neighboringSpheresBySphereTexture = {};
                for (let i = 0; i < this.neighboringSpheresOrderedByDistance().length(); i++) {
                    let cameraPt = this.neighboringSpheresOrderedByDistance().get(i);
                    let sphere = cameraPt.associatedViewerSphere;
                    let textureName = sphere.textureFileName;
                    neighboringSpheresBySphereTexture[textureName] = cameraPt;
                }
                // Now keep only the camera points that are neighbors.
                this._navNeighboringSpheresByDist = new CameraPoints_1.CameraPoints();
                let neighborsToConsider = Globals.get("nextMoves")[this.index];
                for (let i = 0; i < neighborsToConsider.length; i++) {
                    let neighborToConsider = neighborsToConsider[i];
                    let textureName = SphereCollection.getByIndex(neighborToConsider).textureFileName;
                    this._navNeighboringSpheresByDist.push(neighboringSpheresBySphereTexture[textureName]);
                }
                // console.log(this.index, Globals.get("nextMoves")[this.index]);
                // console.log(this._navNeighboringSpheresByDist);
            }
            return this._navNeighboringSpheresByDist;
        }
        _deltaVecsToOtherPts() {
            // other_pt - this_point vector used for calculating which nav sphere
            // user is looking at. No need to keep calculating this over and over.
            // Just once, and cache.
            if (this.__deltaVecsToOther === undefined) {
                this.__deltaVecsToOther = [];
                let neighboringPts = this.neighboringSpheresOrderedByDistance();
                for (let i = 0; i < neighboringPts.length(); i++) {
                    let neighborPt = neighboringPts.get(i).position;
                    this.__deltaVecsToOther.push(neighborPt.subtract(this.position));
                }
            }
            return this.__deltaVecsToOther;
        }
        /*
        // For advanced navigation system....
    
        public getOtherSphereLookingAt() {
            // Given the spheres current location and the direction of the camera,
            // determine which other sphere comes closest.
    
            // Useful site: https://answers.unity.com/questions/62644/distance-between-a-ray-and-a-point.html
    
            let BABYLON = Globals.get("BABYLON");
    
            let deltaVecsToOtherPts = this._deltaVecsToOtherPts();
            let cameraLookingVector = Camera.lookingVector();
            
            // Calculate the distances from each point and the looking vector
            // coming out of the camera.
            let distData: any[] = [];
            // If there are so many other spheres that it slows down the render
            // loop, consider just looking at the first 100 or so, since it's sorted
            // by distance already.
            for (let i=0; i<deltaVecsToOtherPts.length; i++) {
                let deltaVecToOtherPt = deltaVecsToOtherPts[i];
                let dist = BABYLON.Vector3.Cross(cameraLookingVector, deltaVecToOtherPt).length();
                distData.push([dist, i]);
            }
    
            // Sort by the distance.
            // see https://stackoverflow.com/questions/17043068/how-to-sort-array-by-first-item-in-subarray
            distData.sort(function(a: number, b: number): number {
                if (a[0] < b[0]) {
                    return -1;
                } else if (a[0] > b[0]) {
                    return 1;
                } else {
                    return 0;
                }
            });
    
            // Find the closest point that is > 3.0 away
            for (let i=0; i<distData.length; i++) {
                let dist = distData[i][0];
                let idx = distData[i][1];
                // console.log(idx, dist);
                if (dist > 1.0) {
                    // Put the viewer sphere marker there.
                    let destinationNeighborSphere = Globals.get("destinationNeighborSphere");
                    let neighboringPts = this.neighboringSpheresOrderedByDistance();
            
                    destinationNeighborSphere.position = neighboringPts.get(idx).position;
                    destinationNeighborSphere.isVisible = true;
    
                    break;
                }
            }
    
        }
        */
        resetSphereMeshPosition() {
            if (this.sphereMesh !== null) {
                this.sphereMesh.position = this.position.clone();
            }
        }
    }
    exports.Sphere = Sphere;
});

define('../Spheres/SphereCollection',["require", "exports", "./Sphere", "../config/Globals", "../scene/PVRJsonSetup"], function (require, exports, Sphere_1, Globals, PVRJsonSetup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.spheres = [];
    var _progressBarObj;
    // export var prevViewerSphere: Sphere;
    // export var nextViewerSphere: Sphere;
    var _currentSphere = undefined;
    exports.setCurrentSphereVar = (val) => {
        _currentSphere = val;
        console.log("CURRENT SPHERE:", val);
    };
    var _timeOfLastMove = 0;
    exports.setTimeOfLastMoveVar = () => { _timeOfLastMove = new Date().getTime(); };
    exports.hasEnoughTimePastSinceLastMove = () => {
        let timePassed = new Date().getTime() - _timeOfLastMove;
        return (timePassed > 1000);
    };
    // export var spheresWithAssetsCount: number = 0;  // read only outside this file
    function create() {
        /*
        If dependencies have loaded, creates a collection of Sphere objects. Also
        loads the assets of the appropriate spheres (all of them if no lazy
        loading, select ones otherwise).
        */
        if (Globals.delayExec(create, ["BabylonSceneLoaded", "DataJsonLoadingStarted"], "create", this)) {
            return;
        }
        // Create the sphere objects. Not that this does not load the sphere
        // meshes or textures. To do that, you must call the associated sphere
        // functions explicitly.
        let BABYLON = Globals.get("BABYLON");
        // Get the sphere data from the JSON
        let sphereData = PVRJsonSetup_1.JSONData["spheres"];
        // Make the Sphere objects, add to list.
        for (let i = 0; i < sphereData.length; i++) {
            let sphereDatum = sphereData[i];
            let pt = sphereDatum["position"];
            let position = new BABYLON.Vector3(pt[0], pt[2], pt[1]); // note that Y and Z axes are switched on purpose.
            let textureFilename = sphereDatum["material"]; // filename of the PNG file.
            let meshFilename = sphereDatum["mesh"]; // filename of mesh
            let sphere = new Sphere_1.Sphere(textureFilename, meshFilename, position);
            sphere.index = i;
            exports.spheres.push(sphere);
        }
        // The initial sphere is the first one
        exports.spheres[0].setToCurrentSphere();
        // Start updating the loading progress bar
        // No more progress bar.
        // let jQuery = Globals.get("jQuery");
        // _progressBarObj = jQuery("#loading-progress-bar .progress-bar");
        // _startUpdatingAssetLoadBar();
        // Periodically check current sphere to make sure has best appropriate
        // texture resolution
        setInterval(() => {
            _currentSphere.tryToUpgradeTextureIfAppropriate();
        }, 100);
        // Start loading spheres, one per second.
        // setInterval(_loadNextSphere, 100);
    }
    exports.create = create;
    // function _loadNextSphere() {
    // _currentSphere.loadNextUnloadedAsset();
    // }
    // export function removeExtraSphereTexturesAndMeshesFromMemory() {
    //     // Now check if there are too many spheres. If so, delete some that
    //     // are too far away.
    //     PROBLEM.
    //     let neighborPts = _currentSphere.neighboringSpheresOrderedByDistance();
    //     let lazyLoadCount = Globals.get("lazyLoadCount");
    //     if (spheresWithAssetsCount > lazyLoadCount) {
    //         for (let idx = neighborPts.length() - 1; idx > -1; idx--) {
    //             let cameraPt = neighborPts.get(idx);
    //             let sphere = cameraPt.associatedViewerSphere;
    //             if (sphere.assetsLoaded) {
    //                 sphere.unloadAssets();
    //             }
    //             if (spheresWithAssetsCount <= lazyLoadCount) {
    //                 break;
    //             }
    //         }
    //     }
    // }
    function getByIndex(idx) {
        /*
        Given an index, return the associated sphere.
    
        :param number idx: The index of the desired sphere.
    
        :returns: An Sphere object.
        :rtype: :class:`Sphere`
        */
        return exports.spheres[idx];
    }
    exports.getByIndex = getByIndex;
    function getIndexOfCurrentSphere() {
        return _currentSphere.index;
    }
    exports.getIndexOfCurrentSphere = getIndexOfCurrentSphere;
    function getCurrentSphere() {
        return _currentSphere;
    }
    exports.getCurrentSphere = getCurrentSphere;
    function count() {
        /*
        Get the number of Sphere objects in this collection.
    
        :returns: The number of objects.
        :rtype: :class:`number`
        */
        return exports.spheres.length;
    }
    exports.count = count;
    function hideAll() {
        /*
        Hide all spheres. Helper function.
        */
        for (let i = 0; i < exports.spheres.length; i++) {
            let viewerSphere = exports.spheres[i];
            if (viewerSphere.assetsLoaded === true) {
                viewerSphere.opacity(0.0);
            }
        }
    }
    exports.hideAll = hideAll;
});
// No longer any load bar.
// function _startUpdatingAssetLoadBar(): void {
//     /*
//     Updates the loading bar in the UI depending on the number of textures that
//     have been loaded. Assuming the textures will take longer to load than
//     meshes, so focusing on the bottle neck.
//     */
//     // Might as well put this here, since it's related to the loading of
//     // sphere materials.
//     let numTexturesLoaded = Globals.get("numFrameTexturesLoaded");
//     let numTexturesTotal = count();
//     // Updating the progress bar.
//     let progressVal = Math.round(100 * numTexturesLoaded / numTexturesTotal);
//     _progressBarObj.css("width", Math.min(progressVal, 100).toString() + "%");
//     if ((numTexturesTotal === undefined) || (progressVal < 100)) {
//         setTimeout(() => {
//             _startUpdatingAssetLoadBar();
//         }, 10);
//     } else {
//         let jQuery = Globals.get("jQuery");
//         // Start game button now enabled. Removed this because lazy loading.
//         // jQuery("#start-game").prop("disabled", false);
//         // Hide material-load progress bar.
//         jQuery("#loading-progress-bar").slideUp();
//         // Change the loading-panel title
//         jQuery("#loading-title").html("Game Loaded");
//     }
// }
;
define('../Triggers/Audio',["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class AudioTrigger {
        constructor(frameIdx, mp3File) {
            this._mp3File = "";
            this._frameIdx = frameIdx;
            this._mp3File = mp3File;
            this._BABYLON = Globals.get("BABYLON");
            this._scene = Globals.get("scene");
        }
        check(frameIdx) {
            // Apparently it's already played once.
            if (this._mp3File === "") {
                return;
            }
            // console.log(frameIdx, this._frameIdx, "DDD");
            if (frameIdx === this._frameIdx) {
                // It matches, and it's never played before.
                // Note that this sound is not spatialized.
                var music = new this._BABYLON.Sound("Music" + Math.random().toString(), this._mp3File, this._scene, null, { loop: false, autoplay: true });
                // Only allow it to play once.
                this._mp3File = "";
            }
        }
    }
    exports.AudioTrigger = AudioTrigger;
});

define('../Triggers/Website',["require", "exports", "../config/Globals", "../config/UserVars"], function (require, exports, Globals, UserVars) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WebsiteTrigger {
        constructor(frameIdx, url) {
            this._url = "";
            this._frameIdx = frameIdx;
            this._url = url;
            // this._BABYLON = Globals.get("BABYLON");
            // this._scene = Globals.get("scene");
        }
        check(frameIdx) {
            // Apparently it's already played once.
            if (this._url === "") {
                return;
            }
            // console.log(frameIdx, this._frameIdx, "DDD");
            if (frameIdx === this._frameIdx) {
                // It matches, and it's never been redirected.
                // Add get parameters to the url.
                let url = this._url;
                let toAdd = "?";
                if (url.indexOf("?") !== -1) {
                    toAdd = "&";
                }
                url = url + toAdd + "viewer=" + UserVars.viewers[UserVars.getParam("viewer")].toLowerCase();
                // If currently full screen, next one should be too...
                let engine = Globals.get("engine");
                if (engine.isFullscreen) {
                    url = url + "&fullscreen=true";
                }
                window.location.href = url;
                // Only allow it to transfer once.
                this._url = "";
            }
        }
    }
    exports.WebsiteTrigger = WebsiteTrigger;
});

define('../Triggers/TriggerCollection',["require", "exports", "../Spheres/SphereCollection", "./Audio", "./Website"], function (require, exports, SphereCollection, Audio_1, Website_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _triggers = [];
    function create(triggers) {
        for (let i = 0; i < triggers.length; i++) {
            let trigger = triggers[i];
            let frameIdx = trigger[0];
            let cmd = trigger[1];
            if (cmd.toUpperCase().slice(-4) === ".MP3") {
                _triggers.push(new Audio_1.AudioTrigger(frameIdx, cmd));
            }
            else if (cmd.toUpperCase().slice(0, 4) === "HTTP") {
                _triggers.push(new Website_1.WebsiteTrigger(frameIdx, cmd));
            }
        }
    }
    exports.create = create;
    function checkAll() {
        // Should run on every sphere change.
        for (let i = 0; i < _triggers.length; i++) {
            let trigger = _triggers[i];
            trigger.check(SphereCollection.getIndexOfCurrentSphere());
        }
    }
    exports.checkAll = checkAll;
});

/* Get data about the scene from external json files. */
define('../scene/PVRJsonSetup',["require", "exports", "../config/Globals", "../config/Globals", "./Animations/Animations", "../Triggers/TriggerCollection"], function (require, exports, Globals, Globals_1, Animations, TriggerCollection) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadJSON() {
        /*
        Load data about the scene from external json files.
        */
        let jQuery = Globals.get("jQuery");
        let BABYLON = Globals.get("BABYLON");
        jQuery.get("data.json", (_data) => {
            exports.JSONData = _data;
            // Load data about where to put signs.
            let signData = [];
            for (let i = 0; i < exports.JSONData["signs"].length; i++) {
                signData.push(exports.JSONData["signs"][i]);
            }
            Globals.set("signData", signData);
            // Load animation data
            Globals.set("animationData", exports.JSONData["animations"]);
            Globals.set("firstFrameIndex", exports.JSONData["firstFrameIndex"]);
            Globals.set("lastFrameIndex", exports.JSONData["lastFrameIndex"]);
            Globals.set("nextMoves", exports.JSONData["nextMoves"]);
            if (exports.JSONData["cameraInitialAngle"] !== undefined) {
                Globals.set("cameraInitialAngle", exports.JSONData["cameraInitialAngle"]);
            }
            else {
                Globals.set("cameraInitialAngle", [0.0, 0.0, 0.0]);
            }
            Globals.set("uniqID", exports.JSONData["uniqID"]);
            // Globals.set("triggers", );
            TriggerCollection.create(exports.JSONData["triggers"]);
            if (exports.JSONData["pngFileSizes"] !== undefined) {
                // only defined if you've used optimize.py
                Globals.set("pngFileSizes", exports.JSONData["pngFileSizes"]);
            }
            Globals.milestone("DataJsonLoadingStarted", true);
        });
    }
    exports.loadJSON = loadJSON;
    function afterSceneLoaded() {
        /*
        Runs after the scene has loaded. Adds guid spheres, clickable files,
        animated objects, etc.
        */
        if (Globals.delayExec(afterSceneLoaded, ["BabylonSceneLoaded", "DataJsonLoadingStarted"], "afterSceneLoaded", this)) {
            return;
        }
        // if (Globals.get("debug")) {
        //     _addGuideSpheres();
        // }
        _loadClickableFiles();
        _loadAnimatedObjects();
        Globals.milestone("DataJsonLoadingDone", true);
    }
    exports.afterSceneLoaded = afterSceneLoaded;
    // var _guideSpheres = [];
    // var _guideSphereSize: number = 0.02;
    // function _addGuideSpheres(): void {
    //     /*
    //     Adds guide spheres to the current scene. Useful for debugging. They show
    //     the paths where the camera can move. Doesn't work.
    //     */
    //     let BABYLON = Globals.get("BABYLON");
    //     let scene = Globals.get("scene");
    //     // Add in guide spheres.
    //     let sphereMat = new BABYLON.StandardMaterial("sphereMat" + Math.random().toString(), scene);
    //     sphereMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    //     sphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
    //     sphereMat.diffuseTexture = null;
    //     sphereMat.emissiveTexture = null; //new BABYLON.Texture("dot.png", scene);
    //     sphereMat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
    //     for (let i=0; i<data["viewerSpheres"].count(); i++) {
    //         let sphereLoc = data["viewerSpheres"].getByIndex(i).position;
    //         let sphere = BABYLON.Mesh.CreateDisc("guide_sphere" + i.toString(), 0.05, 12, scene, false, BABYLON.Mesh.DEFAULTSIDE);
    //         sphere.material = sphereMat;
    //         sphere.position.x = sphereLoc[0];
    //         sphere.position.y = sphereLoc[2];  // note y and z reversed.
    //         sphere.position.z = sphereLoc[1];
    //         sphere.renderingGroupId = RenderingGroups.VisibleObjects;
    //         sphere.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    //         _guideSpheres.push(sphere);
    //     }
    // }
    function _loadClickableFiles() {
        /*
        Load and setup clickable objects. These are hidden objects that can be
        clicked. So if the user clicks on an environmental sphere at the right
        location, the correct clicked object can be detected.
        */
        let BABYLON = Globals.get("BABYLON");
        let scene = Globals.get("scene");
        // Load extra obj files
        let loader = new BABYLON.AssetsManager(scene);
        loader.useDefaultLoadingScreen = false;
        let objFilenames = exports.JSONData["clickableFiles"];
        for (let i = 0; i < objFilenames.length; i++) {
            let objFilename = objFilenames[i];
            let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
            meshTask.onSuccess = function (task) {
                let mesh = task.loadedMeshes[0]; // Why is this necessary?
                mesh.scaling.z = -1.0;
                mesh.renderingGroupId = Globals_1.RenderingGroups.ClickableObjects;
                mesh.isPickable = true;
            };
        }
        loader.load();
        // Make those meshes clickable
        _makeSomeMeshesClickable();
    }
    function _loadAnimatedObjects() {
        /*
        Loads objects that are animated.
        */
        let uniqID = window.uniqID;
        let BABYLON = Globals.get("BABYLON");
        let scene = Globals.get("scene");
        let loader = new BABYLON.AssetsManager(scene);
        loader.useDefaultLoadingScreen = false;
        for (var objName in exports.JSONData["animations"]) {
            if (exports.JSONData["animations"].hasOwnProperty(objName)) {
                let objFilename = uniqID + "." + objName + "_mesh.obj";
                let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
                meshTask.onSuccess = function (task) {
                    let mesh = task.loadedMeshes[0]; // Why is this necessary?
                    mesh.scaling.z = -1.0;
                    // Make the id easily accessible by updating id
                    let newID = task.sceneFilename.substring(0, task.sceneFilename.length - 9);
                    newID = newID.substring(uniqID.length + 1);
                    mesh.id = newID;
                    // console.log(mesh);
                    mesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects; // In front of viewer sphere.
                    mesh.isPickable = false;
                    // Load texture here.
                    let mat = new BABYLON.StandardMaterial(mesh.name + "_material" + Math.random().toString(), scene);
                    mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
                    mat.specularColor = new BABYLON.Color3(0, 0, 0);
                    // console.log(uniqID + "." + objName + "_mesh.png");
                    let pngFilename = task.sceneFilename.substring(0, task.sceneFilename.length - 3) + "png";
                    mat.emissiveTexture = new BABYLON.Texture(pngFilename, scene);
                    // mat.emissiveTexture = new BABYLON.Texture(uniqID + "." + mesh.name + "_mesh.png", scene);
                    mat.diffuseTexture = null;
                    mat.backFaceCulling = false;
                    mesh.material = mat;
                    // Setup animations. Currently hard coded. TODO: Need more
                    // elegant solution here!!!
                    let anim = new Animations.Animation(mesh); // , 1, 5, 10);
                    // if (window.mesh ===undefined) {
                    //     window.mesh = mesh;
                    // }
                    // anim.play(1, 5, 10.0);
                    // setInterval(() => {
                    //     anim.updatePos();
                    // }, 10);
                    // window.anim = anim;
                };
            }
        }
        loader.load();
    }
    var _timeOfLastClick = new Date().getTime(); // A refractory period
    function _makeSomeMeshesClickable() {
        /*
        The code that detects mesh clicking.
        */
        let scene = Globals.get("scene");
        // When click event is raised
        window.addEventListener("click", (evt) => {
            let now = new Date().getTime();
            if (now - _timeOfLastClick > 500) {
                _timeOfLastClick = now;
                // We try to pick an object
                var pickResult = scene.pick(evt.clientX, evt.clientY);
                if ((pickResult !== null) && (pickResult.pickedMesh !== null) && (pickResult.pickedMesh.id != "ProteinVR_ViewerSphere")) {
                    console.log(pickResult.pickedMesh.id);
                }
            }
        });
    }
});

define('../scene/Camera/Devices',["require", "exports", "../../config/Globals", "../../config/Globals", "../../Utils"], function (require, exports, Globals, Globals_1, Utils) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.mouseDownState = false;
    exports.keyPressedState = undefined;
    function setup() {
        /*
        Sets up the cameras and controllers, per user-specified parameters.
        */
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        // Load the appropriate camera.
        switch (Globals.get("cameraTypeToUse")) {
            case "show-mobile-virtual-joystick":
                _setupVirtualJoystick(); // This would work great for fully 3D
                // scene. But "forward" isn't just forward. It's change
                // viewersphere. How to detect? You need to detect click.
                // _setupVRDeviceOrientationFreeCamera();  // Doing this for now, because virtual joystick is lame for now.
                break;
            case "show-desktop-screen":
                scene.activeCamera.attachControl(canvas);
                _setInitialCameraAngle(scene.activeCamera);
                break;
            case "show-mobile-vr":
                _setupVRDeviceOrientationFreeCamera();
                break;
            case "show-desktop-vr":
                // And as @Sebavan said, you need a user's interaction to
                // render the scene in the headset (at least required by
                // Chrome as far as I remember, not sure it's specified by
                // the spec). So the below is commented out. It is instead
                // run when the user presses the play button...
                _setupWebVRFreeCamera();
                break;
        }
        _setupMouseAndKeyboard();
    }
    exports.setup = setup;
    function _setupUniversalCamera() {
        // I'm experimenting with a better camera for mobile devices.
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let canvas = Globals.get("canvas");
        // var camera = new BABYLON.VirtualJoysticksCamera("VJC", scene.activeCamera.position, scene);
        var camera = new BABYLON.UniversalCamera("UniversalCamera", scene.activeCamera.position, scene);
        camera.rotation = scene.activeCamera.rotation;
        _makeCameraReplaceActiveCamera(camera);
    }
    function _setupVirtualJoystick() {
        /*
        Sets up a virtual joystick. Good for users on phones who don't have
        google cardboard.
        */
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let canvas = Globals.get("canvas");
        var camera = new BABYLON.VirtualJoysticksCamera("VJC", scene.activeCamera.position, scene);
        camera.rotation = scene.activeCamera.rotation;
        _setInitialCameraAngle(camera);
        _makeCameraReplaceActiveCamera(camera);
    }
    function _setupVRDeviceOrientationFreeCamera() {
        /*
        Sets up a VRDeviceOrientationFreeCamera. Good for folks on phones who
        have google cardboard.
        */
        let scene = Globals.get("scene");
        let engine = Globals.get("engine");
        let BABYLON = Globals.get("BABYLON");
        // I feel like I should have to do the below... Why don't the defaults work?
        var metrics = BABYLON.VRCameraMetrics.GetDefault();
        //metrics.interpupillaryDistance = 0.5;
        // Add VR camera here (google cardboard). 
        let camera = new BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", scene.activeCamera.position, scene, false, // compensate distortion. False = good anti-aliasing.
        metrics);
        console.log(camera);
        // camera._onPointerMove = function (e) {
        //     console.log("moo hi");
        // }
        jQuery("html").click(() => {
            // Sometimes it doesn't go full screen on mobile...
            goFullScreen(engine);
        });
        _makeCameraReplaceActiveCamera(camera);
    }
    function _setupWebVRFreeCamera() {
        /*
        Sets up the WebVR camera. Good for folks using Oculus Rift or HTC Vive
        on their desktops.
        */
        // This code untested, but designed for stuff like Oculus rift.
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        let BABYLON = Globals.get("BABYLON");
        let jQuery = Globals.get("jQuery");
        // I feel like I should have to do the below... Why don't the defaults work?
        // var metrics = BABYLON.VRCameraMetrics.GetDefault();
        // According to this page, best practices include feature detection to
        // pick the camera: http://playground.babylonjs.com/#QWIJYE#1 ;
        // http://www.html5gamedevs.com/topic/31454-webvrfreecameraid-vs-vrdeviceorientationfreecamera/?tab=comments#comment-180688
        let camera;
        if (navigator.getVRDisplays) {
            camera = new BABYLON.WebVRFreeCamera("webVRFreeCamera", scene.activeCamera.position, scene
            // false,  // compensate distortion
            // { trackPosition: true }
            // metrics
            );
            // camera.deviceScaleFactor = 1;
        }
        else {
            camera = new BABYLON.VRDeviceOrientationFreeCamera("deviceOrientationCamera", scene.activeCamera.position, scene
            // false,  // compensate distortion. False = good anti-aliasing.
            // metrics
            );
        }
        // Keep the below because I think I'll use it in the future...
        // Detect when controllers are attached.
        // camera.onControllersAttachedObservable.add(function() {
        //     console.log(camera.controllers, "DFDF")
        //     camera.controllers.forEach(function(gp) {
        //         console.log(gp);
        //         // console.log("YO", gp);
        //         // let mesh = gp.hand === 'right' ? rightBox : leftBox;
        //         // gp.onPadValuesChangedObservable.add(function (stateObject) {
        //             // let r = (stateObject.x + 1) / 2;
        //             // let g = (stateObject.y + 1) / 2;
        //             // mesh.material.diffuseColor.copyFromFloats(r, g, 1);
        //         // });
        //         // gp.onTriggerStateChangedObservable.add(function (stateObject) {
        //             // let scale = 2 - stateObject.value;
        //             // mesh.scaling.x = scale;
        //         // });
        //         // oculus only
        //         /*gp.onSecondaryTriggerStateChangedObservable.add(function (stateObject) {
        //             let scale = 2 - stateObject.value;
        //             mesh.scaling.z = scale;
        //         });*/
        //         // gp.attachToMesh(mesh);
        //     });
        // });
        // Detect when controllers are attached. Dumb that I can't get onControllersAttachedObservable to work.
        setInterval(() => {
            if (camera.controllers !== undefined) {
                for (let i = 0; i < camera.controllers.length; i++) {
                    let mesh = camera.controllers[i]._mesh;
                    if (mesh !== undefined) {
                        mesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
                        for (let j = 0; j < mesh._children.length; j++) {
                            let childMesh = mesh._children[j];
                            childMesh.renderingGroupId = Globals_1.RenderingGroups.VisibleObjects;
                        }
                    }
                }
            }
        }, 1000);
        // note that you're not calling _makeCameraReplaceActiveCamera. That's
        // because that will attach the camera, but you don't want that to
        // happen until after user clicks again.
        scene.activeCamera = camera;
        scene.onPointerDown = () => {
            scene.onPointerDown = undefined;
            // scene.onPointerDown = () => {
            //     camera.initControllers();
            // }
            // Attach that camera to the canvas.
            scene.activeCamera.attachControl(canvas, true);
            // In case they want to look through desktop VR but navigate with mouse?
            _setupMouseClick();
            // Make it full screen if possible
            fullscreenIfNecessary();
        };
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        // var rightBox = BABYLON.Mesh.CreateBox("sphere1", 0.1, scene);
        // rightBox.scaling.copyFromFloats(2, 1, 2);
        // var leftBox = BABYLON.Mesh.CreateBox("sphere1", 0.1, scene);
        // leftBox.scaling.copyFromFloats(2, 1, 2);
        // rightBox.material = new BABYLON.StandardMaterial('right', scene);
        // leftBox.material = new BABYLON.StandardMaterial('right', scene);
        // rightBox.renderingGroupId = RenderingGroups.VisibleObjects;
        // leftBox.renderingGroupId = RenderingGroups.VisibleObjects;
    }
    exports._setupWebVRFreeCamera = _setupWebVRFreeCamera;
    function _makeCameraReplaceActiveCamera(camera) {
        /*
        Attaches the camera to the scene, among other things. Note that this
        isn't used for WebVR camera, which must be attached to the canvas on
        user click.
    
        :param any camera: The BABYLON camera to attach.
        */
        let scene = Globals.get("scene");
        let canvas = Globals.get("canvas");
        // Make VR camera match existing camera in scene
        // See http://www.babylonjs.com/js/loader.js
        if (scene.activeCamera.rotation) {
            camera.rotation = scene.activeCamera.rotation.clone();
        }
        camera.fov = scene.activeCamera.fov;
        camera.minZ = scene.activeCamera.minZ;
        camera.maxZ = scene.activeCamera.maxZ;
        if (scene.activeCamera.ellipsoid) {
            camera.ellipsoid = scene.activeCamera.ellipsoid.clone();
        }
        camera.checkCollisions = scene.activeCamera.checkCollisions;
        camera.applyGravity = scene.activeCamera.applyGravity;
        camera.speed = scene.activeCamera.speed;
        // Now remove the original camera
        scene.activeCamera.detachControl(canvas);
        if (scene.activeCamera.dispose) {
            scene.activeCamera.dispose();
        }
        // Set the new (VR) camera to be active
        scene.activeCamera = camera;
        // Attach that camera to the canvas.
        scene.activeCamera.attachControl(canvas, true);
    }
    function _setupMouseAndKeyboard() {
        /*
        Setup mouse and keyboard navigation.
        */
        let scene = Globals.get("scene");
        // TODO: Commented out for WebVR debugging. This should be attached
        // after initial WebVR canvas-attach click.
        // First, setup mouse.
        if (Globals.get("cameraTypeToUse") !== "show-desktop-vr") {
            // Because if it's desktop VR, this function will be bound AFTER the first click (which starts the VR camera).
            _setupMouseClick();
        }
        // Now keyboard
        // No arrow navigation on camera. You'll redo custom.
        scene.activeCamera.keysUp = [];
        scene.activeCamera.keysLeft = [];
        scene.activeCamera.keysDown = [];
        scene.activeCamera.keysRight = [];
        window.addEventListener("keydown", function (evt) {
            exports.keyPressedState = evt.keyCode;
            // Make it full screen if possible
            fullscreenIfNecessary();
        }.bind(this));
        window.addEventListener("keyup", function (evt) {
            exports.keyPressedState = undefined;
            // Make it full screen if possible
            fullscreenIfNecessary();
        }.bind(this));
        // Add extra keys
        // Additional control keys.
        // TODO: Some reason this is commented out? Good to investigate...
        // _parentObj.scene.activeCamera.keysUp.push(87);  // W. 38 is up arrow.
        // _parentObj.scene.activeCamera.keysLeft.push(65);  // A. 37 if left arrow.
        // _parentObj.scene.activeCamera.keysDown.push(83);  // S. 40 is down arrow.
        // _parentObj.scene.activeCamera.keysRight.push(68);  // D. 39 is right arrow.
    }
    function _setupMouseClick() {
        /*
        Setup mouse clicking. Separate from above function to work with HTC Vive too (not bound until after initial click).
        */
        let scene = Globals.get("scene");
        let jQuery = Globals.get("jQuery");
        // Below works with everything but virtual joysticks
        scene.onPointerDown = function (evt, pickResult) {
            exports.mouseDownState = true;
            // Make it full screen if possible
            fullscreenIfNecessary();
        }.bind(this);
        scene.onPointerUp = function (evt, pickResult) {
            exports.mouseDownState = false;
            // Make it full screen if possible
            fullscreenIfNecessary();
        }.bind(this);
        // This works with virtual joysticks on safari, for example.
        // if (Globals.get("cameraTypeToUse") === "show-mobile-virtual-joystick") {
        //     jQuery(document).ready(() => {
        //         alert("okddd");
        //         jQuery(window).mousedown(() => {
        //             mouseDownState = true;
        //             console.log("yo2");
        //         });
        //         jQuery(window).mouseup(() => {
        //             mouseDownState = false;
        //         });
        //     })
        // }
    }
    var _urlSaysFullScreen = undefined;
    function fullscreenIfNecessary() {
        // Is it not full screen but it should be? This is the one that makes it
        // go full screen based on the url.
        let engine = Globals.get("engine");
        if (_urlSaysFullScreen === undefined) {
            if (Utils.userParam("fullscreen") === "true") {
                _urlSaysFullScreen = true;
            }
            else {
                _urlSaysFullScreen = false;
            }
        }
        if ((_urlSaysFullScreen) && (engine.isFullscreen === false)) {
            goFullScreen(engine);
        }
    }
    function goFullScreen(engine) {
        engine.switchFullscreen(true);
        if (Globals.get("cameraTypeToUse") !== "show-mobile-virtual-joystick") {
            // The below makes safari desktop work.
            // It doens't effect chrome desktop.
            // It messes up the virtual joystick.
            // Gets it to work in safari desktop, but breaks mobile virtual joy
            // sticks. Good for mobile VR headset because makes bar go away.
            engine.isPointerLock = true;
        }
        // engine.isFullscreen
        jQuery("html").css("cursor", "none"); // Important for safari
    }
    exports.goFullScreen = goFullScreen;
    function _setInitialCameraAngle(camera) {
        // Sets the angle on the specified camera to the same angle as the first
        // frame in Blender prior to export. Not used for cameras that determine
        // their orientation based on position.
        let cameraInitialAngle = Globals.get("cameraInitialAngle");
        camera.rotation.x = cameraInitialAngle[0];
        camera.rotation.y = cameraInitialAngle[1];
        camera.rotation.z = cameraInitialAngle[2];
    }
});

/* Things related to camera setup and movement. */
define('../scene/Camera/Camera',["require", "exports", "../../config/Globals", "../Arrows", "../../Spheres/SphereCollection", "./Devices", "../../Spheres/Material"], function (require, exports, Globals, Arrows, SphereCollection, Devices, Material_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var BABYLON;
    var isMobile;
    var _firstRender = true;
    var _lastCameraRotation;
    var _lastCameraRotationCheckTimestamp = 0;
    var _msBetweenCameraAngleChecks = 500;
    function setup() {
        /*
        Sets up the camera.
        */
        if (Globals.delayExec(setup, ["UserSettingsSpecifiedDialogClosed",
            "DataJsonLoadingDone"], "setup", this)) {
            return;
        }
        let scene = Globals.get("scene");
        let engine = Globals.get("engine");
        BABYLON = Globals.get("BABYLON");
        isMobile = Globals.get("isMobile");
        let jQuery = Globals.get("jQuery");
        _lastCameraRotation = new BABYLON.Vector3(0, 0, 0);
        _lastCameraRotationCheckTimestamp = new Date().getTime();
        // Set up the camera type (HTC Vive, for example) and input (keyboard,
        // mouse, etc.)
        Devices.setup();
        // First frame is initially visible.
        let firstSphere = SphereCollection.getByIndex(0);
        firstSphere.opacity(1.0);
        // Camera starts at location of first frame.
        scene.activeCamera.position = firstSphere.position.clone();
        _nextMovementVec = new BABYLON.Vector3(0, 0, 0);
        _startingCameraInMotion_ViewerSphere = firstSphere;
        _startingCameraInMotion_Position = _startingCameraInMotion_ViewerSphere.position.clone();
        _endingCameraInMotion_ViewerSphere = firstSphere;
        // Setup first steps forward
        _cameraJustFinishedBeingInMotion(scene.activeCamera);
        // Add blur post processes that can be turned on and off. Only if not mobile.
        if (!isMobile) {
            let blurPipeline = new BABYLON.PostProcessRenderPipeline(engine, "blurPipeline");
            let kernel = 12.0;
            var horizontalBlur = new BABYLON.PostProcessRenderEffect(engine, "horizontalBlurEffect", function () {
                return new BABYLON.BlurPostProcess("hb", new BABYLON.Vector2(1.0, 0), kernel, 1.0, null, null, engine, false);
            });
            var verticalBlur = new BABYLON.PostProcessRenderEffect(engine, "verticalBlurEffect", function () {
                return new BABYLON.BlurPostProcess("vb", new BABYLON.Vector2(0, 1.0), kernel, 1.0, null, null, engine, false);
            });
            // var antiAlias = new BABYLON.PostProcessRenderEffect(engine, "antialias", function() { 
            //     return new BABYLON.FxaaPostProcess(
            //         "aa", 5.0, null, null, engine, false
            //     )
            // });
            blurPipeline.addEffect(horizontalBlur);
            blurPipeline.addEffect(verticalBlur);
            // blurPipeline.addEffect(antiAlias);
            scene.postProcessRenderPipelineManager.addPipeline(blurPipeline);
            scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("blurPipeline", scene.activeCamera);
            blur(false);
        }
        Globals.milestone("CameraSetup", true);
        // Debug. Periodically output what the current material is.
        // setInterval(() => {
        //     console.log(SphereCollection.getCurrentSphere().material.material);
        // }, 5000);
        // If there's something in the url, the auto advance (parameters in url)
    }
    exports.setup = setup;
    function blur(val) {
        if ((isMobile) && (val)) {
            // No blur effect if it's mobile. So never turn it on.
            return;
        }
        let scene = Globals.get("scene");
        switch (val) {
            case true:
                // console.log("Blurring");
                scene.postProcessRenderPipelineManager.enableEffectInPipeline("blurPipeline", "horizontalBlurEffect", scene.activeCamera);
                scene.postProcessRenderPipelineManager.enableEffectInPipeline("blurPipeline", "verticalBlurEffect", scene.activeCamera);
                // scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("blurPipeline", scene.activeCamera);
                // scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("blurPipeline", scene.activeCamera);        
                break;
            case false:
                // console.log("Unblurrng");
                scene.postProcessRenderPipelineManager.disableEffectInPipeline("blurPipeline", "horizontalBlurEffect", scene.activeCamera);
                scene.postProcessRenderPipelineManager.disableEffectInPipeline("blurPipeline", "verticalBlurEffect", scene.activeCamera);
                break;
        }
    }
    exports.blur = blur;
    var _speedInUnitsPerSecond = 1;
    var _lastMovementTime = (new Date).getTime();
    var _msUntilNextMoveAllowed = 0;
    var _nextMovementVec; // BABYLON.Vector3
    var _startingCameraInMotion_Position; // BABYLON.Vector3 
    var _startingCameraInMotion_ViewerSphere;
    var _endingCameraInMotion_ViewerSphere;
    // var _cameraCurrentlyInMotion: boolean = false;
    var _troublesLoading = false;
    var _currentlyMoving = false;
    function update() {
        /*
        Update the camera. This is run from the render loop (every frame).
        */
        // console.log("1");
        // console.log(SphereCollection.getCurrentSphere().material.material);
        // window.currentSphere = SphereCollection.getCurrentSphere();
        // if (SphereCollection.getCurrentSphere().sphereMesh === null) {
        //     // console.log(SphereCollection.getCurrentSphere().sphereMesh.isVisible);
        //     console.log("prob!");
        //     _troublesLoading = true;
        //     // let t = SphereCollection.getCurrentSphere();
        //     // debugger;
        //     return;
        // }
        // if (_troublesLoading) {
        //     _troublesLoading = false;
        //     SphereCollection.getCurrentSphere().sphereMesh.isVisible = true;
        //     // console.log(SphereCollection.getCurrentSphere().sphereMesh.isVisible);
        // }
        if (_startingCameraInMotion_ViewerSphere === undefined) {
            // Not ready yet... PNG images probably not loaded.
            return;
        }
        let scene = Globals.get("scene");
        let camera = scene.activeCamera;
        // if (newCameraRotation.equalsWithEpsilon(_lastCameraRotation, 0.3)) {  // Allow for about 10 degree deviation (0.3 when you do the math). Because with VR headset there will always be a little movement.
        //     _lastCameraRotation = newCameraRotation;
        // }
        // Get the time that's elapsed since this function was last called.
        // There's a refractoty period between movements... don't move unless
        // enough time has passed. This is needed because the camera automatically
        // moves between camera points. While in motion, you can't initiate
        // another motion.
        let curTime = new Date().getTime();
        let deltaTime = curTime - _lastMovementTime;
        // console.log(deltaTime, _msUntilNextMoveAllowed);
        // console.log("2");
        // console.log(deltaTime, "<", _msUntilNextMoveAllowed, "SS");
        if (_currentlyMoving) {
            if (deltaTime < _msUntilNextMoveAllowed) {
                // Not enough time has passed to allow another movement.
                // _cameraCurrentlyInMotion = true;
                _whileCameraInMotion(deltaTime, camera);
                return;
            }
            else {
                // Enough time has passed that the camera should no longer be in
                // motion. This must be the first time this function has been
                // called since a refractory period ended. 
                // So the camera isn't really in motion anymore.
                // _cameraCurrentlyInMotion = false;
                // Run a function for first-time moving allowed.
                _cameraJustFinishedBeingInMotion(camera); // This sets _currentlyMoving to false
            }
        }
        // You're not translating, but are you look around much (within a
        // tolerance)? This is used elsewhere to load in high-res tetures.
        if (curTime - _lastCameraRotationCheckTimestamp > _msBetweenCameraAngleChecks) {
            _lastCameraRotationCheckTimestamp = curTime;
            let newCameraRotation = camera.rotation.clone();
            let dist = BABYLON.Vector3.Distance(newCameraRotation, _lastCameraRotation);
            if (dist > 0.05) {
                SphereCollection.setTimeOfLastMoveVar();
            }
            _lastCameraRotation = newCameraRotation;
        }
        // NOTE: If you get here, you're ready to move again.
        // If you're not moving, it's okay to show the navigation looking spheres.
        // This is for advanced navigation system.
        // let currentSphere: Sphere = SphereCollection.getCurrentSphere();
        // currentSphere.getOtherSphereLookingAt();
        // Make sure the camera location doesn't depend on camera input.
        // Especially useful for keeping the virtual joystick from wandering off.
        camera.position = SphereCollection.getCurrentSphere().position.clone();
        // So it's time to pick a new destination. But don't even try if the user
        // doesn't want to move (i.e., no active keypress our mousedown.) Maybe
        // they're looking around, not moving.
        // If the left joystick is pressed, trigger move forward.
        let leftTriggerDownState = false;
        if (Globals.get("cameraTypeToUse") === "show-mobile-virtual-joystick") {
            leftTriggerDownState = camera.inputs.attached.virtualJoystick._leftjoystick.pressed;
        }
        let result;
        if (Globals.get("mouseDownAdvances") === true) {
            result = ((Devices.mouseDownState === false) &&
                (Devices.keyPressedState === undefined) &&
                (leftTriggerDownState === false) &&
                (_firstRender === false));
        }
        else {
            result = ((Devices.keyPressedState === undefined) &&
                (leftTriggerDownState === false) &&
                (_firstRender === false));
        }
        if (result) {
            return;
        }
        // If you get here, you're ready to start moving, and the user
        // actually wants to move.
        _cameraPickDirectionAndStartInMotion(camera);
        if (_firstRender) {
            blur(false); // Make sure not initially blurred.
        }
        _firstRender = false; // It's no longer the first time rendering.
    }
    exports.update = update;
    function _getCameraTarget(camera) {
        if (Globals.get("cameraTypeToUse") === "show-desktop-vr") {
            // A rigged camera. Average two looking vectors.
            var leftCamera = camera.leftCamera;
            var rightCamera = camera.rightCamera;
            var vec1 = leftCamera.getTarget().subtract(leftCamera.position).normalize();
            var vec2 = rightCamera.getTarget().subtract(rightCamera.position).normalize();
            return vec1.add(vec2).scale(0.5).normalize();
        }
        else {
            return camera.getTarget();
        }
    }
    function lookingVector(camera = undefined) {
        if (camera === undefined) {
            camera = Globals.get("scene").activeCamera;
        }
        let targetPoint = _getCameraTarget(camera);
        let lookingVec = targetPoint.subtract(camera.position).normalize();
        return lookingVec;
    }
    exports.lookingVector = lookingVector;
    function _cameraPickDirectionAndStartInMotion(camera) {
        /*
        Start the moving process from one sphere to the next. This function is
        fired only once, at beginning of moving (not every frame). This is called
        only once at the beinning of the moving cycle (not every frame).
    
        :param ??? camera: The BABYLON camera.
        */
        // Note that at this point, it is _endingCameraInMotion that is the one
        // you're currently on. You haven't yet switched them... confusing...
        // Blur the camera ("motion blur"). Also helps with lowres images during
        // transition. It will be unblurred when high-res image-load attempt is
        // made.
        blur(true);
        // Make sure everything hidden but present sphere.
        SphereCollection.hideAll();
        _endingCameraInMotion_ViewerSphere.opacity(1.0);
        // pick the direction you'll move (based on nearby points, direction of
        // camera, etc.)
        let focalPoint = camera.position;
        // Here needs to be a .copy(), because you might be changing the list
        // (eliinating ones with bad angles, for example, which you wouldn't do
        // when rending arrows).
        let _closeCameraPoints = _endingCameraInMotion_ViewerSphere.navigationNeighboringSpheresOrderedByDistance().copy();
        // Start by assuming new camera point should be the closest point.
        let newCameraPoint = _closeCameraPoints.firstPoint();
        let maxDist = _closeCameraPoints.data[_closeCameraPoints.data.length - 1].distance;
        // Assign angles
        let lookingVec = lookingVector(camera);
        switch (Devices.keyPressedState) {
            case 83:
                lookingVec = lookingVec.scale(-1);
                break;
            case 40:
                lookingVec = lookingVec.scale(-1);
                break;
        }
        // Calculate angles between camera looking vector and the various
        // candidate camera locations.
        _closeCameraPoints.addAnglesInPlace(focalPoint, lookingVec);
        // Throw out candidate camera locations that aren't even in the
        // general direction as the lookingVec
        let goodAngleCameraPoints = _closeCameraPoints.lessThanCutoff(1.9198621771937625, "angle"); // 110 degrees
        switch (goodAngleCameraPoints.length()) {
            case 0:
                // You must be at the end of a path. Keep previous newCameraPoint
                // calculated above (closest one);
                break;
            case 1:
                // Only one left, so it must be the one to keep.
                newCameraPoint = goodAngleCameraPoints.firstPoint();
                break;
            default:
                // assign scores to camera data, keep one with best score.
                goodAngleCameraPoints.addScoresInPlace(1.57, maxDist); // 1.57 = 90 degrees
                goodAngleCameraPoints.sort("score");
                newCameraPoint = goodAngleCameraPoints.firstPoint();
                break;
        }
        // If the new viewer sphere doesn't have a texture, abort!
        // Same if it doesn't have a sphere mesh or something.
        let nextCamAssociatedViewerSphere = newCameraPoint.associatedViewerSphere;
        if ((nextCamAssociatedViewerSphere.material.textureType === Material_1.TextureType.None) ||
            (!nextCamAssociatedViewerSphere.assetsLoaded)) {
            // (SphereCollection.getCurrentSphere().sphereMesh !== null)) {
            console.log("** Aborted movement, texture not yet loaded...");
            // Try to load the texture.
            nextCamAssociatedViewerSphere.loadAssets();
            // newCameraPoint.associatedViewerSphere.loadAssets();
            blur(false);
            // Make sure everything hidden but present sphere.
            // SphereCollection.hideAll();
            // newCameraPoint.associatedViewerSphere.opacity(1.0);
            _msUntilNextMoveAllowed = 0; // allow movement in a bit.
            return;
        }
        // Set values to govern next in-motion transition (old ending becomes new
        // starting. New ending is new picked sphere location).
        _startingCameraInMotion_ViewerSphere = _endingCameraInMotion_ViewerSphere;
        _endingCameraInMotion_ViewerSphere = newCameraPoint.associatedViewerSphere;
        // Keep track of where to move from. You can't just use the starting
        // sphere, because that will track the camera until it disappears.
        _startingCameraInMotion_Position = _startingCameraInMotion_ViewerSphere.position.clone();
        // Calculate which direction to move.
        _nextMovementVec = newCameraPoint.position.subtract(_startingCameraInMotion_ViewerSphere.position);
        // Calculate timing variables to govern movement.
        // console.log(newCameraPoint.distance);
        // _msUntilNextMoveAllowed = Math.max(1000 * newCameraPoint.distance / _speedInUnitsPerSecond, 100);
        _msUntilNextMoveAllowed = 1000 * newCameraPoint.distance / _speedInUnitsPerSecond;
        // Put limits on time between frames. It should never be more than 0.5
        // sec, independent of units per sec.
        if (_msUntilNextMoveAllowed > 500) {
            _msUntilNextMoveAllowed = 500;
        }
        // Make sure not too fast, too. Need to give time to buffer.
        if (_msUntilNextMoveAllowed < 50) {
            _msUntilNextMoveAllowed = 50;
        }
        _lastMovementTime = (new Date).getTime();
        // console.log("starting", newCameraPoint.position, _startingCameraInMotion_ViewerSphere.position, newCameraPoint.distance); // , _msUntilNextMoveAllowed, _nextMovementVec);
        _currentlyMoving = true;
    }
    function _whileCameraInMotion(deltaTime, camera) {
        /*
        Runs every frame while the camera is transitioning from one valid
        camera location to the next.
    
        :param number deltaTime: The time since the camera started moving.
    
        :param ??? camera: The BABYLON camera.
        */
        // Still in auto-moving phase. So auto-move here.
        let timeRatio = deltaTime / _msUntilNextMoveAllowed;
        // console.log(timeRatio);
        // let sigmoidalVal = 1.0/(1.0 + Math.exp(-(20 * timeRatio - 10)))
        // let sinVal = 0.5 + 0.5 * Math.sin(Math.PI * (timeRatio - 0.5));
        _updateInterpolatedPositionWhileInMotion(timeRatio, camera);
        // fade out arrows with each move... looks good.
        Arrows.fadeDownAll(1.0 - timeRatio);
        // Move skybox sphere too. It alwayd tracks the camera exactly (i.e.,
        // fixed relative to the camera).
        let skyboxSphere = Globals.get("skyboxSphere");
        skyboxSphere.position = camera.position;
    }
    // The point at which the destination sphere starts to fade in.
    let _transitionPt1 = 0.35; //0.05;  // This is really scene specific. This seems like a good compromise.
    // The point at which the current sphere starts to fade out. This is also
    // the point where the destination sphere is fully opaque.
    let _transitionPt2 = 0.75; //0.1;  // Good for this to be hard-coded eventually.
    // The point at whch the current sphere has finished fading out.
    let _transitionPt3 = 0.99; //0.8;
    let _transitionDelta1 = _transitionPt2 - _transitionPt1;
    let _transitionDelta2 = (_transitionPt2 - _transitionPt3);
    function _updateInterpolatedPositionWhileInMotion(timeRatio, camera) {
        /*
        Function that determines sphere visibility and camera location as the
        user moves between two locations.
    
        :param number timeRatio: A number between 0.0 and 1.0, showing how far
                        along the user is between the previous sphere location and the next
                        one.
                        
        :param ??? camera: The BABYLON camera object.
        */
        // This is separate from the _whileCameraInMotion function because it is
        // also called elsewhere.
        // Make sure camera you're transitioning to is always fully visible (but
        // hidden behind current sphere, which starts out visible too.)
        // _endingCameraInMotion_ViewerSphere.opacity(1.0);
        _endingCameraInMotion_ViewerSphere.opacity(Math.max(0.0, Math.min(1.0, (timeRatio - _transitionPt1) / _transitionDelta1)));
        _startingCameraInMotion_ViewerSphere.opacity(Math.max(0.0, Math.min(1.0, (timeRatio - _transitionPt3) / _transitionDelta2))); //  / (1 - transitionPt);
        camera.position = _startingCameraInMotion_Position.add(_nextMovementVec.scale(timeRatio));
        // _startingCameraInMotion_ViewerSphere must track the camera until it
        // disappears. It's position is reset elsewhere (when done moving).
        // console.log(_startingCameraInMotion_ViewerSphere.sphereMesh, camera);
        if (_startingCameraInMotion_ViewerSphere.sphereMesh !== null) {
            _startingCameraInMotion_ViewerSphere.sphereMesh.position = camera.position;
        } /* else {
            console.log("_startingCameraInMotion_ViewerSphere.sphereMesh.position === null!!!");
        }*/
        // The current viewer sphere needs to be moving with you!!!
        // console.log(camera.position.x, _startingCameraInMotion_ViewerSphere.position.x, _endingCameraInMotion_ViewerSphere.position.x);
    }
    function _cameraJustFinishedBeingInMotion(camera) {
        /*
        Runs once when the camera finishes transitioning from one valid camera
        location to the next.
    
        :param ??? camera: The BABYLON camera.
        */
        // console.log("=======");
        // console.log("ending");
        // Unblur the camera.
        blur(false);
        // Make sure completed transition to full visibility.
        _updateInterpolatedPositionWhileInMotion(1.0, camera);
        // Reset the positions of the spheres. Because the starting sphere was
        // tracking the camera.
        _endingCameraInMotion_ViewerSphere.resetSphereMeshPosition();
        _startingCameraInMotion_ViewerSphere.resetSphereMeshPosition();
        // Set up new navigation arrows for new position.
        Arrows.update(_endingCameraInMotion_ViewerSphere.navigationNeighboringSpheresOrderedByDistance());
        // Set the current sphere to this one.
        _endingCameraInMotion_ViewerSphere.setToCurrentSphere();
        // Make sure environmental sphere properly positioned.
        // console.log(Globals.get("skyboxSphere"));  // *****
        Globals.get("skyboxSphere").position = camera.position;
        _currentlyMoving = false;
    }
});

define('../main',["require", "exports", "./config/UserVars", "./config/SettingsPanel", "./scene/Setup", "./config/Globals", "./scene/PVRJsonSetup", "./scene/Camera/Camera", "./Spheres/SphereCollection", "./Utils", "./scene/Camera/Devices"], function (require, exports, UserVars, SettingsPanel, SceneSetup, Globals, PVRJsonSetup, Camera, SphereCollection, Utils, Devices) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Globals.set("jQuery", jQuery);
    Globals.set("BABYLON", BABYLON);
    var callbacksComplete = [];
    var callBacks;
    (function (callBacks) {
        callBacks[callBacks["SCENE_READY"] = 0] = "SCENE_READY";
        callBacks[callBacks["VIDEO_FRAMES_LOADED"] = 1] = "VIDEO_FRAMES_LOADED";
        callBacks[callBacks["JSON_LOADED"] = 2] = "JSON_LOADED";
    })(callBacks || (callBacks = {}));
    class Game {
        constructor(params) {
            /*
            The Game object constructor.
    
            :param obj params: The init parameters.
            */
            this._params = params;
            // Detect mobile.
            let isMobile = new MobileDetect(window.navigator.userAgent).mobile();
            isMobile = ((isMobile === null) || (isMobile === false)) ?
                false : true; // keep it boolean
            if (Globals.get("debug")) {
                isMobile = true;
            }
            Globals.set("isMobile", isMobile);
            // Ignore below for now. We're not going to show this screen.
            // if (isMobile) {
            //     // Show mobile_data_warning_panel if it is mobile.
            //     this._showDataUseWarningPanel(isMobile);
            // } else {
            //     // Proceed with loading the game.
            //     this._loadGame(isMobile);
            // }
            this._loadGame(isMobile);
        }
        _loadGame(isMobile) {
            /*
            Start loading the game.
    
            :param bool isMobile: Whether the game is running in mobile.
            */
            if (!BABYLON.Engine.isSupported()) {
                alert("ERROR: Babylon not supported!");
            }
            else {
                // Bring in the loading panel... Why is this code here first,
                // given that the settings panel is the first to appear in the UI?
                // Because we need to start loading the scene ASAP, especially if
                // no lazy-loading is specified. Note that the loading panel is
                // always hidden by default, so all this happens without the
                // user's knowledge.
                this._showLoadingGamePanel();
                // Get the canvas element from our HTML above
                Globals.set("canvas", document.getElementById("renderCanvas"));
                // Set the engine
                this._resizeWindow(); // resize canvas when browser resized.
                let engine = new BABYLON.Engine(Globals.get("canvas"), true);
                Globals.set("engine", engine); // second boolean is whether built-in smoothing will be used.
                window.engine = engine; // for debugging.
                // Note that these functions are all "smart" in that they won't
                // run unless previous milestones are met. I thought this was
                // better than callbacks, and using promises got ackward too.
                // Tricky when you have so many interdependencies.
                // Collect user variables (default and specified)
                UserVars.setupDefaults();
                SettingsPanel.allowUserToModifySettings();
                // Load babylon file and set up scene.
                SceneSetup.loadBabylonFile();
                // Load proteinVR-specific json file, in two parts because certain
                // dependencies required for second half but not first.
                PVRJsonSetup.loadJSON();
                PVRJsonSetup.afterSceneLoaded();
                // Create the sphere objects (but doesn't necessarily load
                // textures and meshes).
                SphereCollection.create();
                // Set up the camera.
                Camera.setup();
            }
        }
        _showDataUseWarningPanel(isMobile) {
            /*
            Show mobile_data_warning_panel.
    
            :param bool isMobile: Whether the game is running in mobile.
            */
            jQuery("#mobile_data_warning_panel").load("./_filesize_warning.html", () => {
                // Hide the settings panel for now
                jQuery("#settings_panel").hide();
                // Get the size of all the mobile-compatible png files.
                jQuery.get("frames/filesizes.json", (filesizes) => {
                    jQuery("#filesize-total").html((filesizes["small"] / 1000000).toFixed(1));
                });
                // Make the ok-to-proceed button work.
                jQuery("#filesize-warning-button").click(() => {
                    jQuery("#mobile_data_warning_panel").fadeOut(() => {
                        jQuery("#settings_panel").fadeIn();
                        this._loadGame(isMobile); // Proceed with loading the game.
                    });
                });
            });
        }
        _showLoadingGamePanel() {
            /*
            Show the game-loading panel. When the game is loaded, the user can
            press the start-game button, and the render loop begins.
            */
            // Bring in the loading panel... Why is this code here first, given
            // that the settings panel is the first to appear in the UI? Because
            // we need to start loading the scene ASAP, especially if no
            // lazy-loading is specified.
            jQuery("#loading_panel").load("./_loading.html", () => {
                jQuery("#start-game").click(() => {
                    let engine = Globals.get("engine");
                    let canvas = jQuery("canvas");
                    let scene = Globals.get("scene");
                    jQuery("#loading_panel").hide(); // fadeOut(() => {
                    canvas.show();
                    canvas.focus(); // to make sure keypresses work.
                    // TODO: Uncomment the below. No full screen for now to make
                    // debugging easier.
                    if (UserVars.getParam("viewer") === UserVars.viewers["Screen"]) {
                        Devices.goFullScreen(engine);
                    }
                    // Start the render loop.
                    this._startRenderLoop();
                    engine.resize();
                });
                this._autoAdvanceIfNeeded(jQuery);
            });
        }
        _autoAdvanceIfNeeded(jQuery) {
            // If there are parameters in the url, auto advance.
            let viewer = Utils.userParam("viewer");
            console.log(viewer);
            if (viewer !== null) {
                // The user specified, so auto advance.
                let waitForCamera = setInterval(() => {
                    // Make sure the camera exists. Keep trying until it does.
                    let scene = Globals.get("scene");
                    if (scene === undefined) {
                        return;
                    }
                    let camera = scene.activeCamera;
                    if (camera === undefined) {
                        return;
                    }
                    let loadingPanel = jQuery("#loading_panel");
                    if (loadingPanel.css("display") === "none") {
                        return;
                    }
                    if (loadingPanel.css("opacity") < 1) {
                        return;
                    }
                    jQuery("#start-game").click();
                    clearInterval(waitForCamera);
                    jQuery("body").css("visibility", "visible");
                }, 0);
            }
        } // ****
        _startRenderLoop() {
            /*
            Start the function that runs with every frame.
            */
            // Once the scene is loaded, just register a render loop to render it
            // let camera = Globals.get("camera");
            let scene = Globals.get("scene");
            let meshesWithAnimations = Globals.get("meshesWithAnimations");
            Globals.get("engine").runRenderLoop(() => {
                // Update the positions of any animations.
                for (let i = 0; i < meshesWithAnimations.length; i++) {
                    meshesWithAnimations[i].PVRAnimation.updatePos();
                }
                Camera.update();
                scene.render();
            });
        }
        _resizeWindow() {
            /*
            Resize the canvas every time you resize the window.
            */
            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => {
                Globals.get("engine").resize();
            });
        }
    }
    exports.Game = Game;
    function start() {
        /*
        Make the game object and start it. This is the function that is run from
        the RequireJS entry point.
        */
        let game = new Game({
            onJSONLoaded: function () {
                console.log("DONE!!!");
            },
            onDone: function () { }
        });
    }
    exports.start = start;
});

///<reference path="../../Definitions/require.d.ts" />
// Leave this config code here in case you need it in the future...
// require.config({
//     paths: {
//         // jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
//         // jquery: 'https://code.jquery.com/jquery-3.2.1',
//         jquery: 'js/jquery-1.7.1.min',
//         // babylon: 'js/babylon.max',
//         // babylonObjLoader: 'js/babylon.objFileLoader',
//         bootstrap: 'js/bootstrap-3.3.7/dist/js/bootstrap.min'
//     },
//     shim: {
//         bootstrap: {
//             deps: ['jquery']
//         }
//     }, 
//     urlArgs: "bust=" + (new Date()).getTime()
// });
// This require function starts the app
require(['../main'], (main) => {
    /*
    Run the main start function.

    :param ??? main: The main object.
    */
    // Start the game...
    main.start();
});

define("RequireConfig", function(){});

}());