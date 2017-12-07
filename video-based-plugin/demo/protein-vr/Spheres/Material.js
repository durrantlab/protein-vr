define(["require", "exports", "../config/Globals", "./SphereCollection"], function (require, exports, Globals, SphereCollection) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TextureType;
    (function (TextureType) {
        TextureType[TextureType["None"] = 0] = "None";
        TextureType[TextureType["Mobile"] = 1] = "Mobile";
        TextureType[TextureType["Full"] = 2] = "Full";
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
        loadTexture(textureFileName, callBack = function () { }, pickTextureType = undefined) {
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            let isMobile = Globals.get("isMobile");
            let recentlyMoved = SphereCollection.hasEnoughTimePastSinceLastMove();
            let filename = "";
            if (pickTextureType === undefined) {
                // Figure out based on what's been previously loaded.
                switch (this.textureType) {
                    case TextureType.None:
                        // So you need to lead a texture.
                        if (recentlyMoved || isMobile) {
                            // Load the low-res texture
                            filename = textureFileName + ".small.png";
                            this.textureType = TextureType.Mobile;
                        }
                        else {
                            // Load the high-res texture
                            filename = textureFileName;
                            this.textureType = TextureType.Full;
                        }
                        break;
                    case TextureType.Mobile:
                        if (!recentlyMoved && !isMobile) {
                            // Load high-res texture
                            filename = textureFileName;
                            this.textureType = TextureType.Full;
                        }
                        break;
                    case TextureType.Full:
                        // Nothing to do.
                        break;
                }
            }
            else {
                // Use the TextureType specified
                switch (pickTextureType) {
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
            }
            if (filename !== "") {
                // Need to load new texture, so proceed
                if (Globals.get("breakCaching") === false) {
                    filename = filename + "?" + Math.random().toString();
                }
                var assetsManager = new BABYLON.AssetsManager(scene);
                assetsManager.addTextureTask("textureId", filename);
                assetsManager.onTaskSuccess = (tasks) => {
                    this.material.emissiveTexture = tasks.texture; // videoTexture;
                    if (this._textureHasTransparency) {
                        this.material.opacityTexture = tasks.texture;
                    }
                    callBack();
                };
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
            if (this.material !== undefined) {
                this.material.emissiveTexture.dispose();
                this.material.emissiveTexture = null;
                this.textureType = TextureType.None;
                // this.material.dispose();
                // this.material = null;
            }
        }
    }
    exports.Material = Material;
});
