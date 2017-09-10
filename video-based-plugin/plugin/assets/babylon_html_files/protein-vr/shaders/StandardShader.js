define(["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Shader {
        constructor(transparency = false) {
            this.material = undefined;
            this._transparency = false;
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
        setTextures(texture) {
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
    exports.Shader = Shader;
});
