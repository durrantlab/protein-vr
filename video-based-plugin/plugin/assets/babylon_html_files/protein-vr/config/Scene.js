define(["require", "exports", "../Camera", "./BabylonGlobals"], function (require, exports, Camera_1, BabylonGlobals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadBabylonFile() {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.Load("", "babylon.babylon", BabylonGlobals.get("engine"), (newScene) => {
                BabylonGlobals.set("scene", newScene);
                window.scrollTo(0, 1); // supposed to autohide scroll bar.
                // this._canvas.addEventListener("click", function() {
                //     this.engine.switchFullscreen(true);
                // }.bind(this));
                // Wait for textures and shaders to be ready
                newScene.executeWhenReady(() => {
                    BabylonGlobals.set("camera", new Camera_1.Camera(this, BABYLON));
                    resolve({ msg: "BABYLON.BABYLON LOADED" });
                });
            });
        });
    }
    exports.loadBabylonFile = loadBabylonFile;
});
