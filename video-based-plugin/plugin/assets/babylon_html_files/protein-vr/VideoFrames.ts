import { Game } from "./main";
import * as Globals from "./config/Globals";

export function getFramePromises() {

    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");
    let jQuery = Globals.get("jQuery");
    let isMobile = Globals.get("mobileDetect").mobile();

    // Need to return an array of promises (one for each texture)
    return new Promise((resolve) => {
        jQuery.get("./frames/filenames.json", (data) => {
            // Do a check to make sure the number of png files matches the
            // number of camera positions.
            let cameraPositionsAndTextures = Globals.get("cameraPositionsAndTextures");
            if (cameraPositionsAndTextures.length != data.length) {
                console.log("ERROR! The number of camera positions and the number of png frames to now match!");
                debugger;
            }

            // let promises = [];
            let progressBarObj = jQuery("#loading-progress-bar .progress-bar");
            for (let i=0; i<data.length; i++) {
                // promises.push(
                    new Promise((resolve) => {
                        // console.log("DEBUGGING CODE HERE...");
                        let filename: string;
                        // alert(isMobile);
                        // isMobile = true; // for debugging.
                        if (isMobile) {
                            // Some kind of phone... use low-res images
                            filename = "./frames/" + data[i] + ".small.png?" + Math.random().toString();  // Note no caching, for debugging.
                            // alert(filename);
                        } else {
                            // desktop and laptops ... full res images
                            filename = "./frames/" + data[i] + "?" + Math.random().toString();  // Note no caching, for debugging.
                        }
                        let tex = new BABYLON.Texture(filename, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, () => {
                            setTimeout(() => {  // kind of like doEvents from VB days.
                                let numTextures = Globals.get("numFrameTexturesLoaded") + 1;
                                Globals.set("numFrameTexturesLoaded", numTextures);
                                // console.log("Frames loaded: ", numTextures);
                                let progressVal = Math.round(100 * numTextures / data.length);
                                progressBarObj.css("width", progressVal.toString() + "%");
                                // console.log(progressVal, "HH")
                                // This is running at time of execution, not OfflineAudioCompletionEvent.apply.apply. need to figure outerHeight.
                                if (progressVal >= 100) {
                                    jQuery("#start-game").prop("disabled", false);
                                    jQuery("#loading-progress-bar").slideUp(); /* () => {
                                        jQuery("#loading-progress-bar").hide();
                                    }); */
                                }
                            });
                        });
                        // tex.hasAlpha = true;
                        // console.log(tex);
                        Globals.get("cameraPositionsAndTextures")[i][1] = tex;
                    });

                    

                // );
            }

            resolve({msg: "List of get-texture promises"}); //, promises: promises})

            // Fire the callback.
            // this._callBack();
        });
    })
}
