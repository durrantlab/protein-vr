declare var BABYLON;

import * as UserVars from "../config/UserVars";
import { Camera } from "./Camera";
import * as Globals from "../config/Globals";
import * as ViewerSphere from "./ViewerSphere";

export function loadBabylonFile(): Promise<any> {

    return new Promise((resolve) => {
        BABYLON.SceneLoader.Load("", "babylon.babylon", Globals.get("engine"), (newScene) => {
            Globals.set("scene", newScene);
    
            window.scrollTo(0, 1);  // supposed to autohide scroll bar.
    
            // this._canvas.addEventListener("click", function() {
            //     this.engine.switchFullscreen(true);
            // }.bind(this));
    
            // Wait for textures and shaders to be ready
            newScene.executeWhenReady(() => {
                let camera = new Camera();
                Globals.set("camera", camera);

                // Delay textures until needed. Cool, but too slow for our purposes here...
                // newScene.useDelayedTextureLoading = true
                                
                // Setup viewer sphere
                ViewerSphere.setup();
                if (Globals.get("debug")) { newScene.debugLayer.show(); }
                resolve({msg: "BABYLON.BABYLON LOADED"});
            });
        });
    })
}