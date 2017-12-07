import * as Globals from "../config/Globals";

export class Material {
    private _scene: any;  // BABYLON.Scene
    public material: any = undefined;  // BABYLON.Material
    private _textureHasTransparency: boolean = false;

    constructor(textureFilename: string, textureHasTransparency: boolean = false, callBack = function() {}) {
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        this._textureHasTransparency = textureHasTransparency;
        
        // let dirname = textureFilename.indexOf("/") === -1 ? "" : textureFilename.match(/.*\//)[0];
        // let basename = textureFilename.replace( /.*\//, "" );

        // BABYLON.SceneLoader.Append(dirname, basename + ".babylon", scene, () => {
            // scene.executeWhenReady(() => {
                // Search through the materials to find the one with the id
                // that == basename

                // let tmpMaterialToGetTexture = undefined;
                // for (let i=0; i<scene.materials.length; i++) {
                //     let mat = scene.materials[i];
                //     if (mat.id === basename) {
                //         tmpMaterialToGetTexture = mat;
                //         break;
                //     }
                // }

                // if (tmpMaterialToGetTexture === undefined) {
                //     console.log("ERROR!");
                //     debugger;
                // }

                // let texture = tmpMaterialToGetTexture.emissiveTexture;

                // this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
                // this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                // this.material.specularColor = new BABYLON.Color3(0, 0, 0);
                // this.material.diffuseTexture = null;
                // this.material.emissiveTexture = texture; // videoTexture;
                // if (this._textureHasTransparency) {
                //     this.material.opacityTexture = texture;
                // }
                
                // this.material.backFaceCulling = false;

                // // Dispose of unneeded stuff
                // tmpMaterialToGetTexture.dispose();
                // tmpMaterialToGetTexture = null;

                var assetsManager = new BABYLON.AssetsManager(scene);
                assetsManager.addTextureTask("textureId", textureFilename);   
                assetsManager.onTaskSuccess = (tasks) => {
                    this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
                    this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                    this.material.specularColor = new BABYLON.Color3(0, 0, 0);
                    this.material.diffuseTexture = null;
                    this.material.emissiveTexture = tasks.texture; // videoTexture;
                    if (this._textureHasTransparency) {
                        this.material.opacityTexture = tasks.texture;
                    }
                    
                    this.material.backFaceCulling = false;

                    callBack();
                }
                assetsManager.load();

                
            // });
        // });
    }

    public unloadTextureFromMemory() {
        if (this.material !== undefined) {
            this.material.emissiveTexture.dispose();
            this.material.emissiveTexture = null;
            this.material.dispose();
            this.material = null;
        }
    }
}