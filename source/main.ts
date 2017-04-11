// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.

import Setup from "./Core/Setup";
import Shaders from "./Shader/Shader";
import Core from "./Core/Core";
import Event from "./Events/Event";
import DistanceToMesh from "./Events/TriggerConditionals/DistanceToMesh";
import FadeOutMesh from "./Events/Actions/FadeOutMesh";
import ScreenWhite from "./Events/Actions/ScreenWhite";
import MoveCamera from "./Events/Actions/MoveCamera";
import AdministerQuiz from "./Events/Actions/AdministerQuiz";
import KeyPress from "./Events/TriggerConditionals/KeyPress";
import GameStart from "./Events/TriggerConditionals/GameStart";
import ClickedObject from "./Events/TriggerConditionals/ClickedObject";
import LabelOnMesh from "./Events/Actions/LabelOnMesh";
import CameraChar from "./CameraChar";


interface MyWindow extends Window {
    Core: any;
}
declare var window: MyWindow;
window.Core = Core;

/**
BABYLON is an external JavaScript library. This prevents Typescript from
throwing errors because BABYLON isn't defined in the TypeScript file.
*/
declare var BABYLON: any;
// declare var jQuery: any;

// this function was added in so the app could be run from the config.ts file with requirejs
// jQuery is passed as an arg so this function and any module it utilizes can use jquery from the config.ts path object
export function start(jQuery) {

    let setCustomShaders = function() {
        /**
        A function to create any custom shaders
        */

        // Create any custom shaders.
        let surf_params = {
            "name": "surface1",
            "_animationType": "None", // "WaveBobbing",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "SimplexBlend",
            "_useShadowMap": true,
            "_hasTransparency": true,
            "textureSampler1": new BABYLON.Texture("imgs/moss.jpg", Core.scene),
            "textureRepeat1": 9.,
            "textureSampler2": new BABYLON.Texture("imgs/concrete.jpg", Core.scene),
            "textureRepeat2": 7.,
            "noiseTurbulence": 3.,
            "noiseAmplitude": 0.2,
            "animationSpeed": 1.,
            "animationStrength": 0.4 ,
            "animationNoiseTurbulenceFactor": 0.,
            "animationOrigin": new BABYLON.Vector3(4, 2, -4),
            "shadowMapSampler": new BABYLON.Texture("imgs/surf_shadow.jpg", Core.scene),
            "alpha": 1.0
        }

        Shaders.create(surf_params);

        surf_params["name"] = "surface2";
        surf_params["animationOrigin"] = new BABYLON.Vector3(-5.2, 25.2, 5.6);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/surf2_shadow.jpg", Core.scene);
        surf_params["_hasTransparency"] = false;
        Shaders.create(surf_params);

        surf_params["name"] = "surface3";
        surf_params["animationOrigin"] = new BABYLON.Vector3(-3.8, -31.6, 6.9);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/surf3_shadow.jpg", Core.scene);
        Shaders.create(surf_params);

        let urea_params = {
            "name": "urea1",
            "_animationType": "None", // "WaveBobbing",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "ConstantBlend",
            "_useShadowMap": true,
            "textureSampler1": new BABYLON.Texture("imgs/sand.jpg", Core.scene),
            "textureRepeat1": 9.,
            "textureSampler2": new BABYLON.Texture("imgs/moss.jpg", Core.scene),
            "textureRepeat2": 7.,
            // "noiseTurbulence": 3.,
            // "noiseAmplitude": 0.2,
            "animationSpeed": 1.,
            "animationStrength": 0.4 ,
            // "animationNoiseTurbulenceFactor": 0.,
            "animationOrigin": new BABYLON.Vector3(-25.8, -9.9, 5.9),
            "shadowMapSampler": new BABYLON.Texture("imgs/urea1_shadow.jpg", Core.scene),
        }

        Shaders.create(urea_params);

        urea_params["name"] = "urea2";
        urea_params["animationOrigin"] = new BABYLON.Vector3(17.8, -15.8, 10.4);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/urea2_shadow.jpg", Core.scene);
        Shaders.create(urea_params);

        urea_params["name"] = "urea3";
        urea_params["animationOrigin"] = new BABYLON.Vector3(23.6, 24.2, 7.2);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/urea3_shadow.jpg", Core.scene);
        Shaders.create(urea_params);

        urea_params["name"] = "urea4";
        urea_params["animationOrigin"] = new BABYLON.Vector3(-22.8, 19.4, 14.7);
        surf_params["shadowMapSampler"] = new BABYLON.Texture("imgs/urea4_shadow.jpg", Core.scene);
        Shaders.create(urea_params);


        // Create any custom shaders.
        Shaders.create({
            "name": "ribbon",
            "_animationType": "None", // "WaveBobbing",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "SimplexBlend",
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
            "animationOrigin": new BABYLON.Vector3(4, 2, -4),
            "shadowMapSampler": new BABYLON.Texture("imgs/ribbon_shadow.jpg", Core.scene),
        });

        Shaders.create({
            "name": "grnd",
            "_animationType": "None", // "WaveAlongVertical",
            "_hasGlossyEffect": false,
            "_hasDiffuseEffect": false,
            "_numTextures": 2,
            "_textureBlendingType": "ConstantBlend",
            "_useShadowMap": true,
            "textureSampler1": new BABYLON.Texture("imgs/red1.jdd.jpg", Core.scene),
            "textureRepeat1": 21.,
            "textureSampler2": new BABYLON.Texture("imgs/red2.jdd.jpg", Core.scene),
            "textureRepeat2": 17.,
            "noiseTurbulence": 17.,
            "noiseAmplitude": 0.2,
            "animationSpeed": 1.,
            "animationStrength": 0.2 ,
            "animationNoiseTurbulenceFactor": 0.,
            "shadowMapSampler": new BABYLON.Texture("imgs/shadow_ground.jpg", Core.scene),
        });
    };

    let setEvents = function() {
        /**
        A function to register any events.
        */
        // new Event(
        //     new GameStart({}, jQuery),
        //     new MoveCamera({
        //         camera: CameraChar.camera,
        //         milliseconds: 1000,
        //         startPoint: CameraChar.camera.position,
        //         endPoint: new BABYLON.Vector3(CameraChar.camera.position.x + 25, CameraChar.camera.position.y, CameraChar.camera.position.z)
        //     })
        // );

        new Event(
            new KeyPress({
                event: 'keypress',
                action: new AdministerQuiz({
                    quiz: {
                            "name": "Sample Quiz",

                            "questions" : {
                               "question1": {
                                    "question": "What is my favorite color?",
                                    "option1": "Green",
                                    "option2": "Blue",
                                    "option3": "Red",
                                    "option4": "Orange",
                                    "answer": "Blue"
                                },
                            "question2": {
                                    "question": "Where am I?",
                                    "option1": "Here",
                                    "option2": "There",
                                    "option3": "Everywhere",
                                    "option4": "Nowhere",
                                    "answer": "Here"
                                }
                            }  
                        },
                    length: 2
                })
            })
        );

        new Event(
            new DistanceToMesh({
                triggerMesh: Core.meshesByName["surf_trgt"], 
                cutOffDistance: 9.0
            }),
            new ScreenWhite({
                mesh: Core.meshesByName["surf"], 
                milliseconds: 2000
            })   
        );

        new Event(
            new DistanceToMesh({
                triggerMesh: Core.meshesByName["surf_trgt"], 
                cutOffDistance: 9.0
            }),
            new MoveCamera({
                camera: CameraChar.camera,
                milliseconds: 1000,
                startPoint: CameraChar.camera.position,
                endPoint: new BABYLON.Vector3(CameraChar.camera.position.x + 25, CameraChar.camera.position.y, CameraChar.camera.position.z)
            })
        );

        // new Event(
            // new GameStart({}, jQuery),
            // new MoveCamera({
                // camera: CameraChar.camera,
                // milliseconds: 1000,
                // startPoint: CameraChar.camera.position,
                // endPoint: new BABYLON.Vector3(CameraChar.camera.position.x + 25, CameraChar.camera.position.y, CameraChar.camera.position.z)
            // }),
            // true,
            // jQuery
        // );

        // new Event(
        //     new ClickedObject({
        //         triggerMesh: Core.meshesByName["grnd"],
        //         action: new MoveCamera({
        //             camera: CameraChar.camera,
        //             milliseconds: 1000,
        //             startPoint: CameraChar.camera.position,
        //             endPoint: new BABYLON.Vector3(CameraChar.camera.position.x + 25, CameraChar.camera.position.y, CameraChar.camera.position.z)
        //         })
        //     }, Core),           
        // );
        new Event(
            new ClickedObject({
             triggerMesh: Core.meshesByName["grnd"],
                action: new LabelOnMesh({
                    label: "Hi :)",
                })
            }, Core),
        );
    };

    // Setup the VR program.
    Setup.setup(setCustomShaders, setEvents, jQuery);
}