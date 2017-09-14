import { Game } from "./main";
import * as Globals from "./config/Globals";
import { Shader } from "./shaders/StandardShader";
import * as ViewerSphere from "./scene/ViewerSphere";

export function getFramePromises() {

    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");
    let jQuery = Globals.get("jQuery");
    let isMobile = Globals.get("isMobile");

    // Need to return an array of promises (one for each texture)
    return new Promise((resolve) => {
        jQuery.get("frames/filenames.json", (filenames) => {
            // Do a check to make sure the number of png files matches the
            // number of camera positions.
            let cameraPositions = Globals.get("cameraPositions");
            if (cameraPositions.length != filenames.length) {
                console.log("ERROR! The number of camera positions and the number of png frames to now match!");
                debugger;
            }

            let progressBarObj = jQuery("#loading-progress-bar .progress-bar");
            for (let i=0; i<filenames.length; i++) {
                new Promise((resolve) => {
                    let filename: string;

                    if (isMobile) {
                        // Some kind of phone... use low-res images
                        filename = "frames/" + filenames[i] + ".small.png?" + Math.random().toString();  // Note no caching, for debugging.
                        // alert(filename);
                    } else {
                        // desktop and laptops ... full res images
                        filename = "frames/" + filenames[i] + "?" + Math.random().toString();  // Note no caching, for debugging.
                    }
                    let shader = new Shader(filename, true, () => {
                        setTimeout(() => {  // kind of like doEvents from VB days.
                            let numTextures = Globals.get("numFrameTexturesLoaded") + 1;
                            Globals.set("numFrameTexturesLoaded", numTextures);
                            let progressVal = Math.round(100 * numTextures / filenames.length);
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

            resolve({msg: "List of get-texture promises"}); //, promises: promises})
        });
    })
}

var _afterMaterialsLoadedAlreadyExec: boolean = false;
function _afterMaterialsLoaded() {
    // Make sure this functiononly fires once...
    if (_afterMaterialsLoadedAlreadyExec) {
        return;
    } else {
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