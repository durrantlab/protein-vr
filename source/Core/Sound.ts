///<reference path="../../js/Babylonjs/dist/babylon.2.4.d.ts" />

import Core from "../Core/Core";
import UserVars from "../UserVars";

export function addSound(mp3FileName, location) {
    let panningModel: string = undefined;  // Assume speakers by default
    switch (UserVars.userVars.audio) {
        case UserVars.audios.Speakers:
            panningModel = "equalpower";
            break;
        case UserVars.audios.Headphones:
            panningModel = "HRTF";
            break;
    }

    let soundParams = {
        "loop": true, "autoplay": true, "spatialSound": true,
        //distanceModel: "exponential", rolloffFactor: 2,
        "distanceModel": "linear", maxDistance: 15
    }

    if (panningModel !== undefined) {
        soundParams["panningModel"] = panningModel;
    }

    var sound = new BABYLON.Sound(mp3FileName, Core.sceneDirectory + mp3FileName,
        Core.scene, null, soundParams
    );

    sound.setPosition(location);
}

export default addSound;