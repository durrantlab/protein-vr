define(["require", "exports", "./config/Globals", "./shaders/StandardShader", "./scene/ViewerSphere"], function (require, exports, Globals, StandardShader_1, ViewerSphere) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getFramePromises() {
        let BABYLON = Globals.get("BABYLON");
        let scene = Globals.get("scene");
        let jQuery = Globals.get("jQuery");
        let isMobile = Globals.get("mobileDetect").mobile();
        // Need to return an array of promises (one for each texture)
        return new Promise((resolve) => {
            jQuery.get("./frames/filenames.json", (data) => {
                // Do a check to make sure the number of png files matches the
                // number of camera positions.
                let cameraPositions = Globals.get("cameraPositions");
                if (cameraPositions.length != data.length) {
                    console.log("ERROR! The number of camera positions and the number of png frames to now match!");
                    debugger;
                }
                // let promises = [];
                let progressBarObj = jQuery("#loading-progress-bar .progress-bar");
                for (let i = 0; i < data.length; i++) {
                    // promises.push(
                    new Promise((resolve) => {
                        // console.log("DEBUGGING CODE HERE...");
                        let filename;
                        // alert(isMobile);
                        isMobile = true; // for debugging.
                        if (isMobile) {
                            // Some kind of phone... use low-res images
                            filename = "./frames/" + data[i] + ".small.png?" + Math.random().toString(); // Note no caching, for debugging.
                            // alert(filename);
                        }
                        else {
                            // desktop and laptops ... full res images
                            filename = "./frames/" + data[i] + "?" + Math.random().toString(); // Note no caching, for debugging.
                        }
                        let shader = new StandardShader_1.Shader(filename, true, () => {
                            setTimeout(() => {
                                let numTextures = Globals.get("numFrameTexturesLoaded") + 1;
                                Globals.set("numFrameTexturesLoaded", numTextures);
                                let progressVal = Math.round(100 * numTextures / data.length);
                                progressBarObj.css("width", progressVal.toString() + "%");
                                // This is running at time of execution, not OfflineAudioCompletionEvent.apply.apply. need to figure outerHeight.
                                if (progressVal >= 100) {
                                    jQuery("#start-game").prop("disabled", false);
                                    jQuery("#loading-progress-bar").slideUp();
                                    // Setup viewer sphere
                                    ViewerSphere.setup();
                                }
                            });
                        });
                        // tex.hasAlpha = true;
                        // console.log(tex);
                        Globals.get("sphereShaders")[i] = shader;
                    });
                    // );
                }
                resolve({ msg: "List of get-texture promises" }); //, promises: promises})
                // Fire the callback.
                // this._callBack();
            });
        });
    }
    exports.getFramePromises = getFramePromises;
});