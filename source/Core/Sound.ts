///<reference path="../../js/Babylonjs/dist/babylon.2.4.d.ts" />

import Core from "../Core/Core";

export function addSound(mp3FileName, location) {
    var sound = new BABYLON.Sound(mp3FileName, Core.sceneDirectory + mp3FileName,
        Core.scene, null, {
            loop: true, autoplay: true, spatialSound: true,
            //distanceModel: "exponential", rolloffFactor: 2,
            distanceModel: "linear", maxDistance: 15,
            panningModel: (Core.userVars.audioType === Core.audioTypes.Speakers) ? "equalpower" : "HRTF"
        }
    );

    sound.setPosition(location);

    console.log(location);
}

export default addSound;