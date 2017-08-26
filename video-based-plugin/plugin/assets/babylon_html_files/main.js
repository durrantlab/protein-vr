var Game = (function () {
    function Game() {
        // Get the canvas element from our HTML above
        this._canvas = document.getElementById("renderCanvas");
        this._timeOfLastClick = new Date().getTime(); // A refractory period
        if (!BABYLON.Engine.isSupported()) {
            alert("ERROR: Babylon not supported!");
        }
        else {
            // Set the engine
            this._engine = new BABYLON.Engine(this._canvas, true);
            this._loadScene();
        }
    }
    Game.prototype._loadScene = function () {
        BABYLON.SceneLoader.Load("", "babylon.babylon", this._engine, function (scene) {
            this._scene = scene;
            // Wait for textures and shaders to be ready
            this._scene.executeWhenReady(function () {
                this._setupCamera();
                this._setupVideoSphere();
                this._setupFromJSON(function () {
                    this._startRenderLoop();
                }.bind(this));
                this._resizeWindow();
                this._scene.debugLayer.show();
            }.bind(this));
        }.bind(this), function (progress) {
            // To do: give progress feedback to user
        });
    };
    Game.prototype._setupCamera = function () {
        // Attach camera to canvas inputs
        this._scene.activeCamera.attachControl(this._canvas);
    };
    Game.prototype._setupVideoSphere = function () {
        // Set up the video texture
        var videoTexture = new BABYLON.VideoTexture("video", ["proteinvr_baked.mp4"], this._scene, true);
        this._sphereVideo = videoTexture.video;
        this._sphereVideo.addEventListener('canplay', function () {
            // this._sphereVideo.pause();
            // this._sphereVideo.currentTime = 1.6;
            console.log("Ready");
        }.bind(this));
        // Start rendering video texture
        this._viewerSphere = this._scene.meshes[0]; // Because sphere is only thing in scene.
        this._scene.activeCamera.position = this._viewerSphere.position;
        var mat = new BABYLON.StandardMaterial("mat", this._scene);
        mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        mat.specularColor = new BABYLON.Color3(0, 0, 0);
        mat.diffuseTexture = null;
        mat.backFaceCulling = false;
        mat.emissiveTexture = videoTexture;
        this._viewerSphere.material = mat;
        this._viewerSphere.isPickable = false;
        window.sphere = this._viewerSphere;
        window.video = this._sphereVideo;
        console.log(this._sphereVideo);
        // var s1 = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this._scene);
        // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, 3.6123595);
        // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, -3.6123595);
    };
    Game.prototype._setupFromJSON = function (callBack) {
        if (callBack === void 0) { callBack = function () { }; }
        jQuery.get("data.json", function (data) {
            var callBack = this.callBack;
            var This = this.This;
            // Load extra obj files
            var loader = new BABYLON.AssetsManager(This._scene);
            var objFilenames = data["clickableFiles"];
            for (var i = 0; i < objFilenames.length; i++) {
                var objFilename = objFilenames[i];
                console.log(objFilename);
                var meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
                meshTask.onSuccess = function (task) {
                    var mesh = task.loadedMeshes[0]; // Why is this necessary?
                    mesh.scaling.z = -1.0;
                    this._viewerSphere.isPickable = true;
                };
            }
            loader.load();
            // Make those meshes clickable
            This._makeSomeMeshesClickable();
            // Load camera tracks
            This._frameAndCameraPos = [];
            for (var i = 0; i < data["cameraPos"].length; i++) {
                var pt = data["cameraPos"][i];
                var frame = pt[0];
                var v = new BABYLON.Vector3(pt[1], pt[3], pt[2]); // note that Y and Z axes are switched on purpose.
                This._frameAndCameraPos.push([frame, v]);
            }
            var func = callBack.bind(this);
            func();
        }.bind({
            This: this,
            callBack: callBack
        }));
    };
    Game.prototype._makeSomeMeshesClickable = function () {
        //When click event is raised
        window.addEventListener("click", function (evt) {
            var now = new Date().getTime();
            if (now - this._timeOfLastClick > 500) {
                this._timeOfLastClick = now;
                // We try to pick an object
                var pickResult = this._scene.pick(evt.clientX, evt.clientY);
                if ((pickResult !== null) && (pickResult.pickedMesh !== null) && (pickResult.pickedMesh.id != "ProteinVR_ViewerSphere")) {
                    console.log(pickResult.pickedMesh.id);
                }
            }
        }.bind(this));
    };
    Game.prototype._startRenderLoop = function () {
        // Once the scene is loaded, just register a render loop to render it
        this._engine.runRenderLoop(function () {
            this._setCamera();
            this._scene.render();
        }.bind(this));
    };
    Game.prototype._setCamera = function () {
        // Get the current camera location
        var cameraLoc = this._scene.activeCamera.position;
        var bestDist = 1000000000.0;
        var bestFrame = -1;
        var bestPos = null;
        for (var i = 0; i < this._frameAndCameraPos.length; i++) {
            var frameAndCameraPos = this._frameAndCameraPos[i];
            var frame = frameAndCameraPos[0];
            var pos = frameAndCameraPos[1];
            var dist = pos.subtract(cameraLoc).length();
            if (dist < bestDist) {
                bestDist = dist;
                bestFrame = frame;
                bestPos = pos;
                if (bestDist === 0.0) {
                    break; // can't get closer than this.
                }
            }
        }
        // Move camera to best frame.
        this._scene.activeCamera.position = bestPos;
        // Move sphere
        this._viewerSphere.position = bestPos;
    };
    Game.prototype._resizeWindow = function () {
        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () {
            this._engine.resize();
        }.bind(this));
    };
    return Game;
}());
var game = new Game();
