define(["require", "exports", "./MaterialLoader", "./config/UserVars", "./config/SettingsPanel", "./scene/Setup", "./config/Globals", "./scene/PVRJsonSetup"], function (require, exports, MaterialLoader, UserVars, SettingsPanel, SceneSetup, Globals, PVRJsonSetup) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Globals.set("jQuery", jQuery);
    Globals.set("BABYLON", BABYLON);
    var callbacksComplete = [];
    var callBacks;
    (function (callBacks) {
        callBacks[callBacks["SCENE_READY"] = 0] = "SCENE_READY";
        callBacks[callBacks["VIDEO_FRAMES_LOADED"] = 1] = "VIDEO_FRAMES_LOADED";
        callBacks[callBacks["JSON_LOADED"] = 2] = "JSON_LOADED";
    })(callBacks || (callBacks = {}));
    class Game {
        // private _JSONData: any;
        // private _shader: any;
        // private _guideSpheres: any[] = [];
        // private _camera: Camera;
        constructor(params) {
            // setInterval(function() {console.log(this.cameraPos);}.bind(this), 100);
            // Bring in the loading panel...
            jQuery("#loading_panel").load("./_loading.html", () => {
                jQuery("#start-game").click(() => {
                    let engine = Globals.get("engine");
                    let canvas = jQuery("canvas");
                    jQuery("#loading_panel").hide(); // fadeOut(() => {
                    canvas.show();
                    canvas.focus(); // to make sure keypresses work.
                    engine.switchFullscreen(UserVars.getParam("viewer") == UserVars.viewers["Screen"]);
                    // Anti alias everything?
                    // var postProcess = new BABYLON.FxaaPostProcess("fxaa", 1.0, camera);
                    // let postProcess = new BABYLON.FxaaPostProcess("fxaa", 1.0, camera, BABYLON.Texture.BILINEAR_SAMPLINGMODE, engine, false);
                    // let engine = Globals.get("engine");
                    // let camera = Globals.get("camera");
                    // let pp = new BABYLON.BlackAndWhitePostProcess("bandw", 1.0, camera);
                    // camera.__fxaa_cookie = new BABYLON.FxaaPostProcess("fxaa", 1, camera, 2, BABYLON.Texture.TRILINEAR_SAMPLINGMODE, engine, false);
                    this._startRenderLoop();
                    engine.resize();
                    // });
                });
            });
            if (!BABYLON.Engine.isSupported()) {
                alert("ERROR: Babylon not supported!");
            }
            else {
                // Get the canvas element from our HTML above
                Globals.set("canvas", document.getElementById("renderCanvas"));
                // Deal with mobile vs. not mobile.
                let isMobile = new MobileDetect(window.navigator.userAgent);
                Globals.set("mobileDetect", isMobile);
                let cssToAdd = '<style>';
                if (isMobile.mobile()) {
                    cssToAdd = cssToAdd + `.show-if-mobile { display: inline-block; } .show-if-not-mobile { display: none; }`;
                }
                else {
                    cssToAdd = cssToAdd + `.show-if-mobile { display: none; } .show-if-not-mobile { display: inline-block; }`;
                }
                cssToAdd = cssToAdd + '</style>';
                jQuery("head").append(cssToAdd);
                // Set the engine
                this._resizeWindow();
                this._params = params;
                Globals.set("engine", new BABYLON.Engine(Globals.get("canvas"), true)); // second boolean is whether built-in smoothing will be used.
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
                    MaterialLoader.getFramePromises()
                        .then((fulfilled) => {
                        // console.log(fulfilled, "MOO");  // add promise here?
                    });
                    // In parallel, continue the JSON sestup now that the scene is
                    // loaded.
                    return PVRJsonSetup.afterSceneLoaded();
                }).then((fulfilled) => Promise.resolve("DONE: PVR Json loading finished (after scene)"));
                Promise.all([proteinVRJsonDone, allUserVarsAvailable])
                    .then((fulfilled) => Globals.get("camera").setup());
                // .then((fulfilled) => this._startRenderLoop());
                // loadBabylonFilePromiseDone.then((f) => {
                //     console.log(f)
                // })
            }
        }
        _loadScene() {
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
        _startRenderLoop() {
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
        _resizeWindow() {
            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => {
                Globals.get("engine").resize();
            });
        }
    }
    exports.Game = Game;
    function start() {
        let game = new Game({
            onJSONLoaded: function () {
                console.log("DONE!!!");
                // let ef = new ExtractFrames(() => {
                //     callbacksComplete.push(callBacks.VIDEO_FRAMES_LOADED);
                //     console.log("done");
                // });
            },
            onDone: function () { }
        });
    }
    exports.start = start;
});
