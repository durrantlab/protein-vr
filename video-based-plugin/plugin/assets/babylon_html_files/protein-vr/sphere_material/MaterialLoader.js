/* This could be eventually merged with SphereMaterial.ts. */
define(["require", "exports", "../config/Globals", "../sphere_material/SphereMaterial", "../scene/ViewerSphere"], function (require, exports, Globals, SphereMaterial_1, ViewerSphere) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getFramePromises() {
        /*
        Start loading all the skybox images (view spheres).
    
        :returns: A promise to load them.
        :rtype: :class:`Promise<any>`
        */
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
                // Loop through each PNG filename
                for (let i = 0; i < filenames.length; i++) {
                    new Promise((resolve) => {
                        let filename;
                        // isMobile = true;
                        if (isMobile) {
                            // Some kind of phone... use low-res images
                            filename = "frames/" + filenames[i] + ".small.png"; // Note no caching, for debugging.
                        }
                        else {
                            // desktop and laptops ... full res images
                            filename = "frames/" + filenames[i]; // Note no caching, for debugging.
                        }
                        if (Globals.get("breakCaching") === false) {
                            filename = filename + "?" + Math.random().toString();
                        }
                        // TODO: This isn't a shader anymore. Try renaming to
                        // something reasonable.
                        let sphere_material = new SphereMaterial_1.SphereMaterial(filename, true, () => {
                            setTimeout(() => {
                                // Get the total number of textures.
                                let numTextures = Globals.get("numFrameTexturesLoaded") + 1;
                                Globals.set("numFrameTexturesLoaded", numTextures);
                                // Updating the progress bar.
                                let progressVal = Math.round(100 * numTextures / filenames.length);
                                progressBarObj.css("width", progressVal.toString() + "%");
                                // If progress >= 100, continue on...
                                if (progressVal >= 100) {
                                    _afterMaterialsLoaded();
                                }
                            });
                        });
                        Globals.get("sphereMaterials")[i] = sphere_material;
                    });
                }
                resolve({ msg: "List of get-texture promises" }); //, promises: promises})
            });
        });
    }
    exports.getFramePromises = getFramePromises;
    var _afterMaterialsLoadedAlreadyExec = false;
    function _afterMaterialsLoaded() {
        /*
        Once all PNG files loaded, update the DOM and start setting up the
        spheres.
        */
        // Make sure this functiononly fires once...
        if (_afterMaterialsLoadedAlreadyExec) {
            return;
        }
        else {
            _afterMaterialsLoadedAlreadyExec = true;
        }
        // Update the user interface now that all images are loaded.
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