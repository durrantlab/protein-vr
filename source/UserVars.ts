/**
 * module to create/store/maintain system variables
 */ 

import Core from "./Core/Core";
declare var jQuery;

export namespace UserVars{
    // Set enums for several different types.
    export enum audios {
        Speakers,
        Headphones,
        None
    }

    export enum devices {
        Desktop,
        Laptop,
        VRHeadset
    }

    // The interface
    interface userVarsInterface {
        audio: audios,
        device: devices,
        animations: boolean,
        textureDetail: number,
        fog: boolean,  // maybe a number in the future?
        visibility: number
    }

    // Default values
    export var userVars: userVarsInterface = {
        "audio": audios.Speakers,
        "device": devices.Desktop,
        "animations": true,
        "textureDetail": 5,
        "fog": false,
        "visibility": 5
    }

    /**
     * This function will assign values to the system variables based on user input.
     */
    export function setup() :void {
        // This will eventually be a UI, not prompts.

        // Add in any values from UserVars.json (overwrites defaults here)
        jQuery.ajax({
            url: "/source/UserVars.json",
            dataType: "json"
        }).done(function(user_vars) {
            // Here you overwrite
            let keys = Object.keys(user_vars);
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let val = user_vars[key];
                userVars[key] = val;
            }

            // Now prompt user. This will be a GUI with the defaults displayed
            // in the future. So user will always have option of changing
            // defaults. Ignore this for now (debugging);
            return;
            
            userVars['device'] = stringToEnumVal(prompt("What device are you using?\nDesktop\nLaptop\nVRHeadset", "all lowercase please"));
            userVars['animations'] = confirm("Would you like animations in your experince?");
            userVars['textureDetail'] = parseInt(prompt("On a scale of 1-5 how detailed would you like the textures to be?"), 10);
            userVars['audio'] = stringToEnumVal(prompt("What audio are you using?\nSpeakers\nHeadsets\nNone"));
            userVars['fog'] = confirm("You down with F.O.G?");
            userVars['visibility'] = parseInt(prompt("Enter your desired visibility level on a scale of 1-5") ,10); 
        });
    }

    // Convert strings to enums. A helper function.
    export function stringToEnumVal(s: string): any {
        s = s.toLowerCase();

        switch(s) {
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
            default:
                return undefined;
        }
    }

    // Getters
    export function getDevice(): devices {
        return userVars['device'];
    }

    export function getAnimations(): boolean {
        return userVars['animations'];
    }

    export function getTextureDetail(): number {
        return userVars['textureDetail'];
    }

    export function getAudio(): audios {
        return userVars['audio'];
    }

    export function getFog(): boolean {
        return userVars['fog'];
    }

    export function getVisibility(): number {
        return userVars['visibility'];
    }

    // Setters
    export function setDevice(d: devices): void {
        userVars['device'] = d;
    }

    export function setAnimations(b: boolean) :void {
        userVars['animations'] = b;
    }

    export function setTextureDetail(level: number) :void {
        userVars['textureDetail'] = level;
    }

    export function setAudio(b: audios): void {
        userVars['audio'] = b;
    }

    export function setFog(b: boolean): void {
        userVars['fog'] = b;
    }

    export function setVisibility(level: number) :void {
        userVars['visibility'] = level;
    }
}

export default UserVars;