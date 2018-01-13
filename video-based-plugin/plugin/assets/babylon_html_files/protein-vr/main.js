define(["require", "exports", "./config/UserVars", "./config/SettingsPanel", "./scene/Setup", "./config/Globals", "./scene/PVRJsonSetup", "./scene/Camera/Camera", "./Spheres/SphereCollection"], function (require, exports, UserVars, SettingsPanel, SceneSetup, Globals, PVRJsonSetup, Camera, SphereCollection) {
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
            The Game object constructor.
    
            :param obj params: The init parameters.
            */
            this._params = params;
            // Detect mobile.
            let isMobile = new MobileDetect(window.navigator.userAgent).mobile();
            isMobile = ((isMobile === null) || (isMobile === false)) ?
                false : true; // keep it boolean
            if (Globals.get("debug")) {
                isMobile = true;
            }
            Globals.set("isMobile", isMobile);
            if (isMobile) {
                // Show mobile_data_warning_panel if it is mobile.
                this._showDataUseWarningPanel(isMobile);
            }
            else {
                // Proceed with loading the game.
                this._loadGame(isMobile);
            }
        }
        _loadGame(isMobile) {
            /*
            Start loading the game.
    
            :param bool isMobile: Whether the game is running in mobile.
            */
            if (!BABYLON.Engine.isSupported()) {
                alert("ERROR: Babylon not supported!");
            }
            else {
                // Bring in the loading panel... Why is this code here first,
                // given that the settings panel is the first to appear in the UI?
                // Because we need to start loading the scene ASAP, especially if
                // no lazy-loading is specified. Note that the loading panel is
                // always hidden by default, so all this happens without the
                // user's knowledge.
                this._showLoadingGamePanel();
                // Get the canvas element from our HTML above
                Globals.set("canvas", document.getElementById("renderCanvas"));
                // Set the engine
                this._resizeWindow(); // resize canvas when browser resized.
                let engine = new BABYLON.Engine(Globals.get("canvas"), true);
                Globals.set("engine", engine); // second boolean is whether built-in smoothing will be used.
                // Note that these functions are all "smart" in that they won't
                // run unless previous milestones are met. I thought this was
                // better than callbacks, and using promises got ackward too.
                // Tricky when you have so many interdependencies.
                // Collect user variables (default and specified)
                UserVars.setupDefaults();
                SettingsPanel.allowUserToModifySettings();
                // Load babylon file and set up scene.
                SceneSetup.loadBabylonFile();
                // Load proteinVR-specific json file, in two parts because certain
                // dependencies required for second half but not first.
                PVRJsonSetup.loadJSON();
                PVRJsonSetup.afterSceneLoaded();
                // Create the sphere objects (but doesn't necessarily load
                // textures and meshes).
                SphereCollection.create();
                // Set up the camera.
                Camera.setup();
            }
        }
        _showDataUseWarningPanel(isMobile) {
            /*
            Show mobile_data_warning_panel.
    
            :param bool isMobile: Whether the game is running in mobile.
            */
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
                        this._loadGame(isMobile); // Proceed with loading the game.
                    });
                });
            });
        }
        _showLoadingGamePanel() {
            /*
            Show the game-loading panel. When the game is loaded, the user can
            press the start-game button, and the render loop begins.
            */
            // Bring in the loading panel... Why is this code here first, given
            // that the settings panel is the first to appear in the UI? Because
            // we need to start loading the scene ASAP, especially if no
            // lazy-loading is specified.
            jQuery("#loading_panel").load("./_loading.html", () => {
                jQuery("#start-game").click(() => {
                    let engine = Globals.get("engine");
                    let canvas = jQuery("canvas");
                    let scene = Globals.get("scene");
                    jQuery("#loading_panel").hide(); // fadeOut(() => {
                    canvas.show();
                    canvas.focus(); // to make sure keypresses work.
                    // TODO: Uncomment the below. No full screen for now to make
                    // debugging easier.
                    engine.switchFullscreen(UserVars.getParam("viewer") === UserVars.viewers["Screen"]);
                    // Start the render loop.
                    this._startRenderLoop();
                    engine.resize();
                });
            });
        }
        _startRenderLoop() {
            /*
            Start the function that runs with every frame.
            */
            // Once the scene is loaded, just register a render loop to render it
            // let camera = Globals.get("camera");
            let scene = Globals.get("scene");
            let meshesWithAnimations = Globals.get("meshesWithAnimations");
            Globals.get("engine").runRenderLoop(() => {
                // Update the positions of any animations.
                for (let i = 0; i < meshesWithAnimations.length; i++) {
                    meshesWithAnimations[i].PVRAnimation.updatePos();
                }
                Camera.update();
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
        Make the game object and start it. This is the function that is run from
        the RequireJS entry point.
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
