import { ExtractFrames } from "./VideoFrames";
import { Shader } from "./StandardShader";

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

    public cameraPositionsAndTextures: any;

    private _viewerSphere: any;

    private _timeOfLastClick: number = new Date().getTime();  // A refractory period

    private _sphereVideo: any;

    private _params: GameInterface;

    private _JSONData: any;

    private _shader: any;

    constructor(params: GameInterface) {

        // setInterval(function() {console.log(this.cameraPos);}.bind(this), 100);
        
        
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
                this._setupFromJSON(function() {
                    this._setupVideoSphere();
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
        
        // let mat = new BABYLON.StandardMaterial("mat", this.scene);

        this._shader = new Shader(this.scene, BABYLON);

        // this._shader.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
        // this._shader.material.specularColor = new BABYLON.Color3(0, 0, 0);
        // this._shader.material.diffuseTexture = null;
        // this._shader.material.backFaceCulling = false;
        // this._shader.material.emissiveTexture = null; // videoTexture;
        
        this._viewerSphere.material = this._shader.material;
        this._viewerSphere.isPickable = false;

        // Resize the viewer sphere
        let radius = this._JSONData["viewer_sphere_size"];
        this._viewerSphere.scaling = new BABYLON.Vector3(radius, radius, radius);

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
            
            This._JSONData = data;

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
            This.cameraPositionsAndTextures = []
            for (let i=0; i<data["cameraPositionsAndTextures"].length; i++) {
                let pt = data["cameraPositionsAndTextures"][i];
                // let frame = pt[0];
                let v = new BABYLON.Vector3(pt[0], pt[2], pt[1]);  // note that Y and Z axes are switched on purpose.
                This.cameraPositionsAndTextures.push([v, null]);  // null is texture, populated later.
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
        
        // Calculate distances to all camera positions
        let cameraLoc = this.scene.activeCamera.position;
        let distData = [];
        for (let i=0; i<this.cameraPositionsAndTextures.length; i++) {
            let cameraPos = this.cameraPositionsAndTextures[i];
            let pos = cameraPos[0].clone();
            let tex = cameraPos[1];
            let dist = pos.subtract(cameraLoc).length();
            distData.push([dist, pos, tex]);
            // if dist = 0 temrinate early?
        }

        // Sort by distance
        let kf = function(a, b) {
            a = a[0];
            b = b[0];

            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        }
        distData.sort(kf);

        let tex1 = distData[0][2];
        // let tex2 = distData[1][1][2];
        // let tex3 = distData[2][1][2];

        let dist1 = distData[0][0];
        // let dist2 = distData[1][0];
        // let dist3 = distData[2][0];

        let bestDist = dist1;
        let bestPos = distData[0][1];

        // console.log(tex1, dist1, bestPos);

        // Move camera to best frame.
        // let maxDistAllowed = 0.1 * this._JSONData["viewer_sphere_size"];
        // if (bestDist > maxDistAllowed) {
        //     let vec = this.scene.activeCamera.position.subtract(bestPos).normalize().scale(maxDistAllowed);
        //     // console.log(vec);
        //     this.scene.activeCamera.position = bestPos.add(vec);
        // }
        this.scene.activeCamera.position = bestPos;

        // Move sphere
        this._viewerSphere.position = bestPos;

        // Update texture
        // console.log("bestFrame", bestFrame)
        // console.log("bestPos", bestPos);
        // console.log("cameraPos", this.scene.activeCamera.position);
        this._shader.setTextures(tex1); //, tex2, tex3, dist1, dist2, dist3);
        // this._viewerSphere.material.emissiveTexture = bestTexture;
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
