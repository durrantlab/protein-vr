// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.

import Setup from "./Core/Setup";
import Shaders from "./Shader/Shader";
import Core from "./Core/Core";

/**
 * BABYLON is an external JavaScript library. This prevents Typescript from
 * throwing errors because BABYLON isn't defined in the TypeScript file.
 */
declare var BABYLON: any;

// Setup the VR program.
Setup.setup(function() {
    // Create any custom shaders.
    Shaders.create({
        "name": "surface",
        "_animationType": Shaders.AnimationType.WaveBobbing,
        "_hasGlossyEffect": false,
        "_hasDiffuseEffect": false,
        "_numTextures": 2,
        "_textureBlendingType": Shaders.TextureBlendingType.SimplexBlend,
        "_useShadowMap": true,
        "textureSampler1": new BABYLON.Texture("imgs/moss.jpg", Core.scene),
        "textureRepeat1": 9.,
        "textureSampler2": new BABYLON.Texture("imgs/concrete.jpg", Core.scene),
        "textureRepeat2": 7.,
        "noiseTurbulence": 3.,
        "noiseAmplitude": 0.2,
        "animationSpeed": 1.,
        "animationStrength": 0.4 ,
        "animationNoiseTurbulenceFactor": 0.,
        "animationOrigin": new BABYLON.Vector3(4,2,-4),
        "shadowMapSampler": new BABYLON.Texture("imgs/shadow.jpg", Core.scene),
    });

    Shaders.create({
        "name": "grnd",
        "_animationType": Shaders.AnimationType.WaveAlongVertical,
        "_hasGlossyEffect": false,
        "_hasDiffuseEffect": false,
        "_numTextures": 2,
        "_textureBlendingType": Shaders.TextureBlendingType.SimplexBlend,
        "_useShadowMap": true,
        "textureSampler1": new BABYLON.Texture("imgs/moss.jpg", Core.scene),
        "textureRepeat1": 9.,
        "textureSampler2": new BABYLON.Texture("imgs/snowy.jpg", Core.scene),
        "textureRepeat2": 7.,
        "noiseTurbulence": 3.,
        "noiseAmplitude": 0.2,
        "animationSpeed": 1.,
        "animationStrength": 0.4 ,
        "animationNoiseTurbulenceFactor": 0.,
        "shadowMapSampler": new BABYLON.Texture("imgs/shadow_ground.jpg", Core.scene),
    });
});





