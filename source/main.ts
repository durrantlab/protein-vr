// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.

import Setup from "./Core/Setup";
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
import UserVars from "./UserVars";

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

    Core.sceneDirectory = "blender_plugin/proteinvr_scene_prepped/"; // "scene/rbc/";  // Here to load the scene files.

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

        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: Core.meshesByName["surf_trgt"], 
        //         cutOffDistance: 9.0
        //     }),
        //     new ScreenWhite({
        //         mesh: Core.meshesByName["surf"], 
        //         milliseconds: 2000
        //     })   
        // );

        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: Core.meshesByName["surf_trgt"], 
        //         cutOffDistance: 9.0
        //     }),
        //     new MoveCamera({
        //         camera: CameraChar.camera,
        //         milliseconds: 1000,
        //         startPoint: CameraChar.camera.position,
        //         endPoint: new BABYLON.Vector3(CameraChar.camera.position.x + 25, CameraChar.camera.position.y, CameraChar.camera.position.z)
        //     })
        // );

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
    }

    // Setup the VR program.
    Setup.setup(setEvents, jQuery);

    console.log("Sys vars should be setup!");
    console.log(UserVars);
}