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

    /* export var Ground = Ground;
    export var CameraChar = CameraChar;
    export var CollisionMeshes = CollisionMeshes;
    export var Environment = Environment;
    export var Skybox = Skybox;
    export var BillboardMeshes = Billboard;
    export var AutoLODMeshes = AutoLOD;
    export var Utils = Utils;
    export var Triggers = Triggers;
    export var Timers = Timers;
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

            // optional debugging
            //ProteinVR.Babylon.scene.debugLayer.show();

            // the camera
            //ProteinVR.Babylon.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 25, -10), ProteinVR.Babylon.scene); // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
            //ProteinVR.Babylon.camera.setTarget(new BABYLON.Vector3(0, 5, 50)); // target the camera to scene origin
            //ProteinVR.Babylon.camera.attachControl(canvas, false); // attach the camera to the canvas
            //ProteinVR.Babylon.camera.keysUp.push(87); // W
            //ProteinVR.Babylon.camera.keysLeft.push(65); // A
            //ProteinVR.Babylon.camera.keysDown.push(83); // S
            //ProteinVR.Babylon.camera.keysRight.push(68); // D
            //ProteinVR.Babylon.camera.speed = 0.5;
            //ProteinVR.Babylon.camera.inertia = 0.9;

            // setup gravity and camera collisions
            //ProteinVR.Babylon.camera.applyGravity = true;
            //ProteinVR.Babylon.camera.ellipsoid = new BABYLON.Vector3(1, ProteinVR.Parameters.cameraHeight, 1); //Set the ellipsoid around the camera (e.g. your player's size)
            //ProteinVR.Babylon.camera.checkCollisions = true;

            // any lights
            /*var light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), ProteinVR.Babylon.scene);
            light1.diffuse = new BABYLON.Color3(1, 1, 1);
            light1.specular = new BABYLON.Color3(1, 1, 1);
            light1.groundColor = new BABYLON.Color3(0, 0, 0);
            light1.intensity = 0.1;

            //ProteinVR.Babylon.scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            var light_noshadow = new BABYLON.DirectionalLight("spot", new BABYLON.Vector3(10, -2, 1), ProteinVR.Babylon.scene);
            light_noshadow.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
            light_noshadow.position = new BABYLON.Vector3(0, 20, 0);
            light_noshadow.intensity = 1.0;

            var light2 = new BABYLON.DirectionalLight("spot", new BABYLON.Vector3(-1, -2, -2), ProteinVR.Babylon.scene);
            light2.position = new BABYLON.Vector3(0, 20, 0);

            light2.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
            //light2.specular = new BABYLON.Color3(1.0, 1.0, 1.0);
            light2.intensity = 1.0;

            ProteinVR.Babylon.shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
            //ProteinVR.Babylon.shadowGenerator.bias = 0.01;

            //ProteinVR.Babylon.shadowGenerator.useVarianceShadowMap = true; // set to false to improve computation time
            ProteinVR.Babylon.shadowGenerator.usePoissonSampling = true; // false is faster


            // fog
            ProteinVR.Babylon.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            ProteinVR.Babylon.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            ProteinVR.Babylon.scene.fogDensity = 0.015;

            // here make the ground
            //ProteinVR.ticks.push(ProteinVR.Ground.refresh);

            //var sphere = new ProteinVR.Mesh( BABYLON.Mesh.CreateSphere( "sphere" , 10.0, 1.0, ProteinVR.Babylon.scene) );
            //sphere.mesh.position = new BABYLON.Vector3(0,0,0);

            // make a cube to test
            //var b = BABYLON.Mesh.CreateBox( "box" , 15.0, ProteinVR.Babylon.scene);
            //b.position = new BABYLON.Vector3(0,0,0);
            //var sphere = new ProteinVR.Mesh( BABYLON.Mesh.CreateSphere( "sphere" , 10.0, 1.0, ProteinVR.Babylon.scene) );
   */

            /*var step = 5;
            for (var x=-35; x<36; x=x+step) {
                for (var y=-35; y<36; y=y+step) {
                var part = new ProteinVR.Patch.Patch(new BABYLON.Vector2(x,y), new BABYLON.Vector2(x+step, y+step));
                part.ground.addToSene();
                }
            }*/
            //ProteinVR.Region.generatePatches(new BABYLON.Vector2(-35, -35), new BABYLON.Vector2(35, 35));

            // optimize the scene
            //BABYLON.SceneOptimizer.OptimizeAsync(ProteinVR.Babylon.scene);

            //if (ProteinVR.Babylon.scene._activeMeshes.length > 100) { ProteinVR.Babylon.scene.createOrUpdateSelectionOctree(); }

            // setup the scene
            //Core.sceneSetup();

            //ProteinVR.Babylon.pointerLock();

            // run the render loop
            /*ProteinVR.Babylon.engine.runRenderLoop(function() {
                ProteinVR.Babylon.scene.render();
            }.bind(this));*/


        });
    }
}

export default Setup;
