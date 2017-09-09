define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Shader {
        constructor(scene, BABYLON) {
            this.material = undefined;
            this.material = new BABYLON.StandardMaterial("mat", scene);
            this.material.backFaceCulling = false;
            this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            this.material.specularColor = new BABYLON.Color3(0, 0, 0);
            this.material.diffuseTexture = null;
            this.material.emissiveTexture = null; // videoTexture;
        }
        setTextures(texture) {
            this.material.emissiveTexture = texture;
        }
    }
    exports.Shader = Shader;
});
