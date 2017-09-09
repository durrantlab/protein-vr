define(["require", "exports", "./VideoFrames", "./StandardShader", "./UserVars", "./SettingsPanel"], function (require, exports, VideoFrames_1, StandardShader_1, UserVars, SettingsPanel) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var callbacksComplete = [];
    var callBacks;
    (function (callBacks) {
        callBacks[callBacks["SCENE_READY"] = 0] = "SCENE_READY";
        callBacks[callBacks["VIDEO_FRAMES_LOADED"] = 1] = "VIDEO_FRAMES_LOADED";
        callBacks[callBacks["JSON_LOADED"] = 2] = "JSON_LOADED";
    })(callBacks || (callBacks = {}));
    class Game {
        constructor(params) {
            // setInterval(function() {console.log(this.cameraPos);}.bind(this), 100);
            // Get the canvas element from our HTML above
            this._canvas = document.getElementById("renderCanvas");
            this._timeOfLastClick = new Date().getTime(); // A refractory period
            this._guideSpheres = [];
            this._guideSphereMaxVisibility = 0.25;
            this._guideSphereSize = 0.02;
            if (!BABYLON.Engine.isSupported()) {
                alert("ERROR: Babylon not supported!");
            }
            else {
                // Set the engine
                this._params = params;
                this.engine = new BABYLON.Engine(this._canvas, true);
                this._loadScene();
            }
        }
        _loadScene() {
            let userVarsSetupPromise = UserVars.setup({
                engine: this.engine,
                jQuery: jQuery
            });
            userVarsSetupPromise.then((fulfilled) => {
                console.log(fulfilled);
                var allowUerModifySettingsPromise = SettingsPanel.allowUserToModifySettings({
                    engine: this.engine,
                    jQuery: jQuery
                });
                return allowUerModifySettingsPromise;
            }).then((fulfilled) => {
                console.log(fulfilled);
            });
            // UserVars.setup();
        }
        _setupVideoSphere() {
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
            this._viewerSphere.renderingGroupId = 2;
            // Resize the viewer sphere
            let radius = 12; // When using VR, this needs to be farther away that what it was rendered at. this._JSONData["viewerSphereSize"];
            this._viewerSphere.scaling = new BABYLON.Vector3(radius, radius, -radius);
            this._viewerSphere.rotation.y = 1.5 * Math.PI; // To align export with scene.
            // alert("hi");
            // Flip normals
            // this._viewerSphere
            window.sphere = this._viewerSphere;
            // window.video = this._sphereVideo;
            // console.log(this._sphereVideo);
            // // var s1 = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.scene);
            // // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, 3.6123595);
            // // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, -3.6123595);
        }
        _setupFromJSON(callBack = function () { }) {
            jQuery.get("data.json", function (data) {
                let callBack = this.callBack;
                let This = this.This;
                This._JSONData = data;
                // Add in guide spheres.
                let sphereMat = new BABYLON.StandardMaterial("sphereMat", This.scene);
                // sphereMat.backFaceCulling = false;
                sphereMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
                sphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
                sphereMat.diffuseTexture = null;
                sphereMat.emissiveTexture = null; //new BABYLON.Texture("dot.png", This.scene);
                // sphereMat.emissiveTexture.hasAlpha = true;
                sphereMat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
                for (let i = 0; i < data["guideSphereLocations"].length; i++) {
                    let sphereLoc = data["guideSphereLocations"][i];
                    let sphere = BABYLON.Mesh.CreateDisc("sphere" + i.toString(), 0.05, 12, This.scene, false, BABYLON.Mesh.DEFAULTSIDE); //BABYLON.Mesh.CreatePlane("sphere" + i.toString(), 1.0, This.scene, false, BABYLON.Mesh.DOUBLESIDE); // new BABYLON.Mesh.CreateSphere("sphere" + i.toString(), 8, This._guideSphereSize, This.scene);
                    sphere.material = sphereMat;
                    sphere.position.x = sphereLoc[0];
                    sphere.position.y = sphereLoc[2]; // note y and z reversed.
                    sphere.position.z = sphereLoc[1];
                    sphere.renderingGroupId = 3;
                    sphere.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
                    // sphere.alpha = 1.0;
                    This._guideSpheres.push(sphere);
                }
                // Set some guide-sphere parameters
                let viewerSphereSize = data["viewerSphereSize"];
                This._guideSphereHiddenCutoffDist = 0.1 * viewerSphereSize;
                This._guideSphereShowCutoffDist = 2.0 * viewerSphereSize;
                This._guideSphereIntermediateFactor = This._guideSphereMaxVisibility / (This._guideSphereShowCutoffDist - This._guideSphereHiddenCutoffDist);
                // Load extra obj files
                var loader = new BABYLON.AssetsManager(This.scene);
                let objFilenames = data["clickableFiles"];
                for (let i = 0; i < objFilenames.length; i++) {
                    let objFilename = objFilenames[i];
                    // console.log(objFilename);
                    let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
                    meshTask.onSuccess = function (task) {
                        let mesh = task.loadedMeshes[0]; // Why is this necessary?
                        mesh.scaling.z = -1.0;
                        mesh.renderingGroupId = 1;
                        // this._viewerSphere.isPickable = true;
                        mesh.isPickable = true;
                    };
                }
                loader.load();
                // Make those meshes clickable
                This._makeSomeMeshesClickable();
                // Load camera tracks
                This.cameraPositionsAndTextures = [];
                for (let i = 0; i < data["cameraPositionsAndTextures"].length; i++) {
                    let pt = data["cameraPositionsAndTextures"][i];
                    // let frame = pt[0];
                    let v = new BABYLON.Vector3(pt[0], pt[2], pt[1]); // note that Y and Z axes are switched on purpose.
                    This.cameraPositionsAndTextures.push([v, null]); // null is texture, populated later.
                }
                callbacksComplete.push(callBacks.JSON_LOADED);
                let func = This._params.onJSONLoaded.bind(This);
                func();
                func = callBack.bind(This);
                func();
            }.bind({
                This: this,
                callBack: callBack
            }));
        }
        _makeSomeMeshesClickable() {
            //When click event is raised
            window.addEventListener("click", function (evt) {
                let now = new Date().getTime();
                if (now - this._timeOfLastClick > 500) {
                    this._timeOfLastClick = now;
                    // We try to pick an object
                    var pickResult = this.scene.pick(evt.clientX, evt.clientY);
                    if ((pickResult !== null) && (pickResult.pickedMesh !== null) && (pickResult.pickedMesh.id != "ProteinVR_ViewerSphere")) {
                        console.log(pickResult.pickedMesh.id);
                    }
                }
            }.bind(this));
        }
        _startRenderLoop() {
            // Once the scene is loaded, just register a render loop to render it
            this.engine.runRenderLoop(function () {
                // let x = Math.round(this.scene.activeCamera.position.x * 100) / 100;
                // let y = Math.round(this.scene.activeCamera.position.y * 100) / 100;
                // let z = Math.round(this.scene.activeCamera.position.z * 100) / 100;
                // console.log(bestFrame, x, y, z);
                // console.log(x, y, z);
                this._camera.update();
                this.scene.render();
            }.bind(this));
        }
        _resizeWindow() {
            // Watch for browser/canvas resize events
            window.addEventListener("resize", function () {
                this.engine.resize();
            }.bind(this));
        }
    }
    exports.Game = Game;
    function start() {
        let game = new Game({
            onJSONLoaded: function () {
                console.log("DONE!!!");
                let ef = new VideoFrames_1.ExtractFrames(BABYLON, jQuery, this, function () {
                    callbacksComplete.push(callBacks.VIDEO_FRAMES_LOADED);
                    console.log("done");
                });
            },
            onDone: function () { }
        });
    }
    exports.start = start;
});
