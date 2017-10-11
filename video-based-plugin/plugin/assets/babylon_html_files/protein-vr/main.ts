import * as MaterialLoader from "./sphere_material/MaterialLoader";
import * as UserVars from "./config/UserVars";
import * as SettingsPanel from "./config/SettingsPanel";
import * as SceneSetup from "./scene/Setup";
import * as Globals from "./config/Globals";
import * as PVRJsonSetup from "./scene/PVRJsonSetup";
import * as Camera from "./scene/Camera";

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
    /* 
    The main class that runs the game.
    */

    private _params: GameInterface;

    constructor(params: GameInterface) {
        /*
        The Game object constructor.

        :param obj params: The init parameters.
        */

        this._params = params;

        // Detect mobile.
        let isMobile = new MobileDetect(window.navigator.userAgent).mobile();
        isMobile = ((isMobile === null) || (isMobile === false)) ? 
            false : true;  // keep it boolean
        if (Globals.get("debug")) { isMobile = true; }
        Globals.set("isMobile", isMobile);

        if (isMobile) {
            // Show mobile_data_warning_panel if it is mobile.
            this._showDataUseWarningPanel(isMobile);
        } else {
            // Proceed with loading the game.
            this._loadGame(isMobile);
        }
    }
    
    private _loadGame(isMobile: boolean) {
        /*
        Start loading the game.

        :param bool isMobile: Whether the game is running in mobile.
        */
       
        if (!BABYLON.Engine.isSupported()) {
            alert("ERROR: Babylon not supported!");
        } else {  // Babylon is supported
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
            this._resizeWindow();  // resize canvas when browser resized.
            let engine = new BABYLON.Engine(Globals.get("canvas"), true);
            Globals.set("engine", engine);  // second boolean is whether built-in smoothing will be used.
                            
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

    private _showDataUseWarningPanel(isMobile: boolean): void {
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
                    this._loadGame(isMobile);  // Proceed with loading the game.
                })
            });
        });
    }

    private _showLoadingGamePanel() {
        /*
        Show the game-loading panel. When the game is loaded, the user can
        press the start-game button, and the render loop begins.
        */

        // Bring in the loading panel... Why is this code here first, given
        // that the settings panel is the first to appear in the UI? Because
        // we need to start loading the scene ASAP, especially if no
        // lazy-loading is specified.
        jQuery("#loading_panel").load("./_loading.html", () => {
            jQuery("#start-game").click(() => {  // Start button within loading panel pressed.
                let engine = Globals.get("engine");
                let canvas = jQuery("canvas");
                let scene = Globals.get("scene");

                // If it's an HTC vive or something, you need to attach the
                // canvas here. This is because it can only be done on user
                // interaction.
                // if (Globals.get("cameraTypeToUse") === "show-desktop-vr") {
                    // console.log("Attaching. Camera set up already?");
                    // let cameraObj = Globals.get("camera");
                    // cameraObj._setupWebVRFreeCamera();
                    // let camera = Globals.get("scene").activeCamera;
                    // camera.attachControl(canvas);
                    // console.log(cameraObj);
                // }
                
                jQuery("#loading_panel").hide(); // fadeOut(() => {
                canvas.show();
                canvas.focus();  // to make sure keypresses work.
    
                // TODO: Uncomment the below. No full screen for now to make
                // debugging easier.
                
                // engine.switchFullscreen(
                //     UserVars.getParam("viewer") == UserVars.viewers["Screen"]
                // )
                
                // Start the render loop.
                this._startRenderLoop();
                engine.resize();                
            });
        });
    }

    private _startRenderLoop(): void {
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

    private _resizeWindow(): void {
        /*
        Resize the canvas every time you resize the window.
        */

        // Watch for browser/canvas resize events
        window.addEventListener("resize", () => {
            Globals.get("engine").resize();
        });
    }
}        

export function start() {
    /*
    Make the game object and start it. This is the function that is run from
    the RequireJS entry point.
    */

    let game = new Game({
        onJSONLoaded: function() {
            console.log("DONE!!!");
        },
        onDone: function() {}
    });
}
