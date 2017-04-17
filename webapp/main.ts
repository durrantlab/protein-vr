// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.


import Event from "./proteinvr/Events/Event";
import DistanceToMesh from "./proteinvr/Events/TriggerConditionals/DistanceToMesh";
import FadeOutMesh from "./proteinvr/Events/Actions/FadeOutMesh";
import ScreenWhite from "./proteinvr/Events/Actions/ScreenWhite";
import MoveCamera from "./proteinvr/Events/Actions/MoveCamera";
import AdministerQuiz from "./proteinvr/Events/Actions/AdministerQuiz";
import KeyPress from "./proteinvr/Events/TriggerConditionals/KeyPress";
import GameStart from "./proteinvr/Events/TriggerConditionals/GameStart";
import ClickedObject from "./proteinvr/Events/TriggerConditionals/ClickedObject";
import LabelOnMesh from "./proteinvr/Events/Actions/LabelOnMesh";
import CameraChar from "./proteinvr/CameraChar";

/**
BABYLON is an external JavaScript library. This prevents Typescript from
throwing errors because BABYLON isn't defined in the TypeScript file.
*/
declare var BABYLON: any;
declare var jQuery: any;  // attached to window in RequireConfig.ts
declare var Core: any;  // attached to window in RequireConfig.ts

// this function was added in so the app could be run from the config.ts file with requirejs
// jQuery is passed as an arg so this function and any module it utilizes can use jquery from the config.ts path object
export function start() {
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
    }


    return setEvents;
}