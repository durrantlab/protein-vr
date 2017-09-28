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
        constructor(params) {
            /*
            The Game objecy constructor.
    
            :param obj params: The init parameters.
            */
            this._params = params;
            // Detect mobile.
            let isMobile = new MobileDetect(window.navigator.userAgent).mobile();
            if (isMobile === null) {
                isMobile = false;
            } // keep it boolean
            else {
                isMobile = true;
            }
            if (Globals.get("debug")) {
                isMobile = true;
            }
            Globals.set("isMobile", isMobile);
            // Bring in mobile_data_warning_panel
            if (isMobile) {
                jQuery("#mobile_data_warning_panel").load("./_filesize_warning.html", () => {
                    // Hide the settings panel for now
                    jQuery("#settings_panel").hide();
                    // Get the size of all the mobile-compatible png files.
                    jQuery.get("frames/filesizes.json", (filesizes) => {
                        jQuery("#filesize-total").html((filesizes["small"] / 1000000).toFixed(1));
                    });
                    // Make the ok-to-proceed button work.
                    jQuery("#filesize-warning-button").click(() => {
                        jQuery("#mobile_data_warning_panel").fadeOut(() => {
                            jQuery("#settings_panel").fadeIn();
                            this._loadGame(isMobile);
                        });
                    });
                });
            }
            else {
                this._loadGame(isMobile);
            }
        }
        _loadGame(isMobile) {
            /*
            Start loading the game.
    
            :param bool isMobile: Whether or not the game is running in mobile.
            */
            // Bring in the loading panel... Code below associtated with second
            // panel, but first here to start loading ASAP.
            jQuery("#loading_panel").load("./_loading.html", () => {
                jQuery("#start-game").click(() => {
                    let engine = Globals.get("engine");
                    let canvas = jQuery("canvas");
                    jQuery("#loading_panel").hide(); // fadeOut(() => {
                    canvas.show();
                    canvas.focus(); // to make sure keypresses work.
                    engine.switchFullscreen(UserVars.getParam("viewer") == UserVars.viewers["Screen"]);
                    // If it's an HTC vive or something, you need to attach the
                    // canvas here. This is because it can only be done on user
                    // interaction.
                    if (Globals.get("cameraTypeToUse") === "show-desktop-vr") {
                        Globals.get("scene").activeCamera.attachControl(canvas);
                    }
                    this._startRenderLoop();
                    engine.resize();
                });
            });
            if (!BABYLON.Engine.isSupported()) {
                alert("ERROR: Babylon not supported!");
            }
            else {
                // NOTE: This is what user sees first.
                // Get the canvas element from our HTML above
                Globals.set("canvas", document.getElementById("renderCanvas"));
                // Set the engine
                this._resizeWindow(); // resize canvas when browser resized.
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
        _startRenderLoop() {
            /*
            Start the function that runs with every frame.
            */
            // Once the scene is loaded, just register a render loop to render it
            let camera = Globals.get("camera");
            let scene = Globals.get("scene");
            Globals.get("engine").runRenderLoop(() => {
                camera.update();
                scene.render();
            });
        }
        _resizeWindow() {
            /*
            Resize the canvas every time you resize the window.
            */
            // Watch for browser/canvas resize events
            window.addEventListener("resize", () => {
                Globals.get("engine").resize();
            });
        }
    }
    exports.Game = Game;
    function start() {
        /*
        Make the game object and start it.
        */
        let game = new Game({
            onJSONLoaded: function () {
                console.log("DONE!!!");
            },
            onDone: function () { }
        });
    }
    exports.start = start;
});
