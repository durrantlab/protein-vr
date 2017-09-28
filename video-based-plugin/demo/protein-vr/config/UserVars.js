/**
 * module to create/store/maintain system variables
 */
define(["require", "exports", "./Globals"], function (require, exports, Globals) {
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
    function setup() {
        return new Promise((resolve) => {
            // Default values before anything. For now just use laptop defaults,
            // but in future would be good to detect device...
            var userVars;
            let isMobile = Globals.get("isMobile"); // null if its not a phone at all.
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
            // Save to local storage what you've got so far.
            saveLocalStorageParams(userVars);
            resolve({ msg: "USERVARS SET UP" });
        });
    }
    exports.setup = setup;
    function getLocalStorageParams() {
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
        let localStorageParams = getLocalStorageParams();
        return localStorageParams[key];
    }
    exports.getParam = getParam;
    function saveLocalStorageParams(params) {
        // let paramsToSave = jQuery.parseJSON(JSON.stringify(params));  // This makes a copy
        // delete paramsToSave["scenePath"];  // Don't save this one.
        // localStorage.setItem("proteinvr_params", JSON.stringify(paramsToSave));    
        localStorage.setItem("proteinvr_params", JSON.stringify(params));
    }
    exports.saveLocalStorageParams = saveLocalStorageParams;
    function updateLocalStorageParams(paramName, value) {
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
        // console.log("string id not found", s);
        return s;
    }
    exports.stringToEnumVal = stringToEnumVal;
});
