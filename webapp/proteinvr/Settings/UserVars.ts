/**
 * module to create/store/maintain system variables
 */ 

import * as Core from "../Core/Core";
import * as SettingsPanel from "./SettingsPanel";
declare var jQuery;
declare var PVRGlobals;

// The interface
interface userVarsInterface {
    audio?: audios,
    viewer?: viewers,
    device?: devices,
    textures?: textures,
    fog?: fog,
    objects?: objects,
    display?: displays
    animations?: boolean,
    visibility?: number,
    scenePath?: string,
    moving?: moving,
    looking?: looking
}

// Setting up user parameters
let mobileDefaults: userVarsInterface;
let laptopDefaults: userVarsInterface;
let desktopDefaults: userVarsInterface;
export var paramDefaults: {mobile: userVarsInterface, 
                    laptop: userVarsInterface, 
                    desktop: userVarsInterface} = {
    "mobile": {},
    "laptop": {},
    "desktop": {}
}

export var paramNames: any = {};

export enum audios {
    Speakers,
    Headphones,
    None
}
paramNames["audio"] = ["Speakers", "Headphones", "None"];
paramDefaults["mobile"]["audio"] = audios["Headphones"];
paramDefaults["laptop"]["audio"] = audios["Speakers"];
paramDefaults["desktop"]["audio"] = audios["Speakers"];

export enum viewers {
    Screen,
    VRHeadset
}
paramNames["viewer"] = ["Screen", "VR Headset"];
paramDefaults["mobile"]["viewer"] = viewers["Screen"];
paramDefaults["laptop"]["viewer"] = viewers["Screen"];
paramDefaults["desktop"]["viewer"] = viewers["Screen"];

export enum devices {
    Mobile,
    Laptop,
    Desktop
}
paramNames["device"] = ["Mobile", "Laptop", "Desktop"];
paramDefaults["mobile"]["device"] = devices["Mobile"];
paramDefaults["laptop"]["device"] = devices["Laptop"];
paramDefaults["desktop"]["device"] = devices["Desktop"];

export enum textures {
    Sharp,  // no modification
    Medium,  // 512
    Grainy  // 256
}
paramNames["textures"] = ["Sharp", "Medium", "Grainy"];
paramDefaults["mobile"]["textures"] = textures["Medium"];
paramDefaults["laptop"]["textures"] = textures["Sharp"];
paramDefaults["desktop"]["textures"] = textures["Sharp"];

export enum fog {
    Clear,
    Thin,
    Thick
}
paramNames["fog"] = ["Clear", "Thin", "Thick"];
paramDefaults["mobile"]["fog"] = fog["Clear"];
paramDefaults["laptop"]["fog"] = fog["Thin"];
paramDefaults["desktop"]["fog"] = fog["Thick"];

export enum objects {  // actually LOD settings
    Detailed,
    Normal,
    Simple
}
paramNames["objects"] = ["Detailed", "Normal", "Simple"];
paramDefaults["mobile"]["objects"] = objects["Normal"];
paramDefaults["laptop"]["objects"] = objects["Detailed"];
paramDefaults["desktop"]["objects"] = objects["Detailed"];

export enum displays {
    FullScreen,
    Windowed
}
paramNames["display"] = ["Full Screen", "Windowed"];
paramDefaults["mobile"]["display"] = displays["FullScreen"];
paramDefaults["laptop"]["display"] = displays["FullScreen"];
paramDefaults["desktop"]["display"] = displays["FullScreen"];

export enum moving {
    Advance,
    Jump,
    Teleport
}
paramNames["moving"] = ["Advance", "Jump", "Teleport"];
paramDefaults["mobile"]["moving"] = moving["Advance"];
paramDefaults["laptop"]["moving"] = moving["Advance"];
paramDefaults["desktop"]["moving"] = moving["Advance"];

export enum looking {
    MouseMove,
    Click
}
paramNames["looking"] = ["Mouse Move", "Click"];
paramDefaults["mobile"]["looking"] = looking["Click"];
paramDefaults["laptop"]["looking"] = looking["MouseMove"];
paramDefaults["desktop"]["looking"] = looking["MouseMove"];

/**
 * This function will assign values to the system variables based on user input.
 */
export function setup(callBackFunc: any) :void {

    // Load values from params.json
    let jsonPath = window.location.pathname + "/params.json";
    jsonPath = jsonPath.replace(/\/\//g, "/");
    jQuery = PVRGlobals.jQuery;
    jQuery.ajax({
        url: jsonPath,
        dataType: "json",
        cache: false
    }).done(function(user_vars) {
        // Default values before anything. For now just use laptop defaults,
        // but in future would be good to detect device...
        var userVars: userVarsInterface = paramDefaults["laptop"];

        // Here you overwrite with values from params.json. At this point,
        // this is just the proteinvr scene to use.
        let keys = Object.keys(user_vars);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let val = stringToEnumVal(user_vars[key]);
            userVars[key] = val;
        }

        // Now overwrite with copies from localstorage if you've got them.
        let localStorageParams = getLocalStorageParams();
        keys = Object.keys(localStorageParams);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            if (["scenePath"].indexOf(key) === -1) {  // Some parameters should never be overwritten from localstorage
                let val = stringToEnumVal(localStorageParams[key]);
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

export function getLocalStorageParams() {
    // Get params from local storage
    let localStorageParamsStr = localStorage.getItem("proteinvr_params");
    let localStorageParams;
    if (localStorageParamsStr !== null) {
        localStorageParams = jQuery.parseJSON(localStorageParamsStr);
    } else {
        localStorageParams = {};
    }

    return localStorageParams;
}

export function getParam(key) {
    let localStorageParams = getLocalStorageParams();
    return localStorageParams[key];
}

export function saveLocalStorageParams(params) {
    // let paramsToSave = jQuery.parseJSON(JSON.stringify(params));  // This makes a copy
    // delete paramsToSave["scenePath"];  // Don't save this one.
    // localStorage.setItem("proteinvr_params", JSON.stringify(paramsToSave));    
    localStorage.setItem("proteinvr_params", JSON.stringify(params));    
}

export function updateLocalStorageParams(paramName, value) {
    // Get params from local storage
    let localStorageParams = getLocalStorageParams()
    
    // Update those params
    localStorageParams[paramName] = value;

    // Save the params
    saveLocalStorageParams(localStorageParams);
}

// Convert strings to enums. A helper function.
export function stringToEnumVal(s: any): any {
    if (typeof(s) === "string") {
        s = s.toLowerCase().replace(/ /g, '');
    }

    // see http://stackoverflow.com/questions/684672/how-do-i-loop-through-or-enumerate-a-javascript-object
    for (var key in paramNames) {
        if (paramNames.hasOwnProperty(key)) {
            let paramNamesOptions = paramNames[key];
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

