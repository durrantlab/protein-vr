// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.
define(["require", "exports", "./Core/Setup", "./Shader/Shader", "./Core/Core"], function (require, exports, Setup_1, Shader_1, Core_1) {
    "use strict";
    // Setup the VR program.
    Setup_1.default.setup(function () {
        // Create any custom shaders.
        Shader_1.default.create({
            "name": "surface",
            "_animationType": Shader_1.default.AnimationType.WaveBobbing,
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": Shader_1.default.TextureBlendingType.SimplexBlend,
            "_useShadowMap": true,
            "textureSampler1": new BABYLON.Texture("imgs/moss.jpg", Core_1.default.scene),
            "textureRepeat1": 9.,
            "textureSampler2": new BABYLON.Texture("imgs/concrete.jpg", Core_1.default.scene),
            "textureRepeat2": 7.,
            "noiseTurbulence": 3.,
            "noiseAmplitude": 0.2,
            "animationSpeed": 1.,
            "animationStrength": 0.4,
            "animationNoiseTurbulenceFactor": 0.,
            "animationOrigin": new BABYLON.Vector3(4, 2, -4),
            "shadowMapSampler": new BABYLON.Texture("imgs/shadow.jpg", Core_1.default.scene),
        });
        Shader_1.default.create({
            "name": "grnd",
            "_animationType": Shader_1.default.AnimationType.WaveAlongVertical,
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": Shader_1.default.TextureBlendingType.SimplexBlend,
            "_useShadowMap": true,
            "textureSampler1": new BABYLON.Texture("imgs/moss.jpg", Core_1.default.scene),
            "textureRepeat1": 9.,
            "textureSampler2": new BABYLON.Texture("imgs/snowy.jpg", Core_1.default.scene),
            "textureRepeat2": 7.,
            "noiseTurbulence": 3.,
            "noiseAmplitude": 0.2,
            "animationSpeed": 1.,
            "animationStrength": 0.4,
            "animationNoiseTurbulenceFactor": 0.,
            "shadowMapSampler": new BABYLON.Texture("imgs/shadow_ground.jpg", Core_1.default.scene),
        });
    });
});
