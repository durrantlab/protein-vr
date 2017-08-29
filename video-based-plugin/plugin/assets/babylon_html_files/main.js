define(["require", "exports", "./VideoFrames", "./StandardShader"], function (require, exports, VideoFrames_1, StandardShader_1) {
    "use strict";
    exports.__esModule = true;
    var callbacksComplete = [];
    var callBacks;
    (function (callBacks) {
        callBacks[callBacks["SCENE_READY"] = 0] = "SCENE_READY";
        callBacks[callBacks["VIDEO_FRAMES_LOADED"] = 1] = "VIDEO_FRAMES_LOADED";
        callBacks[callBacks["JSON_LOADED"] = 2] = "JSON_LOADED";
    })(callBacks || (callBacks = {}));
    var Game = (function () {
        function Game(params) {
            // setInterval(function() {console.log(this.frameAndCameraPos);}.bind(this), 100);
            // Get the canvas element from our HTML above
            this._canvas = document.getElementById("renderCanvas");
            this._timeOfLastClick = new Date().getTime(); // A refractory period
            if (!BABYLON.Engine.isSupported()) {
                alert("ERROR: Babylon not supported!");
            }
            else {
                // Set the engine
                this._params = params;
                this._engine = new BABYLON.Engine(this._canvas, true);
                this._loadScene();
            }
        }
        Game.prototype._loadScene = function () {
            BABYLON.SceneLoader.Load("", "babylon.babylon", this._engine, function (scene) {
                this.scene = scene;
                // Wait for textures and shaders to be ready
                this.scene.executeWhenReady(function () {
                    this._setupCamera();
                    this._setupFromJSON(function () {
                        this._setupVideoSphere();
                        this._startRenderLoop();
                    }.bind(this));
                    this._resizeWindow();
                    this._params.onDone();
                    callbacksComplete.push(callBacks.SCENE_READY);
                    this.scene.debugLayer.show();
                }.bind(this));
            }.bind(this), function (progress) {
                // To do: give progress feedback to user
            });
        };
        Game.prototype._setupCamera = function () {
            // Attach camera to canvas inputs
            this.scene.activeCamera.attachControl(this._canvas);
        };
        Game.prototype._setupVideoSphere = function () {
            // HTML5 video controls are inconsistent, but you want to take
            // advantage of the compression video provides. It's much better than
            // loading the frames separately. So basically, load the video and
            // then separate the frames to separate images.
            // Add video element to DOM.
            // jQuery("body").append(`<video src="" id="video"></video>`);
            // jQuery("body").append(`<canvas id="canvas"></canvas>`);
            // let canvas = document.createElement('canvas');
            // Load in the video.
            // See https://stackoverflow.com/questions/13864795/wait-until-an-html5-video-loads
            // var video: any = document.getElementById("video");
            // video.src = 'proteinvr_baked.mp4';
            // video.load();
            // Wait for the video to load
            // video.addEventListener('loadeddata', function() {
            //     console.log(this.video.duration, "MOO");
            //     let times = [0.0, 0.5]
            //     for (let i=0; i<times.length; i++) {
            //         let time = times[i];
            //         // video.currentTime = time;
            //         this.canvas.height = this.video.videoHeight;
            //         this.canvas.width = this.video.videoWidth;
            //         let ctx = canvas.getContext('2d');
            //         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            //         let img = new Image();
            //         img.src = canvas.toDataURL();
            //         console.log(img.src);
            //     }
            //  }.bind({
            //      video: video, 
            //      canvas: canvas
            //  }), false);
            // // Set up the video texture
            // let videoTexture = new BABYLON.VideoTexture("video", ["proteinvr_baked.mp4"], this.scene, true);
            // this._sphereVideo = videoTexture.video;
            // this._sphereVideo.addEventListener('canplay', function() {
            //     // this._sphereVideo.pause();
            //     // this._sphereVideo.currentTime = 1.6;
            //     console.log("Ready");
            // }.bind(this));
            // // Start rendering video texture
            this._viewerSphere = this.scene.meshes[0]; // Because sphere is only thing in scene.
            this.scene.activeCamera.position = this._viewerSphere.position;
            // let mat = new BABYLON.StandardMaterial("mat", this.scene);
            this._shader = new StandardShader_1.Shader(this.scene, BABYLON);
            // this._shader.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
            // this._shader.material.specularColor = new BABYLON.Color3(0, 0, 0);
            // this._shader.material.diffuseTexture = null;
            // this._shader.material.backFaceCulling = false;
            // this._shader.material.emissiveTexture = null; // videoTexture;
            this._viewerSphere.material = this._shader.material;
            this._viewerSphere.isPickable = false;
            // Resize the viewer sphere
            var radius = this._JSONData["viewer_sphere_size"];
            this._viewerSphere.scaling = new BABYLON.Vector3(radius, radius, radius);
            window.sphere = this._viewerSphere;
            // window.video = this._sphereVideo;
            // console.log(this._sphereVideo);
            // // var s1 = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.scene);
            // // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, 3.6123595);
            // // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, -3.6123595);
        };
        Game.prototype._setupFromJSON = function (callBack) {
            if (callBack === void 0) { callBack = function () { }; }
            jQuery.get("data.json", function (data) {
                var callBack = this.callBack;
                var This = this.This;
                This._JSONData = data;
                // Load extra obj files
                var loader = new BABYLON.AssetsManager(This.scene);
                var objFilenames = data["clickableFiles"];
                for (var i = 0; i < objFilenames.length; i++) {
                    var objFilename = objFilenames[i];
                    // console.log(objFilename);
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
                This.frameAndCameraPos = [];
                for (var i = 0; i < data["cameraPos"].length; i++) {
                    var pt = data["cameraPos"][i];
                    var frame = pt[0];
                    var v = new BABYLON.Vector3(pt[1], pt[3], pt[2]); // note that Y and Z axes are switched on purpose.
                    This.frameAndCameraPos.push([frame, v, null]); // null is texture, populated later.
                }
                callbacksComplete.push(callBacks.JSON_LOADED);
                var func = This._params.onJSONLoaded.bind(This);
                func();
                func = callBack.bind(This);
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
                    var pickResult = this.scene.pick(evt.clientX, evt.clientY);
                    if ((pickResult !== null) && (pickResult.pickedMesh !== null) && (pickResult.pickedMesh.id != "ProteinVR_ViewerSphere")) {
                        console.log(pickResult.pickedMesh.id);
                    }
                }
            }.bind(this));
        };
        Game.prototype._startRenderLoop = function () {
            // Once the scene is loaded, just register a render loop to render it
            this._engine.runRenderLoop(function () {
                // let x = Math.round(this.scene.activeCamera.position.x * 100) / 100;
                // let y = Math.round(this.scene.activeCamera.position.y * 100) / 100;
                // let z = Math.round(this.scene.activeCamera.position.z * 100) / 100;
                // console.log(bestFrame, x, y, z);
                // console.log(x, y, z);
                this._setCamera();
                this.scene.render();
            }.bind(this));
        };
        Game.prototype._setCamera = function () {
            // this.scene.activeCamera.position = new BABYLON.Vector3(1.0,1.0,1.0);
            // return;
            // console.log("=====");
            // console.clear();
            // Calculate distances to all camera positions
            var cameraLoc = this.scene.activeCamera.position;
            var distData = [];
            for (var i = 0; i < this.frameAndCameraPos.length; i++) {
                var frameAndCameraPos = this.frameAndCameraPos[i];
                var pos = frameAndCameraPos[1].clone();
                var dist = pos.subtract(cameraLoc).length();
                distData.push([dist, frameAndCameraPos]);
            }
            // Sort by distance
            var kf = function (a, b) {
                a = a[0];
                b = b[0];
                if (a < b) {
                    return -1;
                }
                else if (a > b) {
                    return 1;
                }
                else {
                    return 0;
                }
            };
            distData.sort(kf);
            var tex1 = distData[0][1][2];
            var tex2 = distData[1][1][2];
            var tex3 = distData[2][1][2];
            var dist1 = distData[0][0];
            var dist2 = distData[1][0];
            var dist3 = distData[2][0];
            var bestDist = dist1;
            var bestPos = distData[0][1][1];
            // Get the current camera location
            // let bestDist = 1000000000.0;
            // let bestFrame = null;
            // let bestPos = null;
            // let bestTexture = null;
            // for (let i=0; i<this.frameAndCameraPos.length; i++) {
            //     let frameAndCameraPos = this.frameAndCameraPos[i];
            //     let frame = frameAndCameraPos[0];
            //     let pos = frameAndCameraPos[1].clone();
            //     let dist = pos.subtract(cameraLoc).length();
            //     if (dist < bestDist) {
            //         bestDist = dist;
            //         bestFrame = i; // frame;  // TODO: Don't think FRAME (first element in frameAndCameraPos) is ever even used.
            //         bestPos = pos;
            //         bestTexture = frameAndCameraPos[2]
            //         if (dist === 0.0) {
            //             break;  // can't get closer than this.
            //         }
            //     }
            //     // console.log("pos", pos, "dist", dist)
            // }
            // debug: ignore above and pick a random one.
            // bestFrame = Math.floor(Math.random()*this.frameAndCameraPos.length);
            // bestFrame = 45;
            // if (bestFrame > 0) {bestFrame = bestFrame - 1;}
            // let item = this.frameAndCameraPos[bestFrame];
            // bestPos = item[1];
            // bestTexture = item[2];
            // Move camera to best frame.
            var maxDistAllowed = 0.1 * this._JSONData["viewer_sphere_size"];
            if (bestDist > maxDistAllowed) {
                var vec = this.scene.activeCamera.position.subtract(bestPos).normalize().scale(maxDistAllowed);
                // console.log(vec);
                this.scene.activeCamera.position = bestPos.add(vec);
            }
            // this.scene.activeCamera.position = bestPos;
            // Move sphere
            this._viewerSphere.position = bestPos;
            // Update texture
            // console.log("bestFrame", bestFrame)
            // console.log("bestPos", bestPos);
            // console.log("cameraPos", this.scene.activeCamera.position);
            this._shader.setTextures(tex1); //, tex2, tex3, dist1, dist2, dist3);
            // this._viewerSphere.material.emissiveTexture = bestTexture;
            // debugger;
        };
        Game.prototype._resizeWindow = function () {
            // Watch for browser/canvas resize events
            window.addEventListener("resize", function () {
                this._engine.resize();
            }.bind(this));
        };
        return Game;
    }());
    exports.Game = Game;
    function start() {
        var game = new Game({
            onJSONLoaded: function () {
                console.log("DONE!!!");
                var ef = new VideoFrames_1.ExtractFrames("proteinvr_baked.mp4", BABYLON, this, function () {
                    callbacksComplete.push(callBacks.VIDEO_FRAMES_LOADED);
                    console.log("done");
                });
            },
            onDone: function () { }
        });
    }
    exports.start = start;
});
