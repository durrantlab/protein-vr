import * as Globals from "../config/Globals";

export class Shader {
    private _scene: any;
    public material: any = undefined;
    private _transparency: boolean = false;

    constructor(textureFilename, transparency: boolean = false, callBack = function() {}) {
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        this._transparency = transparency;

        let texture = new BABYLON.Texture(textureFilename, scene, false, true, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, () => {
            callBack();
        });

        this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
        this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.material.specularColor = new BABYLON.Color3(0, 0, 0);
        this.material.diffuseTexture = null;
        this.material.emissiveTexture = texture; // videoTexture;
        if (this._transparency) {
            this.material.opacityTexture = texture;
        }
        
        this.material.backFaceCulling = false;
    }
}