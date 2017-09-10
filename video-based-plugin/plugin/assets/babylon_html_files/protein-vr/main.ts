import * as VideoFrames from "./VideoFrames";
// import * as SettingsPanel from "./SettingsPanel";
import * as UserVars from "./config/UserVars";
import * as SettingsPanel from "./config/SettingsPanel";
import * as SceneSetup from "./scene/Setup";
import * as Globals from "./config/Globals";
import * as PVRJsonSetup from "./scene/PVRJsonSetup";

declare var BABYLON;
declare var jQuery;
declare var MobileDetect;

Globals.set("jQuery", jQuery);
Globals.set("BABYLON", BABYLON);

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
    // Load the BABYLON 3D engine. Variable here because defined within
    // isSupported below.
    // public engine: any;

    // public scene: any;

    // public cameraPositionsAndTextures: any;

    // private _viewerSphere: any;

    // private _sphereVideo: any;

    private _params: GameInterface;

    // private _JSONData: any;

    // private _shader: any;

    // private _guideSpheres: any[] = [];

    // private _camera: Camera;

    constructor(params: GameInterface) {
        // setInterval(function() {console.log(this.cameraPos);}.bind(this), 100);

        // Bring in the loading panel...
        jQuery("#loading_panel").load("./_loading.html", () => {
            jQuery("#start-game").click(() => {
                let engine = Globals.get("engine");
                let canvas = jQuery("canvas");
                jQuery("#loading_panel").hide(); // fadeOut(() => {
                canvas.show();
                canvas.focus();  // to make sure keypresses work.

                engine.switchFullscreen(
                    UserVars.getParam("viewer") == UserVars.viewers["Screen"]
                )
                
                this._startRenderLoop();
                engine.resize();
                // });

            })
        });
        
        if (!BABYLON.Engine.isSupported()) {
            alert("ERROR: Babylon not supported!");
        } else {  // Babylon is supported
            // Get the canvas element from our HTML above
            Globals.set("canvas", document.getElementById("renderCanvas"));
            Globals.set("mobileDetect", new MobileDetect(window.navigator.userAgent));

            // Set the engine
            this._resizeWindow();
            this._params = params;
            Globals.set("engine", new BABYLON.Engine(Globals.get("canvas"), true));

            // Use promise to load user variables (both from json and
            // specified via panel.)
            // UserVars.setup => SettingsPanel.allowUserToModifySettings

            // Collect user-variable promises
            // UserVars.setup => SettingsPanel.allowUserToModifySettings
            let allUserVarsAvailable = UserVars.setup()
            .then((fulfilled) => SettingsPanel.allowUserToModifySettings())
            .then((fulfilled) => Promise.resolve("DONE: Have all user variables"));

            // Load babylon file and set up scene.
            // SceneSetup.loadBabylonFile
            let sceneCreated = SceneSetup.loadBabylonFile()
            .then((fulfilled) => Promise.resolve("DONE: Scene created, babylon file loaded"));

            // Load proteinVR-specific json file
            // PVRJsonSetup.loadJSON
            let PVRJsonLoadingStarted = PVRJsonSetup.loadJSON()
            .then((fulfilled) => Promise.resolve("DONE: PVR json loading started"));

            // Babylon file and PVR Json loaded? Position guidespheres and
            // make some meshes clickable.
            // SceneSetup.loadBabylonFile + PVRJsonSetup.loadJSON => PVRJsonSetup.afterSceneLoaded
            let proteinVRJsonDone = Promise.all([sceneCreated, PVRJsonLoadingStarted])
            .then((fulfilled) => {
                // Start loading the frames here... no need to resolve it
                VideoFrames.getFramePromises()
                .then((fulfilled) => {
                    console.log(fulfilled, "MOO");  // add promise here?
                })
                
                // In parallel, continue the JSON sestup now that the scene is
                // loaded.
                return PVRJsonSetup.afterSceneLoaded();
            }).then((fulfilled) => Promise.resolve("DONE: PVR Json loading finished (after scene)"));

            Promise.all([proteinVRJsonDone, allUserVarsAvailable])
            .then((fulfilled) => Globals.get("camera").setup())
            // .then((fulfilled) => this._startRenderLoop());

            // loadBabylonFilePromiseDone.then((f) => {
            //     console.log(f)
            // })
        }
    }

    private _loadScene() {

        /* { 
            onSettingsPanelShown: () => {
                BABYLON.SceneLoader.Load("", "babylon.babylon", this.engine, (scene) => {
                    this.scene = scene;
        
                    window.scrollTo(0,1);  // supposed to autohide scroll bar.
        
                    // this._canvas.addEventListener("click", function() {
                    //     this.engine.switchFullscreen(true);
                    // }.bind(this));
        
                    // Wait for textures and shaders to be ready
                    this.scene.executeWhenReady(() => {
                        * this._camera = new Camera(this, BABYLON);
                        // this._camera.setup();
                        * this._setupFromJSON(function() {
                        *    this._setupVideoSphere();
                        *}.bind(this))
                        ? this._params.onDone();
                        ? callbacksComplete.push(callBacks.SCENE_READY);
        
                        // this.scene.debugLayer.show();
                    })
                },
                function (progress) {
                    // To do: give progress feedback to user
                });
            },
            onSettingsPanelClosed: () => {
                * this._camera.setup();
                this._startRenderLoop();
            }, 
            engine: this.engine,
            jQuery: jQuery
        }); */




        // UserVars.setup();
    }
    
    private _startRenderLoop() {
        // Once the scene is loaded, just register a render loop to render it
        let camera = Globals.get("camera");
        let scene = Globals.get("scene");

        Globals.get("engine").runRenderLoop(() => {
            // let x = Math.round(this.scene.activeCamera.position.x * 100) / 100;
            // let y = Math.round(this.scene.activeCamera.position.y * 100) / 100;
            // let z = Math.round(this.scene.activeCamera.position.z * 100) / 100;
            // console.log(bestFrame, x, y, z);
            // console.log(x, y, z);

            camera.update();
            scene.render();
        });
    }

    private _resizeWindow() {
        // Watch for browser/canvas resize events
        window.addEventListener("resize", () => {
            Globals.get("engine").resize();
        });
    }
}        

export function start() {
    let game = new Game({
        onJSONLoaded: function() {
            console.log("DONE!!!");
            // let ef = new ExtractFrames(() => {
            //     callbacksComplete.push(callBacks.VIDEO_FRAMES_LOADED);
            //     console.log("done");
            // });
        },
        onDone: function() {}
    });
}
