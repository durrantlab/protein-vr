define(["require", "exports", "./Camera", "../config/Globals", "./ViewerSphere"], function (require, exports, Camera_1, Globals, ViewerSphere) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadBabylonFile() {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.Load("", "babylon.babylon", Globals.get("engine"), (newScene) => {
                Globals.set("scene", newScene);
                window.scrollTo(0, 1); // supposed to autohide scroll bar.
                // this._canvas.addEventListener("click", function() {
                //     this.engine.switchFullscreen(true);
                // }.bind(this));
                // Wait for textures and shaders to be ready
                newScene.executeWhenReady(() => {
                    Globals.set("camera", new Camera_1.Camera());
                    ViewerSphere.setup();
                    if (Globals.get("debug")) {
                        newScene.debugLayer.show();
                    }
                    resolve({ msg: "BABYLON.BABYLON LOADED" });
                });
            });
        });
    }
    exports.loadBabylonFile = loadBabylonFile;
});
