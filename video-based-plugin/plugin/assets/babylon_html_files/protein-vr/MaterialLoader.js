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
                let progressBarObj = jQuery("#loading-progress-bar .progress-bar");
                for (let i = 0; i < data.length; i++) {
                    new Promise((resolve) => {
                        let filename;
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
                                    _afterMaterialsLoaded();
                                }
                            });
                        });
                        Globals.get("sphereShaders")[i] = shader;
                    });
                }
                resolve({ msg: "List of get-texture promises" }); //, promises: promises})
            });
        });
    }
    exports.getFramePromises = getFramePromises;
    var _afterMaterialsLoadedAlreadyExec = false;
    function _afterMaterialsLoaded() {
        // Make sure this functiononly fires once...
        if (_afterMaterialsLoadedAlreadyExec) {
            return;
        }
        else {
            _afterMaterialsLoadedAlreadyExec = true;
        }
        let jQuery = Globals.get("jQuery");
        // Start game button now enabled.
        jQuery("#start-game").prop("disabled", false);
        // Hide material-load progress bar.
        jQuery("#loading-progress-bar").slideUp();
        // Change the loading-panel title
        jQuery("#loading-title").html("Game Loaded");
        // Setup viewer sphere
        ViewerSphere.setup();
    }
});
