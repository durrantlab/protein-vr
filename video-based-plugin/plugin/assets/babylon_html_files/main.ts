import { ExtractFrames } from "./VideoFrames";

declare var BABYLON;
declare var jQuery;

var callbacksComplete = [];

enum callBacks {
    SCENE_READY,
    VIDEO_FRAMES_LOADED,
    JSON_LOADED
}

interface GameInterface {
    onJSONLoaded: any;
    onDone: any;
}

export class Game {
    // Get the canvas element from our HTML above
    private _canvas = document.getElementById("renderCanvas");

    // Load the BABYLON 3D engine. Variable here because defined within
    // isSupported below.
    private _engine: any;

    public scene: any;

    public frameAndCameraPos: any;

    private _viewerSphere: any;

    private _timeOfLastClick: number = new Date().getTime();  // A refractory period

    private _sphereVideo: any;

    private _params: GameInterface;

    constructor(params: GameInterface) {

        // setInterval(function() {console.log(this.frameAndCameraPos);}.bind(this), 100);
        
        
        if (!BABYLON.Engine.isSupported()) {
            alert("ERROR: Babylon not supported!");
        } else {  // Babylon is supported
            // Set the engine
            this._params = params;
            this._engine = new BABYLON.Engine(this._canvas, true);
            this._loadScene();
        }
    }

    private _loadScene() {
        BABYLON.SceneLoader.Load("", "babylon.babylon", this._engine, function (scene) {
            this.scene = scene;

            // Wait for textures and shaders to be ready
            this.scene.executeWhenReady(function () {
                this._setupCamera();
                this._setupVideoSphere();
                this._setupFromJSON(function() {
                    this._startRenderLoop();
                }.bind(this))
                this._resizeWindow();
                this._params.onDone();
                callbacksComplete.push(callBacks.SCENE_READY);

                this.scene.debugLayer.show();
            }.bind(this))
        }.bind(this),
        function (progress) {
            // To do: give progress feedback to user
        });
    }
    
    private _setupCamera() {
        // Attach camera to canvas inputs
        this.scene.activeCamera.attachControl(this._canvas);        
    }

    private _setupVideoSphere() {
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
        this._viewerSphere = this.scene.meshes[0];  // Because sphere is only thing in scene.
        this.scene.activeCamera.position = this._viewerSphere.position;
        
        let mat = new BABYLON.StandardMaterial("mat", this.scene);

        mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
        mat.specularColor = new BABYLON.Color3(0, 0, 0);
        mat.diffuseTexture = null;
        mat.backFaceCulling = false;        
        mat.emissiveTexture = null; // videoTexture;
        
        this._viewerSphere.material = mat;
        this._viewerSphere.isPickable = false;

        window.sphere = this._viewerSphere;
        // window.video = this._sphereVideo;



        // console.log(this._sphereVideo);

        // // var s1 = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, this.scene);
        // // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, 3.6123595);
        // // s1.position = new BABYLON.Vector3(-3.2301483, 2.9906759, -3.6123595);
        
    }

    private _setupFromJSON(callBack=function() {}) {
        jQuery.get("data.json", function(data) {
            let callBack = this.callBack;
            let This = this.This;

            // Load extra obj files
            var loader = new BABYLON.AssetsManager(This.scene);
            let objFilenames = data["clickableFiles"];
            for (let i=0; i<objFilenames.length;i++) {
                let objFilename = objFilenames[i];
                // console.log(objFilename);
                let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
                meshTask.onSuccess = function (task) {
                    let mesh = task.loadedMeshes[0];  // Why is this necessary?
                    mesh.scaling.z = -1.0;
                    this._viewerSphere.isPickable = true;
                }
            }
            loader.load();

            // Make those meshes clickable
            This._makeSomeMeshesClickable();

            // Load camera tracks
            This.frameAndCameraPos = []
            for (let i=0; i<data["cameraPos"].length; i++) {
                let pt = data["cameraPos"][i];
                let frame = pt[0];
                let v = new BABYLON.Vector3(pt[1], pt[3], pt[2]);  // note that Y and Z axes are switched on purpose.
                This.frameAndCameraPos.push([frame, v, null]);  // null is texture, populated later.
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
    
    private _makeSomeMeshesClickable() {
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

    private _startRenderLoop() {
        // Once the scene is loaded, just register a render loop to render it
        this._engine.runRenderLoop(function() {
            // let x = Math.round(this.scene.activeCamera.position.x * 100) / 100;
            // let y = Math.round(this.scene.activeCamera.position.y * 100) / 100;
            // let z = Math.round(this.scene.activeCamera.position.z * 100) / 100;
            // console.log(bestFrame, x, y, z);
            // console.log(x, y, z);

            this._setCamera();
            this.scene.render();
        }.bind(this));
    }

    private _setCamera() {
        // this.scene.activeCamera.position = new BABYLON.Vector3(1.0,1.0,1.0);
        // return;
        
        // console.log("=====");
        // console.clear();
        
        // Get the current camera location
        let cameraLoc = this.scene.activeCamera.position;
        let bestDist = 1000000000.0;
        let bestFrame = null;
        let bestPos = null;
        let bestTexture = null;
        for (let i=0; i<this.frameAndCameraPos.length; i++) {
            let frameAndCameraPos = this.frameAndCameraPos[i];
            let frame = frameAndCameraPos[0];
            let pos = frameAndCameraPos[1].clone();
            let dist = pos.subtract(cameraLoc).length();
            if (dist < bestDist) {
                bestDist = dist;
                bestFrame = i; // frame;  // TODO: Don't think FRAME (first element in frameAndCameraPos) is ever even used.
                bestPos = pos;
                bestTexture = frameAndCameraPos[2]

                if (dist === 0.0) {
                    break;  // can't get closer than this.
                }
            }

            // console.log("pos", pos, "dist", dist)
        }

        // debug: ignore above and pick a random one.
        // bestFrame = Math.floor(Math.random()*this.frameAndCameraPos.length);
        // bestFrame = 45;
        // if (bestFrame > 0) {bestFrame = bestFrame - 1;}

        // let item = this.frameAndCameraPos[bestFrame];
        // bestPos = item[1];
        // bestTexture = item[2];

        // Move camera to best frame.
        this.scene.activeCamera.position = bestPos;

        // Move sphere
        this._viewerSphere.position = bestPos;

        // Update texture
        // console.log("bestFrame", bestFrame)
        // console.log("bestPos", bestPos);
        // console.log("cameraPos", this.scene.activeCamera.position);
        this._viewerSphere.material.emissiveTexture = bestTexture;
        // debugger;

    }

    private _resizeWindow() {
        // Watch for browser/canvas resize events
        window.addEventListener("resize", function () {
            this._engine.resize();
        }.bind(this));
    }
}        

export function start() {
    let game = new Game({
        onJSONLoaded: function() {
            console.log("DONE!!!");
            let ef = new ExtractFrames("proteinvr_baked.mp4", BABYLON, this, function() {
                callbacksComplete.push(callBacks.VIDEO_FRAMES_LOADED);
                console.log("done");
            });
        },
        onDone: function() {}
    });
}
