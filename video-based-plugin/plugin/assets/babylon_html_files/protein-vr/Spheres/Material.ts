import * as Globals from "../config/Globals";
import * as SphereCollection from "./SphereCollection";

export enum TextureType {
    None, Mobile, Full
}

export class Material {
    private _scene: any;  // BABYLON.Scene
    public material: any = undefined;  // BABYLON.Material
    private _textureHasTransparency: boolean = false;
    public textureType: TextureType = TextureType.None;

    constructor(textureHasTransparency: boolean = false) {
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");

        this._textureHasTransparency = textureHasTransparency;
        this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
        this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.material.specularColor = new BABYLON.Color3(0, 0, 0);
        this.material.diffuseTexture = null;
        this.material.backFaceCulling = false;
    }

    public loadTexture(textureFileName: string, callBack = function() {}, pickTextureType: TextureType = undefined): boolean {
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");

        let isMobile: boolean = Globals.get("isMobile");
        let recentlyMoved: boolean = SphereCollection.hasEnoughTimePastSinceLastMove();

        let filename: string = "";

        if (pickTextureType === undefined) {
            // Figure out based on what's been previously loaded.
            switch (this.textureType) {
                case TextureType.None:
                    // So you need to lead a texture.
                    if (recentlyMoved || isMobile) {
                        // Load the low-res texture
                        filename = textureFileName + ".small.png";
                        this.textureType = TextureType.Mobile;
                    } else {
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
        } else {
            // Use the TextureType specified
            switch(pickTextureType) {
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
            }
            assetsManager.load();

            return true;  // because it changed
        } else {
            // No need to load new texture.
            callBack();
            return false;
        }
    }

    public unloadTextureFromMemory() {
        if (this.material !== undefined) {
            this.material.emissiveTexture.dispose();
            this.material.emissiveTexture = null;
            this.textureType = TextureType.None;

            // this.material.dispose();
            // this.material = null;
        }
    }
}