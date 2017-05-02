/**
 * module to create/store/maintain system variables
 */ 

import * as Core from "../Core/Core";
import * as SettingsPanel from "./SettingsPanel";
var jQuery;

// Set enums for several different types.
export enum audios {
    Speakers,
    Headphones,
    None
}

export enum viewers {
    Screen,
    VRHeadset
}

export enum devices {
    Mobile,
    Laptop,
    Desktop
}

export enum textures {
    Sharp,  // no modification
    Medium,  // 512
    Grainy  // 256
}

export enum fog {
    Clear,
    Thin,
    Thick
}

export enum objects {  // actually LOD settings
    Detailed,
    Normal,
    Simple
}

export enum displays {
    FullScreen,
    Windowed
}

// The interface
interface userVarsInterface {
    audio: audios,
    viewer: viewers,
    device: devices,
    textures: textures,
    fog: fog,
    objects: objects,
    display: displays
    animations: boolean,
    visibility: number,
    scenePath: string
}

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
        // Default values before anything.
        var userVars: userVarsInterface = {
            "audio": audios.Speakers,
            "viewer": viewers.Screen,
            "device": devices.Mobile,  // do default values here are those for mobile.
            "animations": true,
            "textures": textures.Sharp,
            "fog": fog.Clear,
            "objects": objects.Detailed,
            "display": displays.FullScreen,
            "visibility": 5,
            "scenePath": "./scenes/test/"
        }

        // Here you overwrite with values from params.json
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

        // Now prompt user. This will be a GUI with the defaults displayed
        // in the future. So user will always have option of changing
        // defaults. Ignore this for now (debugging);
        // userVars['viewer'] = stringToEnumVal(prompt("What viewer are you using?\nDesktop\nLaptop\nVRHeadset", "all lowercase please"));
        // userVars['animations'] = stringToEnumVal(confirm("Would you like animations in your experince?"));
        // userVars['textureDetail'] = stringToEnumVal(parseInt(prompt("On a scale of 1-5 how detailed would you like the textures to be?"), 10));
        // userVars['audio'] = stringToEnumVal(prompt("What audio are you using?\nSpeakers\nHeadsets\nNone"));
        // userVars['fog'] = stringToEnumVal(confirm("You down with F.O.G?"));
        // userVars['visibility'] = stringToEnumVal(parseInt(prompt("Enter your desired visibility level on a scale of 1-5") ,10)); 

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
        s = s.toLowerCase();
    }

    switch(s) {
        case "screen":
            return viewers.Screen;
        case "vrheadset":
            return viewers.VRHeadset;
        case "speakers":
            return audios.Speakers;
        case "headphones":
            return audios.Headphones;
        case "none":
            return audios.None;
        case "mobile":
            return devices.Mobile;
        case "laptop":
            return devices.Laptop;
        case "desktop":
            return devices.Desktop;
        case "sharp":
            return textures.Sharp;
        case "medium":
            return textures.Medium;
        case "grainy":
            return textures.Grainy;
        case "clear":
            return fog.Clear;
        case "thin":
            return fog.Thin;
        case "thick":
            return fog.Thick;
        case "detailed":
            return objects.Detailed;
        case "normal":
            return objects.Normal;
        case "simple":
            return objects.Simple;
        case "fullscreen":
            return displays.FullScreen;
        case "windowed":
            return displays.Windowed;
        default:
            return s;
    }
}

// // Getters
// export function getViewer(): viewers {
//     return userVars['viewer'];
// }

// export function getAnimations(): boolean {
//     return userVars['animations'];
// }

// export function getTextureDetail(): number {
//     return userVars['textureDetail'];
// }

// export function getAudio(): audios {
//     return userVars['audio'];
// }

// export function getFog(): boolean {
//     return userVars['fog'];
// }

// export function getVisibility(): number {
//     return userVars['visibility'];
// }

// // Setters
// export function setViewer(d: viewers): void {
//     userVars['viewer'] = d;
// }

// export function setAnimations(b: boolean) :void {
//     userVars['animations'] = b;
// }

// export function setTextureDetail(level: number) :void {
//     userVars['textureDetail'] = level;
// }

// export function setAudio(b: audios): void {
//     userVars['audio'] = b;
// }

// export function setFog(b: boolean): void {
//     userVars['fog'] = b;
// }

// export function setVisibility(level: number) :void {
//     userVars['visibility'] = level;
// }

// export default UserVars;