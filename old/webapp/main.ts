// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.


import Event from "./proteinvr/Events/Event";
import DistanceToMesh from "./proteinvr/Events/TriggerConditionals/DistanceToMesh";
import MorphMesh from "./proteinvr/Events/Actions/MorphMesh";
import FadeOutMesh from "./proteinvr/Events/Actions/FadeOutMesh";
import ScreenWhite from "./proteinvr/Events/Actions/ScreenWhite";
import MoveCamera from "./proteinvr/Events/Actions/MoveCamera";
import AdministerQuiz from "./proteinvr/Events/Actions/AdministerQuiz";
import KeyPress from "./proteinvr/Events/TriggerConditionals/KeyPress";
import AlwaysTrue from "./proteinvr/Events/TriggerConditionals/AlwaysTrue";
import ClickedObject from "./proteinvr/Events/TriggerConditionals/ClickedObject";
import LabelOnMesh from "./proteinvr/Events/Actions/LabelOnMesh";
import DoInInterval from "./proteinvr/Events/Actions/DoInInterval";
import AnimateMesh from "./proteinvr/Events/Actions/AnimateMesh";
import SetMeshFrame from "./proteinvr/Events/Actions/SetMeshFrame";
import * as CameraChar from "./proteinvr/CameraChar";
import {LensFlare} from "./proteinvr/Environment";

/**
BABYLON is an external JavaScript library. This prevents Typescript from
throwing errors because BABYLON isn't defined in the TypeScript file.
*/
declare var BABYLON: any;
declare var PVRGlobals;
//var jQuery = PVRGlobals.jQuery;

// declare var Core: any;  // attached to window in RequireConfig.ts

