import CollisionMeshes from "../Objects/CollisionMeshes";
import Ground from "../Objects/Ground";
import Skybox from "../Objects/Skybox";
import AutoLODMeshes from "../Objects/AutoLOD";
import BillboardMeshes from "../Objects/Billboard";
import CustomShaderObjects from "../Objects/CustomShaderObject";
import CameraChar from "../CameraChar";
import Environment from "../Environment";
import Core from "./Core";
import RenderLoop from "./RenderLoop";


// jQuery is an external library, so declare it here to avoid Typescript
// errors.
declare var jQuery;
declare var $;
declare var BABYLON;

namespace Setup {
    /**
    A namespace to store the functions to start the engine.
    */

    export function setup(setCustomShaders?: any, setEvents?: any): void {
        /**
        Setup the BABYLON game engine.

        :param any setCustomShaders: An externally defined function that sets
                   up any custom shaders.
        :param any setEvents: An externally defined function that sets
                   up any events.
        */

        // Whether or not to run in debug mode (shows certain messages in the
        // console, etc.)
        Core.debug = false;

        // Only run the below once the whole document has loaded.
        $(document).ready(function() {
            // Get the canvas DOM element.
            Core.canvas = document.getElementById('renderCanvas');

            // Load the 3D engine. true means antialiasing is on.
            Core.engine = new BABYLON.Engine(Core.canvas, true);

            // Load a scene from a BABYLON file.
            BABYLON.SceneLoader.Load("scene/rbc/", "scene.babylon", 
                                     Core.engine,
                                     function (newScene: any): void {

                // Wait for textures and shaders to be ready before
                // proceeding.
                newScene.executeWhenReady(function () {

                    // Store the scene in a variable so you can reference it
                    // later.
                    Core.scene = newScene;

                    // Set custom shaders
                    setCustomShaders();

                    // Loop through each of the objects in the scene and
                    // modify them according to the name (which is a json).

                    Core.scene.meshes.forEach(function(m) {
                        //try {
                            // Convert the mesh name to a json object with
                            // information about the mesh.
                            let jsonStr = '{"' + m.name + '"}';
                            jsonStr = jsonStr.replace(/:/g, '":"')
                                             .replace(/,/g, '","');
                            let json = JSON.parse(jsonStr);
                            m.name = json.n;

                            // save for later reference
                            Core.meshesByName[m.name] = m;

                            // Given the mesh, check if it should collide with
                            // the camera.
                            new CollisionMeshes().checkMesh(m, json);

                            // Check if the mesh is marked as a ground mesh.
                            new Ground().checkMesh(m, json);

                            // Check if the mesh is marked as a skybox.
                            new Skybox().checkMesh(m, json);

                            // Check if the object is marked to be
                            // level-of-detail (fewer vertices when farther
                            // away).
                            new AutoLODMeshes().checkMesh(m, json);

                            // Check if the mesh is marked as a billboard
                            // mesh.
                            new BillboardMeshes().checkMesh(m, json);

                            // Check if the mesh requires a custom shader.
                            new CustomShaderObjects().checkMesh(m, json);

                        //} catch (err) {
                            //
                        //}
                    });

                    // Set up the game character/camera.
                    CameraChar.setup();

                    // Set up the environment.
                    Environment.setup();

                    // Set up the skybox.
                    Skybox.applyBoxImgs(
                        //"3d_resources/sky_boxes/sky27/sp9"
                        "3d_resources/sky_boxes/my_bloodstream/blood"
                    );

                    // Set up events.
                    setEvents();

                    // Listen for a click. If the user clicks on an object,
                    // print information about the clicked object in the
                    // console.
                    /* window.addEventListener("click", function () {
                       // We try to pick an object.
                       var pickResult = Core.scene.pick(
                           Core.scene.pointerX, Core.scene.pointerY
                        );

                       console.log(pickResult.pickedMesh,
                                   pickResult.pickedMesh.name,
                                   pickResult.pickedMesh.renderingGroupId);
                    });*/

                    // Add triggers.
                    /*new Event(
                        BuiltInTriggerConditionals.distance(Core.meshesByName["prot_coll"], 3.5),
                        BuiltInActions.fadeOutMesh(Core.meshesByName["surf"], 2000)
                    );*/


                    /*Triggers.addTrigger({
                        name: "FadeOutWhenWithinSixMeters",
                        conditionToSatisfy: Triggers.PackagedConditionals.distance(Core.meshesByName["prot_coll"], 5),
                        actionIfConditionSatisfied: function() {
                            let mesh = Core.meshesByName["surf"];
                            Triggers.PackagedAction.fadeOutMesh(mesh);
                        },
                        intervalInMiliseconds: 2000,
                        autoRestart: false,
                        tickFrameFrequency: 20
                    });

                    Triggers.addTrigger({
                        name: "FadeInWhenWithinThreeMeters",
                        conditionToSatisfy: Triggers.PackagedConditionals.distance(Core.meshesByName["prot_coll"], 3),
                        actionIfConditionSatisfied: function() {
                            let mesh = Core.meshesByName["surf"];
                            Triggers.PackagedAction.fadeInMesh(mesh);
                        },
                        intervalInMiliseconds: 2000,
                        autoRestart: false,
                        tickFrameFrequency: 20
                    });*/

                    RenderLoop.start();
                });
            });
        });
    }
}

export default Setup;
