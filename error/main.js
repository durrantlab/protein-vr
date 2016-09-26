/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The Ground namespace is where all the functions and variables related
     * to the ground are stored.
     */
    var Ground;
    (function (Ground) {
        /**
         * This function checks a mesh to see if it's marked as the ground
         * mesh. You can mark a mesh as a ground mesh using the VR Blender
         * plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as the ground.
         */
        function checkInitialMesh(m, json) {
            if (json.g === "1") {
                // It's the ground
                m.checkCollisions = false; // No need to check for collisions
                // with the ground because you
                // test for collisions manually by
                // casting a ray.
                m.isPickable = true; // Make the ground pickable. That's how
                // the manual collision checking works.
                World.Ground.groundMesh = m; // Set the ground mesh to be
            }
            else {
                m.isPickable = false; // Everything that isn't the ground
            }
        }
        Ground.checkInitialMesh = checkInitialMesh;
        /**
         * Make sure the character (really the camera) is always above the
         * ground.
         */
        function ensureCharAboveGround() {
            // Get a point in 3D space that is three feet above the camera.
            var pointAboveCamera = World.CameraChar.camera.position.add(new BABYLON.Vector3(0, 3, 0));
            // Cast a ray straight down from that point, and get the point
            // where that ray intersects with the ground.
            var groundPt = World.scene.pickWithRay(new BABYLON.Ray(pointAboveCamera, new BABYLON.Vector3(0, -0.1, 0))).pickedPoint;
            // Get a point in 3D space that is three feet above the camera.
            var pointBelowCamera = World.CameraChar.camera.position.subtract(new BABYLON.Vector3(0, 3, 0));
            // If there is no such point, check above the camera. Maybe the
            // camera has accidentally fallen through the ground.
            if (groundPt === null) {
                // Cast a ray straight up from that point, and get the point
                // where that ray intersects with the ground.
                var groundPt_1 = World.scene.pickWithRay(new BABYLON.Ray(pointBelowCamera, new BABYLON.Vector3(0, 0.1, 0))).pickedPoint;
            }
            // If the ground point exists, you can check if the character is
            // above or below that point.
            if (groundPt !== null) {
                // Get the y value (up-down axis) of the ground.
                var groundAltitude = groundPt.y;
                // Get the y value (up-down axis) of the character's feet.
                var feetAltitude = World.CameraChar.feetAltitude();
                // If the ground is aboe the feet, you've got a problem.
                if (groundAltitude > feetAltitude) {
                    // Move the camera so it's on top of the ground.
                    var delta = feetAltitude - groundAltitude;
                    World.CameraChar.camera.position.y =
                        World.CameraChar.camera.position.y - delta;
                }
            }
            else {
            }
        }
        Ground.ensureCharAboveGround = ensureCharAboveGround;
    })(Ground = World.Ground || (World.Ground = {}));
})(World || (World = {}));
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The CameraChar namespace is where all the functions and variables
     * related to the camera/main character are stored.
     */
    var CameraChar;
    (function (CameraChar) {
        CameraChar.previousPos = undefined;
        /* The height of the character/camera in feet. */
        CameraChar.characterHeight = 1.8; // All units in metric.
        /**
         * Set up the camera/character.
         */
        function setup() {
            // Get the scene object.
            var scene = World.scene;
            // The active camera from the babylon file is used (keep it
            // simple)
            scene.activeCamera.attachControl(World.canvas);
            World.CameraChar.camera = scene.activeCamera;
            // Get the camera object for reference.
            var camera = World.CameraChar.camera;
            // Define an elipsoid raround the camera
            camera.ellipsoid = new BABYLON.Vector3(1, World.CameraChar.characterHeight / 2, 1);
            // Enable gravity on the camera. The actual strength of the
            // gravity is set in the babylon file.
            camera.applyGravity = true;
            // Now enable collisions between the camera and relevant objects.
            scene.collisionsEnabled = true;
            camera.checkCollisions = true;
            // Additional control keys.
            camera.keysUp.push(87); // W
            camera.keysLeft.push(65); // A
            camera.keysDown.push(83); // S
            camera.keysRight.push(68); // D
            // Set the speed and inertia of camera motions.
            camera.inertia = 0; //0.9;
            camera.angularSensibility = 200;
        }
        CameraChar.setup = setup;
        /**
         * Get the y value (along the up-down axis) of the character's feet.
         * @return {number} The y value of the feet.
         */
        function feetAltitude() {
            return (World.CameraChar.camera.position.y -
                World.CameraChar.characterHeight);
        }
        CameraChar.feetAltitude = feetAltitude;
        function repositionPlayerIfCollision() {
            var intersect = false;
            for (var i = 0; i < World.CollisionMeshes.meshesThatCollide.length; i++) {
                var mesh = World.CollisionMeshes.meshesThatCollide[i];
                if (mesh.intersectsPoint(World.CameraChar.camera.position)) {
                    intersect = true;
                    World.CameraChar.camera.position = World.CameraChar.previousPos;
                    break;
                }
            }
        }
        CameraChar.repositionPlayerIfCollision = repositionPlayerIfCollision;
    })(CameraChar = World.CameraChar || (World.CameraChar = {}));
})(World || (World = {}));
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The CollisionMeshes namespace is where functions and variables related
     * to CollisionMeshes are stored.
     */
    var CollisionMeshes;
    (function (CollisionMeshes) {
        CollisionMeshes.meshesThatCollide = [];
        /**
         * This function checks a mesh to see if it's one that can collide
         * with the camera. You can mark a mesh as collidable mesh using the
         * VR Blender plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as collidable.
         */
        function checkInitialMesh(m, json) {
            if ((json.c === "1") || (json.h === "1")) {
                // Enable collisions.
                m.checkCollisions = false; //true;
                console.log("Collisions on: ", json);
                World.CollisionMeshes.meshesThatCollide.push(m);
                // m.material.alpha = 0.0;
                m.visibility = 0.0;
            }
            else {
                // Disable collisions.
                m.checkCollisions = false;
                console.log("Collisions off: ", json);
            }
        }
        CollisionMeshes.checkInitialMesh = checkInitialMesh;
    })(CollisionMeshes = World.CollisionMeshes || (World.CollisionMeshes = {}));
})(World || (World = {}));
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The Environment namespace is where all the functions and variables
     * related to the environment are stored.
     */
    var Environment;
    (function (Environment) {
        /**
         * Set up the environment.
         */
        function setup() {
            // If the window is resized, then also resize the game engine.
            window.addEventListener('resize', function () {
                World.engine.resize();
            });
            // "Capture" the mouse from the browser.
            PointerLock.pointerLock();
            // Optimize the scene to keep it running fast.
            optimize();
            // Set up the fog.
            World.Environment.setFog();
            // lensEffect();
            // timers();
        }
        Environment.setup = setup;
        /**
         * Setup the fox.
         * @param {number = 0.015} density The fog density. Defaults to 0.015.
         */
        function setFog(density) {
            if (density === void 0) { density = 0.015; }
            World.scene.fogMode = BABYLON.Scene.FOGMODE_EXP2;
            World.scene.fogColor = new BABYLON.Color3(1.0, 1.0, 1.0);
            World.scene.fogDensity = density;
        }
        Environment.setFog = setFog;
        /**
         * Perform various optimizations to keep the engine running fast.
         */
        function optimize() {
            // Octrees make selections and things go faster.
            if (World.scene._activeMeshes.length > 100) {
                World.scene.createOrUpdateSelectionOctree();
            }
            // This optimization is great, except it merges different
            // LOD-level meshes into one visible mesh. I think this is a
            // BABYLON bug.
            // BABYLON.SceneOptimizer.OptimizeAsync(World.scene);
            World.scene.workerCollisions = true;
        }
        /**
         * Create a lens effect. Not currently implemented.
         */
        function lensEffect() {
            // See http://doc.babylonjs.com/tutorials/Using_depth-of-field_and
            // _other_lens_effects
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
        /**
         * The PointerLock namespace is where all the functions and variables
         * related to capturing the mouse are stored.
         */
        var PointerLock;
        (function (PointerLock) {
            /* Whether or not the mouse has been captured. */
            PointerLock.alreadyLocked = false;
            /**
             * Set up the pointerlock (to capture the mouse).
             */
            function pointerLock() {
                // Adapted from
                // http://www.pixelcodr.com/tutos/shooter/shooter.html
                // Get the rendering canvas.
                var canvas = World.scene.getEngine().getRenderingCanvas();
                // On click event, request pointer lock.
                canvas.addEventListener("click", function (evt) {
                    World.Environment.PointerLock.actuallyRequestLock(canvas);
                }, false);
                // Event listener when the pointerlock is updated (or removed
                // by pressing ESC for example).
                var pointerlockchange = function (event) {
                    World.Environment.PointerLock.alreadyLocked = (document.mozPointerLockElement === canvas
                        || document.webkitPointerLockElement === canvas
                        || document.msPointerLockElement === canvas
                        || document.pointerLockElement === canvas);
                    // If the user is alreday locked.
                    if (!World.Environment.PointerLock.alreadyLocked) {
                        World.CameraChar.camera.detachControl(canvas);
                    }
                    else {
                        World.CameraChar.camera.attachControl(canvas);
                    }
                };
                // Attach events to the document.
                document.addEventListener("pointerlockchange", pointerlockchange, false);
                document.addEventListener("mspointerlockchange", pointerlockchange, false);
                document.addEventListener("mozpointerlockchange", pointerlockchange, false);
                document.addEventListener("webkitpointerlockchange", pointerlockchange, false);
                // Tell user to click somehow.
                console.log('Tell user to click...');
            }
            PointerLock.pointerLock = pointerLock;
            /**
             * Request the mouse lock.
             * @param {any} canvas The canvas where the 3D scene is being
             *                     rendered.
             */
            function actuallyRequestLock(canvas) {
                canvas.requestPointerLock = canvas.requestPointerLock ||
                    canvas.msRequestPointerLock ||
                    canvas.mozRequestPointerLock ||
                    canvas.webkitRequestPointerLock;
                if (canvas.requestPointerLock) {
                    canvas.requestPointerLock();
                }
            }
            PointerLock.actuallyRequestLock = actuallyRequestLock;
        })(PointerLock = Environment.PointerLock || (Environment.PointerLock = {}));
    })(Environment = World.Environment || (World.Environment = {}));
})(World || (World = {}));
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The Skybox namespace is where all the functions related to the skybox
     * are stored.
     */
    var Skybox;
    (function (Skybox) {
        /**
         * This function checks a mesh to see if it's marked as the skybox
         * mesh. You can mark a mesh as a skybox mesh using the VR Blender
         * plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as a skybox.
         */
        function checkInitialMesh(m, json) {
            if (json.s === "1") {
                // It's a skybox.
                m.checkCollisions = false; // No need to check collisions on
                // a skybox.
                m.infiniteDistance = true; // Make it so the skybox is always
                // far away.
                m.renderingGroupId = 0; // Set the rendering group id to be
                // 0, so other objects are always
                // rendered in front.
                m.material.backFaceCulling = false; // No need to render the
                // outside of the skybox,
                // since the camera will
                // always be inside it.
                m.material.disableLighting = true; // The skybox doesn't
                // interact with lights.
                // Remove reflections, because the skybox is an image texture,
                // and the sun doens't reflect off the sky.
                m.material.specularColor = new BABYLON.Color3(0, 0, 0);
                m.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                // m.isPickable = true;  // Uncomment this if you want to know
                // the location of an image on the
                // skybox.
                World.Skybox.skyboxMesh = m;
            }
            else {
                // If it's not the skybox, set the rendering group id to 1. So
                // it will be displayed in front of the skybox.
                World.Utils.setRenderingGroupId(m, 1);
            }
        }
        Skybox.checkInitialMesh = checkInitialMesh;
        /**
         * Applies images to the skybox. Sometimes it's much easier to just
         * get the skybox from image files directly, rather than making them
         * in Blender.
         * @param {string} dir The directory where the skybox images are
         *                     stored, including the beginning of the jpg file
         *                     that is common to all files.
         */
        function applyBoxImgs(dir) {
            // See https://doc.babylonjs.com/tutorials/Environment#skybox for
            // filename convention.
            // Create a new material for the skybox.
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", World.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.disableLighting = true;
            skyboxMaterial.reflectionTexture =
                new BABYLON.CubeTexture(dir, World.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode =
                BABYLON.Texture.SKYBOX_MODE;
            if (World.Skybox.skyboxMesh !== undefined) {
                World.Skybox.skyboxMesh.material = skyboxMaterial;
            }
            else {
                console.log("ERROR: You tried to apply a skybox, but there is no skybox object imported from blender.");
            }
        }
        Skybox.applyBoxImgs = applyBoxImgs;
    })(Skybox = World.Skybox || (World.Skybox = {}));
})(World || (World = {}));
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The BillboardMeshes namespace is where all the functions and variables
     * related to billboard meshes are stored. Billboard meshes always face
     * the camera (could be just a plane).
     */
    var BillboardMeshes;
    (function (BillboardMeshes) {
        /**
         * This function checks a mesh to see if it's marked as a billboard
         * mesh. You can mark a mesh as a billboard mesh using the VR Blender
         * plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as the billboard.
         */
        function checkInitialMesh(m, json) {
            if (json.b === "1") {
                // Enable billboard.
                m.billboardMode = BABYLON.Mesh.BILLBOARDMODE_Y;
            }
            else {
            }
        }
        BillboardMeshes.checkInitialMesh = checkInitialMesh;
    })(BillboardMeshes = World.BillboardMeshes || (World.BillboardMeshes = {}));
})(World || (World = {}));
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The AutoLODMeshes namespace is where all the functions and variables
     * related to auto LODing are stored. LOD is when a simpler version of the
     * mesh is shown from a distance, to keep things running fast.
     */
    var AutoLODMeshes;
    (function (AutoLODMeshes) {
        /**
         * This function checks a mesh to see if it's marked as an auto LOD
         * mesh. You can mark a mesh as an auto LOD mesh using the VR Blender
         * plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as an auto LOD mesh.
         */
        function checkInitialMesh(m, json) {
            if (json.l === "1") {
                // Enable auto LOD.
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
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * The Utils namespace is where utility functions are stored.
     */
    var Utils;
    (function (Utils) {
        /**
         * Set the rendering group id for a given mesh. Meshes with lower
         * rendering group ids (e.g., the skybox) are drawn behind other
         * objects.
         * @param {any}    mesh The mesh.
         * @param {number} val  The rendering group id.
         */
        function setRenderingGroupId(mesh, val) {
            // Set the rendering group on this mesh.
            mesh.renderingGroupId = val;
            // And all it's associted LOD meshes.
            if (mesh.hasOwnProperty("_LODLevels")) {
                mesh._LODLevels.forEach(function (m) {
                    if (m.mesh !== null) {
                        m.mesh.renderingGroupId = val;
                    }
                });
            }
            // Anything with "Decimated" in it needs to be renderingGroupID 1.
            World.scene.meshes.forEach(function (m) {
                if (m.name.indexOf("Decimated") !== -1) {
                    m.renderingGroupId = 1;
                }
            });
        }
        Utils.setRenderingGroupId = setRenderingGroupId;
    })(Utils = World.Utils || (World.Utils = {}));
})(World || (World = {}));
var World;
(function (World) {
    var Triggers;
    (function (Triggers) {
        Triggers.triggers = [];
        function addTrigger(action, conditionToSatisfy, fireOnce, intervalInMiliseconds) {
            if (intervalInMiliseconds === void 0) { intervalInMiliseconds = 2000; }
            var trig = new World.Triggers.Trigger(action, conditionToSatisfy, fireOnce, intervalInMiliseconds);
            World.Triggers.triggers.push(trig);
        }
        Triggers.addTrigger = addTrigger;
        var Trigger = (function () {
            function Trigger(action, conditionToSatisfy, fireOnce, intervalInMiliseconds) {
                if (intervalInMiliseconds === void 0) { intervalInMiliseconds = 2000; }
                this.action = function () { };
                this.conditionToSatisfy = function () { };
                this.intervalInMiliseconds = 0;
                this.fireOnce = true;
                this.countDown = 0;
                this.lastTime = 0;
                // Set class variables
                this.action = action;
                this.conditionToSatisfy = conditionToSatisfy; // This function doesn't accept parameters. Just bind the needed variables.
                this.fireOnce = fireOnce;
                this.intervalInMiliseconds = intervalInMiliseconds;
                // Set countdown.
                this.countDown = intervalInMiliseconds;
                this.lastTime = new Date().getTime();
            }
            Trigger.prototype.tick = function () {
                if (this.countDown < 0) {
                    this.countDown = this.intervalInMiliseconds;
                    if (this.conditionToSatisfy()) {
                        this.action();
                        if (this.fireOnce == true) {
                            this.action = function () { };
                        }
                    }
                }
                else {
                    var curTime = new Date().getTime();
                    var deltaTime = curTime - this.lastTime;
                    this.countDown = this.countDown - deltaTime;
                    this.lastTime = curTime;
                }
            };
            return Trigger;
        }());
        Triggers.Trigger = Trigger;
        var PackagedConditionals;
        (function (PackagedConditionals) {
            function distance(triggerMesh, cutoffDistance) {
                // The distance trigger function.
                var func = function () {
                    // First check if the player is within a certain distance of the target.
                    var dist = BABYLON.Vector3.Distance(this.triggerMesh.position, World.CameraChar.camera.position);
                    if (dist < this.cutoffDistance) {
                        // They are close to the target.
                        // Now check if the camera is looking at the target.
                        var frustumPlanes = BABYLON.Frustum.GetPlanes(World.scene.getTransformMatrix());
                        if (triggerMesh.isInFrustum(frustumPlanes)) {
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    else {
                        // They are not, so return false.
                        return false;
                    }
                }.bind({
                    triggerMesh: triggerMesh,
                    cutoffDistance: cutoffDistance
                });
                return func;
            }
            PackagedConditionals.distance = distance;
        })(PackagedConditionals = Triggers.PackagedConditionals || (Triggers.PackagedConditionals = {}));
        var PackagedAction;
        (function (PackagedAction) {
            function fadeMesh(mesh, milliseconds) {
                if (milliseconds === void 0) { milliseconds = 2000; }
                World.anyVar = 1.0;
                var thisFunc = World.Triggers.PackagedAction._fadeMesh.bind({
                    mesh: mesh,
                    milliseconds: milliseconds
                });
                thisFunc();
            }
            PackagedAction.fadeMesh = fadeMesh;
            function _fadeMesh() {
                var transparency = World.anyVar;
                // Would be much better to tie timeouts like this to the render loop.
                // this.mesh.material.alpha = World.anyVar;
                this.mesh.visibility = World.anyVar;
                World.anyVar = World.anyVar - 10 / this.milliseconds;
                if (World.anyVar > 0) {
                    var thisFunc = World.Triggers.PackagedAction._fadeMesh.bind({
                        mesh: this.mesh,
                        milliseconds: this.milliseconds
                    });
                    setTimeout(thisFunc, 10);
                }
            }
            PackagedAction._fadeMesh = _fadeMesh;
        })(PackagedAction = Triggers.PackagedAction || (Triggers.PackagedAction = {}));
    })(Triggers = World.Triggers || (World.Triggers = {}));
})(World || (World = {}));
/// <reference path="Ground.ts" />
/// <reference path="CameraChar.ts" />
/// <reference path="CollisionMeshes.ts" />
/// <reference path="Environment.ts" />
/// <reference path="Skybox.ts" />
/// <reference path="Billboard.ts" />
/// <reference path="AutoLOD.ts" />
/// <reference path="Utils.ts" />
/// <reference path="Triggers.ts" />
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    World.tmpSpheres = [];
    World.debug = false;
    World.meshesByName = [];
    World.anyVar = undefined; // Just a place to storev  any variable
    /**
     * Set up the BABYLON game engine.
     */
    function setup() {
        // Whether or not to run in debug mode (shows certain messages in the
        // console, etc.)
        World.debug = true;
        // Only run the below once the whole document has loaded.
        $(document).ready(function () {
            // Get the canvas DOM element.
            World.canvas = document.getElementById('renderCanvas');
            // Load the 3D engine. true means antialiasing is on.
            World.engine = new BABYLON.Engine(World.canvas, true);
            // Load a scene from a BABYLON file.
            BABYLON.SceneLoader.Load("scene/", "test.babylon", World.engine, function (newScene) {
                // Wait for textures and shaders to be ready before
                // proceeding.
                newScene.executeWhenReady(function () {
                    // Store the scene in a variable so you can reference it
                    // later.
                    World.scene = newScene;
                    // Loop through each of the objects in the scene and
                    // modify them according to the name (which is a json).
                    World.scene.meshes.forEach(function (m) {
                        //try {
                        // Convert the mesh name to a json object with
                        // information about the mesh.
                        var jsonStr = '{"' + m.name + '"}';
                        jsonStr = jsonStr.replace(/:/g, '":"')
                            .replace(/,/g, '","');
                        var json = JSON.parse(jsonStr);
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
                    World.Skybox.applyBoxImgs("3d_resources/sky_boxes/sky27/sp9");
                    // Listen for a click. If the user clicks on an object,
                    // print information about the clicked object in the
                    // console.
                    window.addEventListener("click", function () {
                        // We try to pick an object.
                        var pickResult = World.scene.pick(World.scene.pointerX, World.scene.pointerY);
                        console.log(pickResult.pickedMesh, pickResult.pickedMesh.name, pickResult.pickedMesh.renderingGroupId);
                    });
                    // Add triggers.
                    /*World.Triggers.addTrigger(function() {
                            World.meshesByName["ribbon"] = 2;
                            let mesh = World.meshesByName["surf"];
                            mesh.alphaIndex = 5;
                            mesh.visibility = 0.95;
                            // World.Triggers.PackagedAction.fadeMesh(mesh);
                        },
                        World.Triggers.PackagedConditionals.distance(World.meshesByName["prot_coll"], 4),
                        true,
                        2000
                    );*/
                    // Once the scene is loaded, register a render loop and
                    // start rendering the frames.
                    World.engine.runRenderLoop(function () {
                        // Make sure the character is aboe the ground.
                        World.Ground.ensureCharAboveGround();
                        // Check for collisions
                        World.CameraChar.repositionPlayerIfCollision();
                        // Go through each of the triggers and see if any one has been set.
                        for (var i = 0; i < World.Triggers.triggers.length; i++) {
                            var trig = World.Triggers.triggers[i];
                            trig.tick();
                        }
                        // Set variables based on current frame rate
                        var animationRatio = World.scene.getAnimationRatio();
                        World.CameraChar.camera.speed = 1.5 * animationRatio;
                        // Render the scene.
                        newScene.render();
                        // Save location of camera
                        World.CameraChar.previousPos = World.CameraChar.camera.position.clone();
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
/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
var World;
(function (World) {
    /**
     * Start the VR App.
     */
    function start() {
        World.setup();
    }
    World.start = start;
})(World || (World = {}));
// Start the VR program.
World.start();
