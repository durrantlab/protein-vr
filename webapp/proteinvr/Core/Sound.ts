///<reference path="../../js/Babylonjs/dist/babylon.2.5.d.ts" />

import * as Core from "../Core/Core";
import * as UserVars from "../Settings/UserVars";
declare var PVRGlobals;

export function addSound(mp3FileName, location) {
    let panningModel: string = undefined;  // Assume speakers by default
    switch (UserVars.getParam("audio")) {
        case UserVars.audios["Speakers"]:
            panningModel = "equalpower";
            break;
        case UserVars.audios["Headphones"]:
            panningModel = "HRTF";
            break;
        case UserVars.audios["None"]:
            return;
    }

    let soundParams = {
        "loop": true, "autoplay": true, "spatialSound": true,
        "distanceModel": "exponential", "rolloffFactor": 5,
        // "distanceModel": "linear", maxDistance: 5
    }

    if (panningModel !== undefined) {
        soundParams["panningModel"] = panningModel;
    }

    var sound = new BABYLON.Sound(mp3FileName, UserVars.getParam("scenePath") + mp3FileName,
        PVRGlobals.scene, null, soundParams
    );

    sound.setPosition(location);
}

