// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.
 requirejs.config({
        paths: {
            jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min'
            // Babylon: '../js/Babylonjs/dist/babylon.2.4.max',
            // webVRCamera: '../js/Babylonjs/src/Cameras/VR/babylon.webVRCamera'
        }
    });

requirejs(["jquery", "./Core/Setup", "./Shader/Shader", "./Core/Core", "./Events/Event", 
            "./Events/TriggerConditionals/DistanceToMesh", 
                "./Events/Actions/ScreenWhite"], 
                function ($, Setup_1, Shader_1, Core_1, Event_1, DistanceToMesh_1, ScreenWhite_1) {
    "use strict";
    console.log($);
    console.log(BABYLON);
    window.Core = Core_1.default;
    var setCustomShaders = function () {
        /**
        A function to create any custom shaders
        */
        // Create any custom shaders.
        var surf_params = {
            "name": "surface1",
            "_animationType": "WaveBobbing",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "SimplexBlend",
            "_useShadowMap": true,
            "_hasTransparency": true,
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
            "shadowMapSampler": new BABYLON.Texture("imgs/surf_shadow.jpg", Core_1.default.scene),
            "alpha": 1.0
        };
        Shader_1.default.create(surf_params);
        surf_params["name"] = "surface2";
        surf_params["animationOrigin"] = new BABYLON.Vector3(-5.2, 25.2, 5.6);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/surf2_shadow.jpg", Core_1.default.scene);
        surf_params["_hasTransparency"] = false;
        Shader_1.default.create(surf_params);
        surf_params["name"] = "surface3";
        surf_params["animationOrigin"] = new BABYLON.Vector3(-3.8, -31.6, 6.9);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/surf3_shadow.jpg", Core_1.default.scene);
        Shader_1.default.create(surf_params);
        var urea_params = {
            "name": "urea1",
            "_animationType": "WaveBobbing",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "ConstantBlend",
            "_useShadowMap": true,
            "textureSampler1": new BABYLON.Texture("imgs/sand.jpg", Core_1.default.scene),
            "textureRepeat1": 9.,
            "textureSampler2": new BABYLON.Texture("imgs/moss.jpg", Core_1.default.scene),
            "textureRepeat2": 7.,
            // "noiseTurbulence": 3.,
            // "noiseAmplitude": 0.2,
            "animationSpeed": 1.,
            "animationStrength": 0.4,
            // "animationNoiseTurbulenceFactor": 0.,
            "animationOrigin": new BABYLON.Vector3(-25.8, -9.9, 5.9),
            "shadowMapSampler": new BABYLON.Texture("imgs/urea1_shadow.jpg", Core_1.default.scene),
        };
        Shader_1.default.create(urea_params);
        urea_params["name"] = "urea2";
        urea_params["animationOrigin"] = new BABYLON.Vector3(17.8, -15.8, 10.4);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/urea2_shadow.jpg", Core_1.default.scene);
        Shader_1.default.create(urea_params);
        urea_params["name"] = "urea3";
        urea_params["animationOrigin"] = new BABYLON.Vector3(23.6, 24.2, 7.2);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/urea3_shadow.jpg", Core_1.default.scene);
        Shader_1.default.create(urea_params);
        urea_params["name"] = "urea4";
        urea_params["animationOrigin"] = new BABYLON.Vector3(-22.8, 19.4, 14.7);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/urea4_shadow.jpg", Core_1.default.scene);
        Shader_1.default.create(urea_params);
        // Create any custom shaders.
        Shader_1.default.create({
            "name": "ribbon",
            "_animationType": "WaveBobbing",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "SimplexBlend",
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
            "shadowMapSampler": new BABYLON.Texture("imgs/ribbon_shadow.jpg", Core_1.default.scene),
        });
        Shader_1.default.create({
            "name": "grnd",
            "_animationType": "WaveAlongVertical",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "ConstantBlend",
            "_useShadowMap": true,
            "textureSampler1": new BABYLON.Texture("imgs/red1.jdd.jpg", Core_1.default.scene),
            "textureRepeat1": 21.,
            "textureSampler2": new BABYLON.Texture("imgs/red2.jdd.jpg", Core_1.default.scene),
            "textureRepeat2": 17.,
            "noiseTurbulence": 17.,
            "noiseAmplitude": 0.2,
            "animationSpeed": 1.,
            "animationStrength": 0.2,
            "animationNoiseTurbulenceFactor": 0.,
            "shadowMapSampler": new BABYLON.Texture("imgs/shadow_ground.jpg", Core_1.default.scene),
        });
    };
    var setEvents = function () {
        /**
        A function to register any events.
        */
        new Event_1.default(new DistanceToMesh_1.default({
            triggerMesh: Core_1.default.meshesByName["surf_trgt"],
            cutOffDistance: 9.0
        }), new ScreenWhite_1.default({
            mesh: Core_1.default.meshesByName["surf"],
            milliseconds: 2000
        }));
    };
    // Setup the VR program.
    Setup_1.default.setup(setCustomShaders, setEvents);
    jQuery(document).ready(function () {
        $.getScript("./js/_trkr/_trkr.js");
    });
});
