///<reference path="../../js/Babylonjs/dist/babylon.2.5.d.ts" />
define(["require", "exports", "../Settings/UserVars"], function (require, exports, UserVars) {
    "use strict";
    function addSound(mp3FileName, location) {
        var panningModel = undefined; // Assume speakers by default
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
        var soundParams = {
            "loop": true, "autoplay": true, "spatialSound": true,
            "distanceModel": "exponential", "rolloffFactor": 5,
        };
        if (panningModel !== undefined) {
            soundParams["panningModel"] = panningModel;
        }
        var sound = new BABYLON.Sound(mp3FileName, UserVars.getParam("scenePath") + mp3FileName, PVRGlobals.scene, null, soundParams);
        sound.setPosition(location);
        PVRGlobals.sounds.push(sound);
    }
    exports.addSound = addSound;
    function pauseAll() {
        for (var t = 0; t < PVRGlobals.sounds.length; t++) {
            PVRGlobals.sounds[t].pause();
        }
    }
    exports.pauseAll = pauseAll;
    function playAll() {
        for (var t = 0; t < PVRGlobals.sounds.length; t++) {
            PVRGlobals.sounds[t].play(0);
        }
    }
    exports.playAll = playAll;
});
