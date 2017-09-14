/**
 * module to create/store/maintain system variables
 */
define(["require", "exports"], function (require, exports) {
    "use strict";
    var UserVars;
    (function (UserVars) {
        // Set enums for several different types.
        (function (audios) {
            audios[audios["Speakers"] = 0] = "Speakers";
            audios[audios["Headphones"] = 1] = "Headphones";
            audios[audios["None"] = 2] = "None";
        })(UserVars.audios || (UserVars.audios = {}));
        var audios = UserVars.audios;
        (function (devices) {
            devices[devices["Desktop"] = 0] = "Desktop";
            devices[devices["Laptop"] = 1] = "Laptop";
            devices[devices["VRHeadset"] = 2] = "VRHeadset";
        })(UserVars.devices || (UserVars.devices = {}));
        var devices = UserVars.devices;
        (function (navMethods) {
            navMethods[navMethods["InstantaneousForward"] = 0] = "InstantaneousForward";
            navMethods[navMethods["GradualForward"] = 1] = "GradualForward";
            navMethods[navMethods["IntantaneousDirect"] = 2] = "IntantaneousDirect";
        })(UserVars.navMethods || (UserVars.navMethods = {}));
        var navMethods = UserVars.navMethods;
        // Default values
        UserVars.userVars = {
            "audio": audios.Speakers,
            "device": devices.Desktop,
            "animations": true,
            "textureDetail": 5,
            "fog": false,
            "visibility": 5,
            "scenePath": "./scenes/test/",
            "navigation": navMethods.InstantaneousForward
        };
        /**
         * This function will assign values to the system variables based on user input.
         */
        function setup(callBackFunc) {
            // This will eventually be a UI, not prompts.
            // Add in any values from UserVars.json (overwrites defaults here)
            jQuery.ajax({
                url: "../params.json",
                dataType: "json",
                cache: false
            }).done(function (user_vars) {
                // Here you overwrite
                var keys = Object.keys(user_vars);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var val = stringToEnumVal(user_vars[key]);
                    UserVars.userVars[key] = val;
                }
                // Now prompt user. This will be a GUI with the defaults displayed
                // in the future. So user will always have option of changing
                // defaults. Ignore this for now (debugging);
                // userVars['device'] = stringToEnumVal(prompt("What device are you using?\nDesktop\nLaptop\nVRHeadset", "all lowercase please"));
                // userVars['animations'] = stringToEnumVal(confirm("Would you like animations in your experince?"));
                // userVars['textureDetail'] = stringToEnumVal(parseInt(prompt("On a scale of 1-5 how detailed would you like the textures to be?"), 10));
                // userVars['audio'] = stringToEnumVal(prompt("What audio are you using?\nSpeakers\nHeadsets\nNone"));
                // userVars['fog'] = stringToEnumVal(confirm("You down with F.O.G?"));
                // userVars['visibility'] = stringToEnumVal(parseInt(prompt("Enter your desired visibility level on a scale of 1-5") ,10)); 
                this.callBackFunc();
            }.bind({
                callBackFunc: callBackFunc
            }));
        }
        UserVars.setup = setup;
        // Convert strings to enums. A helper function.
        function stringToEnumVal(s) {
            if (typeof (s) === "string") {
                s = s.toLowerCase();
            }
            switch (s) {
                case "desktop":
                    return devices.Desktop;
                case "laptop":
                    return devices.Laptop;
                case "vrheadset":
                    return devices.VRHeadset;
                case "speakers":
                    return audios.Speakers;
                case "headphones":
                    return audios.Headphones;
                case "none":
                    return audios.None;
                case "instantaneous":
                    return navMethods.InstantaneousForward;
                case "gradual":
                    return navMethods.GradualForward;
                case "maintain direction":
                    return navMethods.IntantaneousDirect;
                default:
                    return s;
            }
        }
        UserVars.stringToEnumVal = stringToEnumVal;
        // Getters
        function getDevice() {
            return UserVars.userVars['device'];
        }
        UserVars.getDevice = getDevice;
        function getAnimations() {
            return UserVars.userVars['animations'];
        }
        UserVars.getAnimations = getAnimations;
        function getTextureDetail() {
            return UserVars.userVars['textureDetail'];
        }
        UserVars.getTextureDetail = getTextureDetail;
        function getAudio() {
            return UserVars.userVars['audio'];
        }
        UserVars.getAudio = getAudio;
        function getFog() {
            return UserVars.userVars['fog'];
        }
        UserVars.getFog = getFog;
        function getVisibility() {
            return UserVars.userVars['visibility'];
        }
        UserVars.getVisibility = getVisibility;
        function getNavigation() {
            return UserVars.userVars['navigation'];
        }
        UserVars.getNavigation = getNavigation;
        // Setters
        function setDevice(d) {
            UserVars.userVars['device'] = d;
        }
        UserVars.setDevice = setDevice;
        function setAnimations(b) {
            UserVars.userVars['animations'] = b;
        }
        UserVars.setAnimations = setAnimations;
        function setTextureDetail(level) {
            UserVars.userVars['textureDetail'] = level;
        }
        UserVars.setTextureDetail = setTextureDetail;
        function setAudio(b) {
            UserVars.userVars['audio'] = b;
        }
        UserVars.setAudio = setAudio;
        function setFog(b) {
            UserVars.userVars['fog'] = b;
        }
        UserVars.setFog = setFog;
        function setVisibility(level) {
            UserVars.userVars['visibility'] = level;
        }
        UserVars.setVisibility = setVisibility;
        function setNavigation(n) {
            UserVars.userVars['navigation'] = n;
        }
        UserVars.setNavigation = setNavigation;
    })(UserVars = exports.UserVars || (exports.UserVars = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = UserVars;
});
