define(["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextureType;
    (function (TextureType) {
        TextureType[TextureType["None"] = 0] = "None";
        TextureType[TextureType["Transition"] = 1] = "Transition";
        TextureType[TextureType["Mobile"] = 2] = "Mobile";
        TextureType[TextureType["Full"] = 3] = "Full";
    })(TextureType = exports.TextureType || (exports.TextureType = {}));
    class Material {
        constructor(textureHasTransparency = false) {
            this.material = undefined; // BABYLON.Material
            this._textureHasTransparency = false;
            this.textureType = TextureType.None;
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            this._textureHasTransparency = textureHasTransparency;
            this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
            this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            this.material.specularColor = new BABYLON.Color3(0, 0, 0);
            this.material.diffuseTexture = null;
            this.material.backFaceCulling = false;
        }
        loadTexture(textureFileName, callBack = function () { }, pickTextureType) {
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            // let isMobile: boolean = Globals.get("isMobile");
            // let recentlyMoved: boolean = SphereCollection.hasEnoughTimePastSinceLastMove();
            let filename = "";
            // Use the TextureType specified
            switch (pickTextureType) {
                case TextureType.Transition:
                    // Load the very low-res texture, for transitions
                    filename = textureFileName + ".transition.png";
                    this.textureType = TextureType.Transition;
                    break;
                case TextureType.Mobile:
                    // Load the low-res texture
                    filename = textureFileName + ".small.png";
                    this.textureType = TextureType.Mobile;
                    break;
                case TextureType.Full:
                    // Load high-res texture
                    filename = textureFileName;
                    this.textureType = TextureType.Full;
                    break;
                default:
                    console.log("ERROR!");
                    debugger;
            }
            if (filename !== "") {
                // Need to load new texture, so proceed
                if (Globals.get("breakCaching") === false) {
                    filename = filename + "?" + Math.random().toString();
                }
                var assetsManager = new BABYLON.AssetsManager(scene);
                assetsManager.useDefaultLoadingScreen = false;
                assetsManager.addTextureTask("textureId" + Math.random().toString(), filename);
                assetsManager.onTaskSuccess = (tasks) => {
                    // Get rid of old texture to free memory
                    if ((this.material.emissiveTexture !== undefined) && (this.material.emissiveTexture !== null)) {
                        this.material.emissiveTexture.dispose();
                    }
                    this.material.emissiveTexture = tasks.texture; // videoTexture;
                    if (this._textureHasTransparency) {
                        this.material.opacityTexture = tasks.texture;
                    }
                    // console.log("=================");
                    // console.log("Material loaded: " + filename);
                    // try {
                    //     console.log("Current material:" + SphereCollection.getCurrentSphere().textureFileName);
                    // } catch(err) {
                    // }
                    callBack();
                };
                // assetsManager.onTaskError = (tasks) => {
                //     alert("ERROR!");
                //     debugger;
                // }
                assetsManager.load();
                return true; // because it changed
            }
            else {
                // No need to load new texture.
                callBack();
                return false;
            }
        }
        unloadTextureFromMemory() {
            this.textureType = TextureType.None;
            if (this.material !== undefined) {
                this.material.emissiveTexture.dispose();
                this.material.emissiveTexture = null;
                // this.material.dispose();
                // this.material = null;
            }
        }
    }
    exports.Material = Material;
});