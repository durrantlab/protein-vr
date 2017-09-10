import * as Globals from "../config/Globals";

export class Shader {
    private _scene: any;
    public material: any = undefined;
    private _transparency: boolean = false;

    constructor(transparency: boolean = false) {
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        this._transparency = transparency;

        this.material = new BABYLON.StandardMaterial("mat", scene);
        this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        this.material.specularColor = new BABYLON.Color3(0, 0, 0);
        this.material.diffuseTexture = null;
        this.material.emissiveTexture = null; // videoTexture;
        
        // switch (transparency) {
        //     case true:
        //         this.material.backFaceCulling = true;
        //         break;
        //     case false:
                this.material.backFaceCulling = false;
        //         break;
        // }
    }

    public setTextures(texture) {
        // if (this._transparency == true) {
            // texture.hasAlpha = true;
        // }

        this.material.emissiveTexture = texture;

        if (this._transparency) {
            this.material.opacityTexture = texture;
        }
        // this.material.diffuseTexture = texture;
        // this.material.linkEmissiveWithDiffuse = true;
    }
}