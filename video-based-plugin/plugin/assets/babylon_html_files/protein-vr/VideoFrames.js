define(["require", "exports", "./config/Globals"], function (require, exports, Globals) {
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
                // let promises = [];
                for (let i = 0; i < data.length; i++) {
                    // promises.push(
                    new Promise((resolve) => {
                        // console.log("DEBUGGING CODE HERE...");
                        let filename;
                        // alert(isMobile);
                        if (isMobile) {
                            // Some kind of phone... use low-res images
                            filename = "./frames/" + data[i] + ".small.jpg?" + Math.random().toString(); // Note no caching, for debugging.
                            // alert(filename);
                        }
                        else {
                            // desktop and laptops ... full res images
                            filename = "./frames/" + data[i] + "?" + Math.random().toString(); // Note no caching, for debugging.
                        }
                        let tex = new BABYLON.Texture(filename, scene);
                        Globals.get("cameraPositionsAndTextures")[i][1] = tex;
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
