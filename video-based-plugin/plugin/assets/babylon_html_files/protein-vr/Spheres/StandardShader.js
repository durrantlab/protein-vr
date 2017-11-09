define(["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Shader {
        constructor(textureFilename, transparency = false, callBack = function () { }) {
            this.material = undefined;
            this._transparency = false;
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            this._transparency = transparency;
            let dirname = textureFilename.indexOf("/") === -1 ? "" : textureFilename.match(/.*\//)[0];
            let basename = textureFilename.replace(/.*\//, "");
            // TODO: This should be Append, not Load. 
            // NOTE TO WILLIAM: This is loading all babylon files up front. Only
            // do this if global variable lazyLoadViewerSpheres is false.
            BABYLON.SceneLoader.Load(dirname, basename + ".babylon", Globals.get("engine"), (aScene) => {
                aScene.executeWhenReady(() => {
                    let newMaterial = aScene.materials[0];
                    let texture = newMaterial.emissiveTexture;
                    this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
                    this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                    this.material.specularColor = new BABYLON.Color3(0, 0, 0);
                    this.material.diffuseTexture = null;
                    this.material.emissiveTexture = texture; // videoTexture;
                    if (this._transparency) {
                        this.material.opacityTexture = texture;
                    }
                    this.material.backFaceCulling = false;
                    // Dispose of unneeded stuff
                    newMaterial.dispose();
                    // aScene.dispose();  // gives an error.
                    callBack();
                });
            });
            // return;
            // let texture = new BABYLON.Texture(textureFilename, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, () => {
            //     callBack();
            // });
            // this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
            // this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            // this.material.specularColor = new BABYLON.Color3(0, 0, 0);
            // this.material.diffuseTexture = null;
            // this.material.emissiveTexture = texture; // videoTexture;
            // if (this._transparency) {
            //     this.material.opacityTexture = texture;
            // }
            // this.material.backFaceCulling = false;
        }
    }
    exports.Shader = Shader;
});