// this function was added in so the app could be run from the config.ts file with requirejs
// jQuery is passed as an arg so this function and any module it utilizes can use jquery from the config.ts path object
export function start(Core) {
    let setEvents = function() {
        /**
        A function to register any events.
        */

        // new Event(
        //     // new DistanceToMesh({
        //     //     triggerMesh: PVRGlobals.meshesByName["jacob"], 
        //     //     cutOffDistance: 5.0
        //     // }),
        //     new AlwaysTrue({}),
        //     new AnimateMesh({
        //         mesh: PVRGlobals.meshesByName["jacob"],
        //         startFrame: 1,
        //         endFrame: 240,
        //         loop: true,
        //         callBack: undefined
        //     })
        // );

        // new Event(
        //     new AlwaysTrue({}),
        //     new SetMeshFrame({
        //         mesh: PVRGlobals.meshesByName["jacob"],
        //         frame: 1
        //     })
        // );

        // new Event(
        //     new AlwaysTrue({}),
        //     new SetMeshFrame({
        //         mesh: PVRGlobals.meshesByName["carla"],
        //         frame: 1
        //     })
        // );

        // new Event(
        //     new AlwaysTrue({}),
        //     new SetMeshFrame({
        //         mesh: PVRGlobals.meshesByName["max"],
        //         frame: 1
        //     })
        // );

        // new Event(
        //     new GameStart({}, jQuery),
        //     new MoveCamera({
        //         camera: PVRGlobals.camera,
        //         milliseconds: 1000,
        //         startPoint: PVRGlobals.camera.position,
        //         endPoint: new BABYLON.Vector3(PVRGlobals.camera.position.x + 25, PVRGlobals.camera.position.y, PVRGlobals.camera.position.z)
        //     })
        // );

        // new Event(
        //     new KeyPress({
        //         event: 'keypress',
        //         action: new AdministerQuiz({
        //             quiz: {
        //                     "name": "Sample Quiz",
        //                     "questions" : {
        //                        "question1": {
        //                             "question": "What is my favorite color?",
        //                             "option1": "Green",
        //                             "option2": "Blue",
        //                             "option3": "Red",
        //                             "option4": "Orange",
        //                             "answer": "Blue"
        //                         },
        //                     "question2": {
        //                             "question": "Where am I?",
        //                             "option1": "Here",
        //                             "option2": "There",
        //                             "option3": "Everywhere",
        //                             "option4": "Nowhere",
        //                             "answer": "Here"
        //                         }
        //                     }  
        //                 },
        //             length: 2
        //         })
        //     })
        // );

        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: PVRGlobals.meshesByName["surf_trgt"], 
        //         cutOffDistance: 9.0
        //     }),
        //     new ScreenWhite({
        //         mesh: PVRGlobals.meshesByName["surf"], 
        //         milliseconds: 2000
        //     })   
        // );

// ***
        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: PVRGlobals.meshesByName["NA_patch_single_outer"], 
        //         cutOffDistance: 2.0
        //     }),
        //     new FadeOutMesh({
        //         mesh: PVRGlobals.meshesByName["NA_patch_single_outer"],
        //         milliseconds: 2000
        //     })
        // );

        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: PVRGlobals.meshesByName["Na_text"], 
        //         cutOffDistance: 5.0
        //     }),
        //     new MorphMesh({
        //         meshName: "tube.004_inner",
        //         milliseconds: 5000,
        //         startTargetName: "sway",
        //         endTargetName: "sway2",
        //         looping: true,
        //         easeInOut: true
        //     })
        // );

        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: PVRGlobals.meshesByName["Na_text"], 
        //         cutOffDistance: 5.0
        //     }),
        //     new MorphMesh({
        //         meshName: "tube.005_inner",
        //         milliseconds: 5000,
        //         startTargetName: "sway",
        //         endTargetName: "Base",
        //         looping: true,
        //         easeInOut: true
        //     })
        // );

        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: PVRGlobals.meshesByName["Na_text"], 
        //         cutOffDistance: 5.0
        //     }),
        //     new MorphMesh({
        //         meshName: "tube.006_inner",
        //         milliseconds: 5000,
        //         startTargetName: "sway",
        //         endTargetName: "Base",
        //         looping: true,
        //         easeInOut: true
        //     })
        // );

        // new Event(
        //     new DistanceToMesh({
        //         triggerMesh: PVRGlobals.meshesByName["Na_text"], 
        //         cutOffDistance: 5.0
        //     }),
        //     new MorphMesh({
        //         meshName: "tube.007_inner",
        //         milliseconds: 5000,
        //         startTargetName: "sway",
        //         endTargetName: "Base",
        //         looping: true,
        //         easeInOut: true
        //     })
        // );

        // new MoveCamera({
        //     camera: PVRGlobals.camera,
        //     milliseconds: 1000,
        //     startPoint: PVRGlobals.camera.position,
        //     endPoint: new BABYLON.Vector3(PVRGlobals.camera.position.x + 25, PVRGlobals.camera.position.y, PVRGlobals.camera.position.z)
        // })
        
        // new Event(
        //     new AlwaysTrue({}),
        //     new DoInInterval({
        //         milliseconds: 5000,
        //         action: new MoveCamera({
        //             camera: PVRGlobals.camera,
        //             milliseconds: 1000,
        //             startPoint: PVRGlobals.camera.position,
        //             endPoint: new BABYLON.Vector3(PVRGlobals.camera.position.x + 25, PVRGlobals.camera.position.y, PVRGlobals.camera.position.z)
        //         })
        //     })
        // );

        // new Event(
        //     new ClickedObject({
        //         triggerMesh: PVRGlobals.meshesByName["grnd"],
        //         action: new MoveCamera({
        //             camera: PVRGlobals.camera,
        //             milliseconds: 1000,
        //             startPoint: PVRGlobals.camera.position,
        //             endPoint: new BABYLON.Vector3(PVRGlobals.camera.position.x + 25, PVRGlobals.camera.position.y, PVRGlobals.camera.position.z)
        //         })
        //     }, Core),           
        // );

        // new Event(
        //     new ClickedObject({
        //      triggerMesh: PVRGlobals.meshesByName["grnd"],
        //         action: new LabelOnMesh({
        //             label: "Hi :)",
        //         })
        //     }, Core),
        // );
    }

    return setEvents;
}