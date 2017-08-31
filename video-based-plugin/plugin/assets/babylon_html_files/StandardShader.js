define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var Shader = (function () {
        function Shader(scene, BABYLON) {
            this.material = undefined;
            this.material = new BABYLON.StandardMaterial("mat", scene);
            this.material.backFaceCulling = false;
            this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            this.material.specularColor = new BABYLON.Color3(0, 0, 0);
            this.material.diffuseTexture = null;
            this.material.emissiveTexture = null; // videoTexture;
        }
        Shader.prototype.setTextures = function (texture) {
            this.material.emissiveTexture = texture;
        };
        return Shader;
    }());
    exports.Shader = Shader;
});
