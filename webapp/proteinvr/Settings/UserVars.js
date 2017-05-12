/**
 * module to create/store/maintain system variables
 */
define(["require", "exports", "./SettingsPanel"], function (require, exports, SettingsPanel) {
    "use strict";
    // Setting up user parameters
    var mobileDefaults;
    var laptopDefaults;
    var desktopDefaults;
    exports.paramDefaults = {
        mobile: {},
        laptop: {},
        desktop: {}
    };
    exports.paramNames = {};
    (function (audios) {
        audios[audios["Speakers"] = 0] = "Speakers";
        audios[audios["Headphones"] = 1] = "Headphones";
        audios[audios["None"] = 2] = "None";
    })(exports.audios || (exports.audios = {}));
    var audios = exports.audios;
    exports.paramNames.audio = ["Speakers", "Headphones", "None"];
    exports.paramDefaults.mobile.audio = audios.Headphones;
    exports.paramDefaults.laptop.audio = audios.Speakers;
    exports.paramDefaults.desktop.audio = audios.Speakers;
    (function (viewers) {
        viewers[viewers["Screen"] = 0] = "Screen";
        viewers[viewers["VRHeadset"] = 1] = "VRHeadset";
    })(exports.viewers || (exports.viewers = {}));
    var viewers = exports.viewers;
    exports.paramNames.viewer = ["Screen", "VR Headset"];
    exports.paramDefaults.mobile.viewer = viewers.Screen;
    exports.paramDefaults.laptop.viewer = viewers.Screen;
    exports.paramDefaults.desktop.viewer = viewers.Screen;
    (function (devices) {
        devices[devices["Mobile"] = 0] = "Mobile";
        devices[devices["Laptop"] = 1] = "Laptop";
        devices[devices["Desktop"] = 2] = "Desktop";
    })(exports.devices || (exports.devices = {}));
    var devices = exports.devices;
    exports.paramNames.device = ["Mobile", "Laptop", "Desktop"];
    exports.paramDefaults.mobile.device = devices.Mobile;
    exports.paramDefaults.laptop.device = devices.Laptop;
    exports.paramDefaults.desktop.device = devices.Desktop;
    (function (textures) {
        textures[textures["Sharp"] = 0] = "Sharp";
        textures[textures["Medium"] = 1] = "Medium";
        textures[textures["Grainy"] = 2] = "Grainy"; // 256
    })(exports.textures || (exports.textures = {}));
    var textures = exports.textures;
    exports.paramNames.textures = ["Sharp", "Medium", "Grainy"];
    exports.paramDefaults.mobile.textures = textures.Medium;
    exports.paramDefaults.laptop.textures = textures.Sharp;
    exports.paramDefaults.desktop.textures = textures.Sharp;
    (function (fog) {
        fog[fog["Clear"] = 0] = "Clear";
        fog[fog["Thin"] = 1] = "Thin";
        fog[fog["Thick"] = 2] = "Thick";
    })(exports.fog || (exports.fog = {}));
    var fog = exports.fog;
    exports.paramNames.fog = ["Clear", "Thin", "Thick"];
    exports.paramDefaults.mobile.fog = fog.Clear;
    exports.paramDefaults.laptop.fog = fog.Thin;
    exports.paramDefaults.desktop.fog = fog.Thick;
    (function (objects) {
        objects[objects["Detailed"] = 0] = "Detailed";
        objects[objects["Normal"] = 1] = "Normal";
        objects[objects["Simple"] = 2] = "Simple";
    })(exports.objects || (exports.objects = {}));
    var objects = exports.objects;
    exports.paramNames.objects = ["Detailed", "Normal", "Simple"];
    exports.paramDefaults.mobile.objects = objects.Normal;
    exports.paramDefaults.laptop.objects = objects.Detailed;
    exports.paramDefaults.desktop.objects = objects.Detailed;
    (function (displays) {
        displays[displays["FullScreen"] = 0] = "FullScreen";
        displays[displays["Windowed"] = 1] = "Windowed";
    })(exports.displays || (exports.displays = {}));
    var displays = exports.displays;
    exports.paramNames.display = ["Full Screen", "Windowed"];
    exports.paramDefaults.mobile.display = displays.FullScreen;
    exports.paramDefaults.laptop.display = displays.FullScreen;
    exports.paramDefaults.desktop.display = displays.FullScreen;
    (function (moving) {
        moving[moving["Advance"] = 0] = "Advance";
        moving[moving["Jump"] = 1] = "Jump";
        moving[moving["Teleport"] = 2] = "Teleport";
    })(exports.moving || (exports.moving = {}));
    var moving = exports.moving;
    exports.paramNames.moving = ["Advance", "Jump", "Teleport"];
    exports.paramDefaults.mobile.moving = moving.Advance;
    exports.paramDefaults.laptop.moving = moving.Advance;
    exports.paramDefaults.desktop.moving = moving.Advance;
    (function (looking) {
        looking[looking["MouseMove"] = 0] = "MouseMove";
        looking[looking["Click"] = 1] = "Click";
    })(exports.looking || (exports.looking = {}));
    var looking = exports.looking;
    exports.paramNames.looking = ["Mouse Move", "Click"];
    exports.paramDefaults.mobile.looking = looking.Click;
    exports.paramDefaults.laptop.looking = looking.MouseMove;
    exports.paramDefaults.desktop.looking = looking.MouseMove;
    /**
     * This function will assign values to the system variables based on user input.
     */
    function setup(callBackFunc) {
        // Load values from params.json
        var jsonPath = window.location.pathname + "/params.json";
        jsonPath = jsonPath.replace(/\/\//g, "/");
        jQuery = PVRGlobals.jQuery;
        jQuery.ajax({
            url: jsonPath,
            dataType: "json",
            cache: false
        }).done(function (user_vars) {
            // Default values before anything. For now just use laptop defaults,
            // but in future would be good to detect device...
            var userVars = exports.paramDefaults.laptop;
            // Here you overwrite with values from params.json. At this point,
            // this is just the proteinvr scene to use.
            var keys = Object.keys(user_vars);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var val = stringToEnumVal(user_vars[key]);
                userVars[key] = val;
            }
            // Now overwrite with copies from localstorage if you've got them.
            var localStorageParams = getLocalStorageParams();
            keys = Object.keys(localStorageParams);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (["scenePath"].indexOf(key) === -1) {
                    var val = stringToEnumVal(localStorageParams[key]);
                    userVars[key] = val;
                }
            }
            // Save to local storage what you've got so far.
            saveLocalStorageParams(userVars);
            // Show the settings panel
            SettingsPanel.show();
            // Set the values on the GUI.
            SettingsPanel.setGUIState();
            this.callBackFunc();
        }.bind({
            callBackFunc: callBackFunc
        }));
    }
    exports.setup = setup;
    function getLocalStorageParams() {
        // Get params from local storage
        var localStorageParamsStr = localStorage.getItem("proteinvr_params");
        var localStorageParams;
        if (localStorageParamsStr !== null) {
            localStorageParams = jQuery.parseJSON(localStorageParamsStr);
        }
        else {
            localStorageParams = {};
        }
        return localStorageParams;
    }
    exports.getLocalStorageParams = getLocalStorageParams;
    function getParam(key) {
        var localStorageParams = getLocalStorageParams();
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
        var localStorageParams = getLocalStorageParams();
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
                var paramNamesOptions = exports.paramNames[key];
                var newParamNamesOptions = [];
                for (var p = 0; p < paramNamesOptions.length; p++) {
                    newParamNamesOptions.push(paramNamesOptions[p].toLowerCase().replace(/ /g, ''));
                }
                var loc = newParamNamesOptions.indexOf(s);
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
