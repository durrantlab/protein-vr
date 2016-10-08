/// <reference path="Ground.ts" />
/// <reference path="CameraChar.ts" />
/// <reference path="CollisionMeshes.ts" />
/// <reference path="Environment.ts" />
/// <reference path="Skybox.ts" />
/// <reference path="Billboard.ts" />
/// <reference path="AutoLOD.ts" />
/// <reference path="Utils.ts" />
/// <reference path="Triggers.ts" />

// jQuery is an external library, so declare it here to avoid Typescript
// errors.
declare var jQuery;
declare var $;

/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
namespace World {
    // Save key variables related to the BABYLON game engine.
    export var engine: any;
    export var scene: any;
    export var canvas: any;
    export var tmpSpheres = [];
    export var shadowGenerator;
    export var debug: boolean = false;
    export var meshesByName: any[] = [];
    export var anyVar: any = undefined;  // Just a place to storev  any variable
    export var frameNum: number = 0;

    export function debugMsg(msg: string) {
        if (World.debug === true) {
            console.log(msg);
        }
    }

    /**
     * Set up the BABYLON game engine.
     */
    export function setup(): void {
        // Whether or not to run in debug mode (shows certain messages in the
        // console, etc.)
        World.debug = false;

        // Only run the below once the whole document has loaded.
        $(document).ready(function() {
            // Get the canvas DOM element.
            World.canvas = document.getElementById('renderCanvas');

            // Load the 3D engine. true means antialiasing is on.
            World.engine = new BABYLON.Engine(World.canvas, true);

            // Load a scene from a BABYLON file.
            BABYLON.SceneLoader.Load("scene/", "test.babylon", engine,
                                     function (newScene: any): void {

                // Wait for textures and shaders to be ready before
                // proceeding.
                newScene.executeWhenReady(function () {

                    // Store the scene in a variable so you can reference it
                    // later.
                    World.scene = newScene;

                    // Loop through each of the objects in the scene and
                    // modify them according to the name (which is a json).
                    scene.meshes.forEach(function(m) {
                        //try {
                            // Convert the mesh name to a json object with
                            // information about the mesh.
                            let jsonStr = '{"' + m.name + '"}';
                            jsonStr = jsonStr.replace(/:/g, '":"')
                                             .replace(/,/g, '","');
                            let json = JSON.parse(jsonStr);
                            m.name = json.n;

                            // save for later reference
                            World.meshesByName[m.name] = m;

                            // Given the mesh, check if it shoudl collide with
                            // the camera.
                            World.CollisionMeshes.checkInitialMesh(m, json);

                            // Check if the mesh is marked as a ground mesh.
                            World.Ground.checkInitialMesh(m, json);

                            // Check if the mesh is marked as a skybox.
                            World.Skybox.checkInitialMesh(m, json);

                            // Check if the object is marked to be
                            // level-of-detail (fewer vertices when farther
                            // away).
                            World.AutoLODMeshes.checkInitialMesh(m, json);

                            // Check if the mesh is marked as a billboard
                            // mesh.
                            World.BillboardMeshes.checkInitialMesh(m, json);

                        //} catch (err) {
                            //
                        //}
                    });

                    // Set up the game character/camera.
                    World.CameraChar.setup();

                    // Set up the environment.
                    World.Environment.setup();

                    // Set up the skybox.
                    World.Skybox.applyBoxImgs(
                        "3d_resources/sky_boxes/sky27/sp9"
                    );

                    // Listen for a click. If the user clicks on an object,
                    // print information about the clicked object in the
                    // console.
                    window.addEventListener("click", function () {
                       // We try to pick an object.
                       var pickResult = World.scene.pick(
                           World.scene.pointerX, World.scene.pointerY
                        );

                       console.log(pickResult.pickedMesh,
                                   pickResult.pickedMesh.name,
                                   pickResult.pickedMesh.renderingGroupId);
                    });

                    // Add triggers.
                    World.Triggers.addTrigger({
                        name: "FadeOutWhenWithinSixMeters",
                        conditionToSatisfy: World.Triggers.PackagedConditionals.distance(World.meshesByName["prot_coll"], 5),
                        actionIfConditionSatisfied: function() {
                            let mesh = World.meshesByName["surf"];
                            World.Triggers.PackagedAction.fadeOutMesh(mesh);
                        },
                        intervalInMiliseconds: 2000,
                        autoRestart: false,
                        tickFrameFrequency: 20
                    });

                    World.Triggers.addTrigger({
                        name: "FadeInWhenWithinThreeMeters",
                        conditionToSatisfy: World.Triggers.PackagedConditionals.distance(World.meshesByName["prot_coll"], 3),
                        actionIfConditionSatisfied: function() {
                            let mesh = World.meshesByName["surf"];
                            World.Triggers.PackagedAction.fadeInMesh(mesh);
                        },
                        intervalInMiliseconds: 2000,
                        autoRestart: false,
                        tickFrameFrequency: 20
                    });

                    // Once the scene is loaded, register a render loop and
                    // start rendering the frames.
                    engine.runRenderLoop(function() {
                        World.frameNum++;

                        // Some things don't need to be checked every frame.
                        // Let's minimize stuff to improve speed.
                        
                        if (World.frameNum % 10 === 0) {
                            // Assuming a fps of 30, this is about every third of a second.

                            // Save location of camera
                            World.CameraChar.previousPos = World.CameraChar.camera.position.clone();

                            // Check for collisions
                            World.CameraChar.repositionPlayerIfCollision();
                        }

                        // These do run every frame

                        // Run all timers every 10 frames (faster than every frame, probably.)
                        World.Timers.tick();

                        // Make sure the character is above the ground.
                        World.Ground.ensureCharAboveGround();

                        // Set variables based on current frame rate
                        let animationRatio = World.scene.getAnimationRatio();
                        World.CameraChar.camera.speed = 1.5 * animationRatio; 

                        // Render the scene.
                        newScene.render();
                    });
                });
            });

            // optional debugging
            //World.Babylon.scene.debugLayer.show();

            // the camera
            //World.Babylon.camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 25, -10), World.Babylon.scene); // create a FreeCamera, and set its position to (x:0, y:5, z:-10)
            //World.Babylon.camera.setTarget(new BABYLON.Vector3(0, 5, 50)); // target the camera to scene origin
            //World.Babylon.camera.attachControl(canvas, false); // attach the camera to the canvas
            //World.Babylon.camera.keysUp.push(87); // W
            //World.Babylon.camera.keysLeft.push(65); // A
            //World.Babylon.camera.keysDown.push(83); // S
            //World.Babylon.camera.keysRight.push(68); // D
            //World.Babylon.camera.speed = 0.5;
            //World.Babylon.camera.inertia = 0.9;

            // setup gravity and camera collisions
            //World.Babylon.camera.applyGravity = true;
            //World.Babylon.camera.ellipsoid = new BABYLON.Vector3(1, World.Parameters.cameraHeight, 1); //Set the ellipsoid around the camera (e.g. your player's size)
            //World.Babylon.camera.checkCollisions = true;

            // any lights
            /*var light1 = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), World.Babylon.scene);
            light1.diffuse = new BABYLON.Color3(1, 1, 1);
            light1.specular = new BABYLON.Color3(1, 1, 1);
            light1.groundColor = new BABYLON.Color3(0, 0, 0);
            light1.intensity = 0.1;

            //World.Babylon.scene.ambientColor = new BABYLON.Color3(0.1, 0.1, 0.1);
            var light_noshadow = new BABYLON.DirectionalLight("spot", new BABYLON.Vector3(10, -2, 1), World.Babylon.scene);
            light_noshadow.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
            light_noshadow.position = new BABYLON.Vector3(0, 20, 0);
            light_noshadow.intensity = 1.0;

            var light2 = new BABYLON.DirectionalLight("spot", new BABYLON.Vector3(-1, -2, -2), World.Babylon.scene);
            light2.position = new BABYLON.Vector3(0, 20, 0);

            light2.diffuse = new BABYLON.Color3(1.0, 1.0, 1.0);
            //light2.specular = new BABYLON.Color3(1.0, 1.0, 1.0);
            light2.intensity = 1.0;

            World.Babylon.shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
            //World.Babylon.shadowGenerator.bias = 0.01;

            //World.Babylon.shadowGenerator.useVarianceShadowMap = true; // set to false to improve computation time
            World.Babylon.shadowGenerator.usePoissonSampling = true; // false is faster


            // fog
            World.Babylon.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            World.Babylon.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            World.Babylon.scene.fogDensity = 0.015;

            // here make the ground
            //World.ticks.push(World.Ground.refresh);

            //var sphere = new World.Mesh( BABYLON.Mesh.CreateSphere( "sphere" , 10.0, 1.0, World.Babylon.scene) );
            //sphere.mesh.position = new BABYLON.Vector3(0,0,0);

            // make a cube to test
            //var b = BABYLON.Mesh.CreateBox( "box" , 15.0, World.Babylon.scene);
            //b.position = new BABYLON.Vector3(0,0,0);
            //var sphere = new World.Mesh( BABYLON.Mesh.CreateSphere( "sphere" , 10.0, 1.0, World.Babylon.scene) );
    */

            /*var step = 5;
            for (var x=-35; x<36; x=x+step) {
                for (var y=-35; y<36; y=y+step) {
                var part = new World.Patch.Patch(new BABYLON.Vector2(x,y), new BABYLON.Vector2(x+step, y+step));
                part.ground.addToSene();
                }
            }*/
            //World.Region.generatePatches(new BABYLON.Vector2(-35, -35), new BABYLON.Vector2(35, 35));

            // optimize the scene
            //BABYLON.SceneOptimizer.OptimizeAsync(World.Babylon.scene);

            //if (World.Babylon.scene._activeMeshes.length > 100) { World.Babylon.scene.createOrUpdateSelectionOctree(); }

            // setup the scene
            //World.sceneSetup();

            //World.Babylon.pointerLock();

            // run the render loop
            /*World.Babylon.engine.runRenderLoop(function() {
                World.Babylon.scene.render();
            }.bind(this));*/


        });
    }
}
