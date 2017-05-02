// THIS IS WHERE ANY CUSTOM CODE GOES. DEFINING SHADERS AND TRIGGERS AND SUCH.
define(["require", "exports", "./proteinvr/Events/Event", "./proteinvr/Events/Actions/AdministerQuiz", "./proteinvr/Events/TriggerConditionals/KeyPress", "./proteinvr/Events/TriggerConditionals/ClickedObject", "./proteinvr/Events/Actions/LabelOnMesh"], function (require, exports, Event_1, AdministerQuiz_1, KeyPress_1, ClickedObject_1, LabelOnMesh_1) {
    "use strict";
    // this function was added in so the app could be run from the config.ts file with requirejs
    // jQuery is passed as an arg so this function and any module it utilizes can use jquery from the config.ts path object
    function start() {
        var setEvents = function () {
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
            new Event_1.default(new KeyPress_1.default({
                event: 'keypress',
                action: new AdministerQuiz_1.default({
                    quiz: {
                        "name": "Sample Quiz",
                        "questions": {
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
            }));
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
            new Event_1.default(new ClickedObject_1.default({
                triggerMesh: Core.meshesByName["grnd"],
                action: new LabelOnMesh_1.default({
                    label: "Hi :)",
                })
            }, Core));
        };
        return setEvents;
    }
    exports.start = start;
});
