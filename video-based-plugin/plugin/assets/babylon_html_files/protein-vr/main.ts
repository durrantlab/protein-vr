import * as MaterialLoader from "./MaterialLoader";
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
    private _params: GameInterface;
    constructor(params: GameInterface) {
        this._params = params;

        let isMobile = new MobileDetect(window.navigator.userAgent).mobile();
        if (isMobile === null) { isMobile = false; }  // keep it boolean
        if (Globals.get("debug")) { isMobile = true; }
        Globals.set("isMobile", isMobile);

        // Bring in mobile_data_warning_panel
        if (isMobile) {
            jQuery("#mobile_data_warning_panel").load("./_filesize_warning.html", () => {
                // Hide the settings panel for now
                jQuery("#settings_panel").hide();

                // Get the size of all the mobile-compatible png files.
                jQuery.get("./frames/filesizes.json", (filesizes) => {
                    jQuery("#filesize-total").html((filesizes["small"] / 1000000).toFixed(1));
                });

                // Make the ok-to-proceed button work.
                jQuery("#filesize-warning-button").click(() => {
                    jQuery("#mobile_data_warning_panel").fadeOut(() => {
                        jQuery("#settings_panel").fadeIn();
                        this._loadGame(isMobile);
                    })
                });
            });
        } else {
            this._loadGame(isMobile);
        }
    }
    
    private _loadGame(isMobile) {
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
            })
        });

        if (!BABYLON.Engine.isSupported()) {
            alert("ERROR: Babylon not supported!");
        } else {  // Babylon is supported
            // Get the canvas element from our HTML above
            Globals.set("canvas", document.getElementById("renderCanvas"));

            // Set the engine
            this._resizeWindow();
            Globals.set("engine", new BABYLON.Engine(Globals.get("canvas"), true));  // second boolean is whether built-in smoothing will be used.

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

    private _startRenderLoop() {
        // Once the scene is loaded, just register a render loop to render it
        let camera = Globals.get("camera");
        let scene = Globals.get("scene");

        Globals.get("engine").runRenderLoop(() => {
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
        },
        onDone: function() {}
    });
}
