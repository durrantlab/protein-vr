var World;
(function (World) {
    var Ground;
    (function (Ground) {
        function checkInitialMesh(m, json) {
            if (json.g === "1") {
                // It's the ground
                m.checkCollisions = false; // not needed
                m.isPickable = true;
                World.Ground.groundMesh = m;
            }
            else {
                m.isPickable = false; // only ground is pickable
            }
        }
        Ground.checkInitialMesh = checkInitialMesh;
        function ensureCharAboveGround() {
            // Get the point on the ground immediately below the camera.
            var aboveVec = new BABYLON.Vector3(0, 3, 0);
            var groundPt = World.scene.pickWithRay(new BABYLON.Ray(World.CameraChar.camera.position.add(aboveVec), new BABYLON.Vector3(0, -0.1, 0))).pickedPoint;
            // If there is no such point, check above. Maybe you've accidentally fallen through the floor.
            if (groundPt === null) {
                var groundPt_1 = World.scene.pickWithRay(new BABYLON.Ray(World.CameraChar.camera.position.subtract(aboveVec), new BABYLON.Vector3(0, 0.1, 0))).pickedPoint;
            }
            if (groundPt !== null) {
                var groundAltitude = groundPt.y;
                var feetAltitude = World.CameraChar.feetAltitude();
                if (groundAltitude > feetAltitude) {
                    var delta = feetAltitude - groundAltitude;
                    World.CameraChar.camera.position.y = World.CameraChar.camera.position.y - delta;
                }
            }
            else {
            }
            // feetAltitude
        }
        Ground.ensureCharAboveGround = ensureCharAboveGround;
    })(Ground = World.Ground || (World.Ground = {}));
})(World || (World = {}));
var World;
(function (World) {
    var CameraChar;
    (function (CameraChar) {
        CameraChar.characterHeight = 6; // 6 feet.
        function setup() {
            var scene = World.scene;
            // The active camera from the babylon file is used (keep it simple)
            scene.activeCamera.attachControl(World.canvas);
            World.CameraChar.camera = scene.activeCamera;
            var camera = World.CameraChar.camera;
            // Define an elipsoid about the camera
            camera.ellipsoid = new BABYLON.Vector3(1, World.CameraChar.characterHeight / 2, 1); // assume height of 6 feet
            // Enable gravity for the camera
            // newScene.gravity = new BABYLON.Vector3(0, -9.8, 0); // should be defined in babylon file
            camera.applyGravity = true;
            // Now enable collisions between camera and relevant objects
            scene.collisionsEnabled = true;
            camera.checkCollisions = true;
            // Additional control keys
            camera.keysUp.push(87); // W
            camera.keysLeft.push(65); // A
            camera.keysDown.push(83); // S
            camera.keysRight.push(68); // D
            // Additional controls on camera motion.
            camera.speed = 0.5;
            camera.inertia = 0.9;
        }
        CameraChar.setup = setup;
        function feetAltitude() {
            return World.CameraChar.camera.position.y - World.CameraChar.characterHeight;
        }
        CameraChar.feetAltitude = feetAltitude;
    })(CameraChar = World.CameraChar || (World.CameraChar = {}));
})(World || (World = {}));
var World;
(function (World) {
    var CollisionMeshes;
    (function (CollisionMeshes) {
        function checkInitialMesh(m, json) {
            if (json.c === "1") {
                // collisions enabled
                m.checkCollisions = true;
            }
            else {
                m.checkCollisions = false;
            }
        }
        CollisionMeshes.checkInitialMesh = checkInitialMesh;
    })(CollisionMeshes = World.CollisionMeshes || (World.CollisionMeshes = {}));
})(World || (World = {}));
var World;
(function (World) {
    var Environment;
    (function (Environment) {
        function setup() {
            // the canvas/window resize event handler
            window.addEventListener('resize', function () {
                World.engine.resize();
            });
            PointerLock.pointerLock();
            optimize();
            var postProcess = new BABYLON.BlurPostProcess("Horizontal blur", new BABYLON.Vector2(1.0, 0), 1.0, 0.25, null, null, World.engine, true);
            // lensEffect();
            // timers();
        }
        Environment.setup = setup;
        function setFog(density) {
            if (density === void 0) { density = 0.015; }
            World.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            World.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            World.scene.fogDensity = density;
        }
        Environment.setFog = setFog;
        function optimize() {
            if (World.scene._activeMeshes.length > 100) {
                World.scene.createOrUpdateSelectionOctree();
            }
            //BABYLON.SceneOptimizer.OptimizeAsync(World.scene);  // This merges LOD levels into one!
            World.scene.workerCollisions = true;
        }
        function lensEffect() {
            // See http://doc.babylonjs.com/tutorials/Using_depth-of-field_and_other_lens_effects
            var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
                edge_blur: 1.0,
                chromatic_aberration: 1.0,
                distortion: 1.0,
                dof_focus_distance: 50,
                dof_aperture: 2.0,
                grain_amount: 1.0,
                dof_pentagon: true,
                dof_gain: 1.0,
                dof_threshold: 1.0,
                dof_darken: 0.25
            }, World.scene, 1.0, World.CameraChar.camera);
        }
        /* function timers() {
            // Very annoying, but LOD meshes don't have renderGroupId set
            // correctly, and I'm having a hard time setting it elsewhere.
            setInterval(function() {
                // Anything with "Decimated" in it needs to be renderingGroupID 1
                World.scene.meshes.forEach(function(m) {
                    if (m.name.indexOf("Decimated") !== -1) {
                        m.renderingGroupId = 1;
                    }
                });
            }, 5000);
        }*/
        var PointerLock;
        (function (PointerLock) {
            PointerLock.alreadyLocked = false;
            function pointerLock() {
                // adapted from http://www.pixelcodr.com/tutos/shooter/shooter.html
                // Request pointer lock
                var canvas = World.scene.getEngine().getRenderingCanvas();
                // On click event, request pointer lock
                canvas.addEventListener("click", function (evt) { World.Environment.PointerLock.actuallyRequestLock(canvas); }, false);
                // Event listener when the pointerlock is updated (or removed by pressing ESC for example).
                var pointerlockchange = function (event) {
                    World.Environment.PointerLock.alreadyLocked = (document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);
                    // If the user is alreday locked
                    if (!World.Environment.PointerLock.alreadyLocked) {
                        World.CameraChar.camera.detachControl(canvas);
                    }
                    else {
                        World.CameraChar.camera.attachControl(canvas);
                    }
                };
                // Attach events to the document
                document.addEventListener("pointerlockchange", pointerlockchange, false);
                document.addEventListener("mspointerlockchange", pointerlockchange, false);
                document.addEventListener("mozpointerlockchange", pointerlockchange, false);
                document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
                // tell user to click somehow
                console.log('Tell user to click...');
            }
            PointerLock.pointerLock = pointerLock;
            function actuallyRequestLock(canvas) {
                canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
            PointerLock.actuallyRequestLock = actuallyRequestLock;
        })(PointerLock = Environment.PointerLock || (Environment.PointerLock = {}));
    })(Environment = World.Environment || (World.Environment = {}));
})(World || (World = {}));
var World;
(function (World) {
    var Skybox;
    (function (Skybox) {
        function checkInitialMesh(m, json) {
            if (json.s === "1") {
                // It's the skybox
                m.checkCollisions = false; // not needed
                m.infiniteDistance = true; // always far away
                m.renderingGroupId = 0; // so other objects are always rendered in front.
                m.material.backFaceCulling = false; // just inward facing
                m.material.disableLighting = true; // doesn't interact with lights
                // Remove reflections, because it's an image texture and sun doens't reflect off sky.
                m.material.specularColor = new BABYLON.Color3(0, 0, 0);
                m.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                // m.isPickable = true;  // If you want to know the location of an image on the skybox.
                World.Skybox.skyboxMesh = m;
            }
            else {
                World.Utils.setRenderingGroupId(m, 1);
            }
        }
        Skybox.checkInitialMesh = checkInitialMesh;
        function applyBoxImgs(dir) {
            // sometimes it's much easier to just get the skybox from image
            // files directly, rather than blender.
            // dir contains the skybox files.
            // See https://doc.babylonjs.com/tutorials/Environment#skybox for filename convention.
            // Remove existing material
            // let mat = World.Skybox.skyboxMesh.material; 
            // mat.dispose();
            // World.scene.resetCachedMaterial();
            // World.Skybox.skyboxMesh.material = null;
            // Create a new material.
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", World.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.disableLighting = true;
            skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(dir, World.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
            World.Skybox.skyboxMesh.material = skyboxMaterial;
        }
        Skybox.applyBoxImgs = applyBoxImgs;
    })(Skybox = World.Skybox || (World.Skybox = {}));
})(World || (World = {}));
var World;
(function (World) {
    var BillboardMeshes;
    (function (BillboardMeshes) {
        function checkInitialMesh(m, json) {
            if (json.b === "1") {
                // Billboard enabled
                m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
            }
            else {
            }
        }
        BillboardMeshes.checkInitialMesh = checkInitialMesh;
    })(BillboardMeshes = World.BillboardMeshes || (World.BillboardMeshes = {}));
})(World || (World = {}));
var World;
(function (World) {
    var AutoLODMeshes;
    (function (AutoLODMeshes) {
        function checkInitialMesh(m, json) {
            if (json.l === "1") {
                // Auto LOD enabled
                console.log(m.name);
                var settings = [
                    { quality: 0.8, distance: 25, optimizeMesh: true },
                    { quality: 0.3, distance: 50, optimizeMesh: true }
                ];
                m.simplify(settings, true, BABYLON.SimplificationType.QUADRATIC, function () {
                    m.addLODLevel(65, null);
                    World.Utils.setRenderingGroupId(m, m.renderingGroupId);
                });
            }
        }
        AutoLODMeshes.checkInitialMesh = checkInitialMesh;
    })(AutoLODMeshes = World.AutoLODMeshes || (World.AutoLODMeshes = {}));
})(World || (World = {}));
var World;
(function (World) {
    var Utils;
    (function (Utils) {
        function setRenderingGroupId(mesh, val) {
            // Set the rendering group on this mesh
            mesh.renderingGroupId = val;
            // And all it's associted LOD meshes
            if (mesh.hasOwnProperty("_LODLevels")) {
                mesh._LODLevels.forEach(function (m) {
                    if (m.mesh !== null) {
                        m.mesh.renderingGroupId = val;
                    }
                });
            }
            // And related meshes
            /*let decimated = World.scene.getMeshByName(mesh.name + "Decimated_merged");
            if (decimated !== null) {
                decimated.renderingGroupId = val;
            }

            decimated = World.scene.getMeshByName(mesh.name + "Decimated");
            if (decimated !== null) {
                decimated.renderingGroupId = val;
            }*/
            // Anything with "Decimated" in it needs to be renderingGroupID 1
            World.scene.meshes.forEach(function (m) {
                if (m.name.indexOf("Decimated") !== -1) {
                    m.renderingGroupId = 1;
                }
            });
        }
        Utils.setRenderingGroupId = setRenderingGroupId;
    })(Utils = World.Utils || (World.Utils = {}));
})(World || (World = {}));
/// <reference path="Ground.ts" />
/// <reference path="CameraChar.ts" />
/// <reference path="CollisionMeshes.ts" />
/// <reference path="Environment.ts" />
/// <reference path="Skybox.ts" />
/// <reference path="Billboard.ts" />
/// <reference path="AutoLOD.ts" />
/// <reference path="Utils.ts" />
var World;
(function (World) {
    World.tmpSpheres = [];
    World.debug = false;
    function setup() {
        World.debug = true;
        $(document).ready(function () {
            World.canvas = document.getElementById('renderCanvas'); // get the canvas DOM element
            World.engine = new BABYLON.Engine(World.canvas, true); // load the 3D engine. true means antialiasing is on.
            //World.Babylon.scene = new BABYLON.Scene(World.Babylon.engine); // create a basic BJS Scene object
            // load scene from babylon file
            BABYLON.SceneLoader.Load("scene/", "test.babylon", World.engine, function (newScene) {
                // Wait for textures and shaders to be ready
                newScene.executeWhenReady(function () {
                    World.scene = newScene;
                    // Loop through each of the objects and modify according to the name.
                    World.scene.meshes.forEach(function (m) {
                        //try {
                        var jsonStr = '{"' + m.name + '"}';
                        jsonStr = jsonStr.replace(/:/g, '":"').replace(/,/g, '","');
                        var json = JSON.parse(jsonStr);
                        m.name = json.n;
                        World.CollisionMeshes.checkInitialMesh(m, json);
                        World.Ground.checkInitialMesh(m, json);
                        World.Skybox.checkInitialMesh(m, json);
                        World.AutoLODMeshes.checkInitialMesh(m, json);
                        World.BillboardMeshes.checkInitialMesh(m, json);
                        //} catch (err) {
                        //
                        //}
                    });
                    World.CameraChar.setup();
                    World.Environment.setup();
                    //World.Environment.setFog();
                    World.Skybox.applyBoxImgs("3d_resources/sky_boxes/ame_desert/desertsky");
                    window.addEventListener("click", function () {
                        // We try to pick an object
                        var pickResult = World.scene.pick(World.scene.pointerX, World.scene.pointerY);
                        console.log(pickResult.pickedMesh, pickResult.pickedMesh.name, pickResult.pickedMesh.renderingGroupId);
                    });
                    /*
                    // ground
                    // need to add shadow texture to it.
                    var ground = scene.getMeshByName("Ground");
                    ground.material.dispose();

                    var material = new BABYLON.StandardMaterial("groundMat", newScene);
                    material.diffuseTexture = new BABYLON.Texture("scene/shadow.png ", newScene);
                    material.emissiveColor = new BABYLON.Color3(1,0,0);
                    ground.material = material;
                    */
                    // Once the scene is loaded, just register a render loop to render it
                    World.engine.runRenderLoop(function () {
                        World.Ground.ensureCharAboveGround();
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
    World.setup = setup;
})(World || (World = {}));
/// <reference path="BabylonSetup.ts" />
var World;
(function (World) {
    function start() {
        // set up a babylon scene
        World.setup();
    }
    World.start = start;
})(World || (World = {}));
World.start();
