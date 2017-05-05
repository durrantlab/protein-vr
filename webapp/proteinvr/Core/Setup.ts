import CollisionMeshes from "../Objects/CollisionMeshes";
import Ground from "../Objects/Ground";
import Skybox from "../Objects/Skybox";
import BillboardMeshes from "../Objects/Billboard";
import * as CameraChar from "../CameraChar";
import * as Environment from "../Environment";
import * as Core from "./Core";
import * as RenderLoop from "./RenderLoop";
import * as MouseState from "./MouseState";
import * as Sound from "./Sound";
import * as UserVars from "../Settings/UserVars";

// jQuery is an external library, so declare it here to avoid Typescript
// errors.

declare var BABYLON;

var proteinVRInfo: any;

// var jQuery = PVRGlobals.jQuery;
// debugger;

// namespace Setup {
/**
A namespace to store the functions to start the engine.
*/

/* export var Ground = Ground;
export var CameraChar = CameraChar;
export var CollisionMeshes = CollisionMeshes;
export var Environment = Environment;
export var Skybox = Skybox;
export var BillboardMeshes = Billboard;
export var Utils = Utils;
export var Triggers = Triggers;
export var Timers = Timers;
*/

var setEvents;

var sceneLoadedAndReady: boolean = false;

// pass $ as an arg to utilize the jquery module from the config.ts path
export function setup(setEventsFunc?: any): void {
    /**
    Setup the BABYLON game engine.

    :param any setEvents: An externally defined function that sets
                up any events.
    :param any $: the jquery module imported via cdn in config.ts
    */

    // Save this for later... it will run after the user clicks the start
    // button.
    setEvents = setEventsFunc;

    // Effects: lens flare + most post-processing
    // barrel-distortion: separate this one out

    if (PVRGlobals.debug) {
        // from http://stackoverflow.com/questions/2604976/javascript-how-to-display-script-errors-in-a-popup-alert
        window.onerror = function(msg, url, linenumber) {
            alert('Error message: '+msg+'\nURL: '+url+'\nLine Number: '+linenumber);
            return true;
        }
    }

    // Only run the below once the whole document has loaded.
    var jQuery = PVRGlobals.jQuery;
    jQuery(document).ready(function() {
        // Get the canvas DOM element.
        PVRGlobals.canvas = document.getElementById('renderCanvas');

        // Load the 3D engine. true means antialiasing is on.
        PVRGlobals.engine = new BABYLON.Engine(PVRGlobals.canvas, true);

        // Load the user parameters
        UserVars.setup(function() {

            // Load in information re. the scene
            jQuery.ajax({
                url: UserVars.getParam("scenePath") + "proteinvr.json",
                dataType: "json"
            }).done(function(proteinVRInfoResponse) {
                proteinVRInfo = proteinVRInfoResponse;  // setting the global copy

                // I would expect that updating the version in the .manifest
                // file would prevent this, but in testing I'm not 100% it's
                // true.
                let disableCaching: boolean = true;
                let urlCacheBreakTxt: string = (disableCaching ? "?" + proteinVRInfo["file_id"] : "")

                // Load a scene from a BABYLON file.
                BABYLON.SceneLoader.Load(UserVars.getParam("scenePath"), "scene.babylon" + urlCacheBreakTxt, 
                                        PVRGlobals.engine,
                                        function (ns: any): void {


                    // Wait for textures and shaders to be ready before
                    // proceeding.
                    ns.executeWhenReady(function () {

                        // Store the scene in a variable so you can reference it
                        // later.
                        PVRGlobals.scene = ns;

                        // Setup mouse events
                        MouseState.setup();

                        if (PVRGlobals.debug === true) {
                            PVRGlobals.scene.debugLayer.show(true, PVRGlobals.scene.activeCamera);
                        }

                        // Loop through each of the objects in the scene and
                        // modify them according to the name (which is a json).

                        // PVRGlobals.scene.meshes.forEach(function(m) { // Avoid this because requires binding...
                        for (let meshIdx = 0; meshIdx < PVRGlobals.scene.meshes.length; meshIdx++) {
                            let m = PVRGlobals.scene.meshes[meshIdx];

                            //try {
                            // Convert the mesh name to a json object with
                            // information about the mesh.
                            // let jsonStr = '{"' + m.name + '"}';
                            // jsonStr = jsonStr.replace(/:/g, '":"')
                            //                  .replace(/,/g, '","');
                            // let json = JSON.parse(jsonStr);
                            // m.name = json.n;

                            // save for later reference
                            PVRGlobals.meshesByName[m.name] = m;

                            // Given the mesh, check if it should collide with
                            // the camera.
                            // new CollisionMeshes().checkMesh(m, json);

                            // Create a material if the info is available.
                            if (this.proteinVRInfo["materials"][m.name] !== undefined) {
                                let mat_inf = this.proteinVRInfo["materials"][m.name];
                                // Generate a key for this material. Doing it
                                // this way so you can reuse materials.
                                let mat_key = "";
                                let colorType: string = "color";
                                if (typeof mat_inf.color === "string") {
                                    // it's a filename
                                    mat_key += mat_inf.color;
                                    colorType = "image";
                                } else {
                                    // it's a color (RGB)
                                    mat_inf.color[0] = roundToHundredth(mat_inf.color[0]);
                                    mat_inf.color[1] = roundToHundredth(mat_inf.color[1]);
                                    mat_inf.color[2] = roundToHundredth(mat_inf.color[2]);
                                    mat_key += JSON.stringify(mat_inf.color);
                                }

                                mat_inf.glossiness = roundToHundredth(mat_inf.glossiness);
                                mat_key += " " + mat_inf.glossiness.toString();

                                // HERE DO THE SHADER LIBRARY THING TO NOT DUPLICATE EFFORTS!!!

                                var mat = new BABYLON.StandardMaterial(mat_key, PVRGlobals.scene);
                                mat.diffuseColor = new BABYLON.Color3(0, 0, 0);  // to make shadeless
                                mat.specularColor = new BABYLON.Color3(0, 0, 0);  // to make shadeless
                                mat.fogEnabled = true;

                                if (colorType === "color") {
                                    // set the diffuse colors
                                    mat.emissiveColor = new BABYLON.Color3(mat_inf.color[0], mat_inf.color[1], mat_inf.color[2]);
                                } else {  // so it's an image
                                    mat.emissiveColor = new BABYLON.Color3(0,0,0);
                                    let img_path = UserVars.getParam("scenePath") + mat_inf.color + this.urlCacheBreakTxt;
                                    mat.emissiveTexture = new BABYLON.Texture(img_path, PVRGlobals.scene);
                                }

                                // Now do glossiness
                                mat.specularColor = new BABYLON.Color3(mat_inf.glossiness, mat_inf.glossiness, mat_inf.glossiness);

                                // Add shadows
                                if (m.name !== "sky") { // sky has no shadow
                                    let nameToUse = m.name.replace(/Decimated/g, "");
                                    mat.ambientTexture = new BABYLON.Texture(UserVars.getParam("scenePath") + nameToUse + "shadow.png" + this.urlCacheBreakTxt, PVRGlobals.scene);
                                }

                                // Now add this material to the object.
                                if (m.material !== null) {
                                    m.material.dispose();
                                }

                                // mat.backFaceCulling = false;

                                m.material = mat;
                            }

                            // Make the mesh collidable
                            // m.checkCollisions = true;
                            
                            // Check if the mesh is marked as a ground mesh.
                            new Ground().checkMesh(m); //, json);

                            // Check if the mesh is marked as a skybox.
                            new Skybox().checkMesh(m); //, json);

                            // Check if the mesh is marked as a billboard
                            // mesh.
                            // new BillboardMeshes().checkMesh(m, json);
                        };

                        // Add LODs
                        // No binding needed here, so forEach ok.
                        PVRGlobals.scene.meshes.forEach(function(m) {
                            // If the name has the word "Decimated" in it,
                            // make LOD.
                            if (m.name.indexOf("Decimated") !== -1) {
                                let nameToUse = m.name.replace(/Decimated/g, "");
                                let parentMesh = PVRGlobals.meshesByName[nameToUse];
                                m.material = parentMesh.material;
                                parentMesh.addLODLevel(15, m);
                                parentMesh.addLODLevel(25, null);
                            }
                        });

                        // The below should be delayed until user is done with settings window
                        // *********


                        // Set up the system variables
                    
                        // Add cool post-processing effects that will
                        // likely degrade quickly on phones
                        // See https://doc.babylonjs.com/tutorials/using_depth-of-field_and_other_lens_effects
                        // var lensEffect = new BABYLON.LensRenderingPipeline('lens', {
                        //     edge_blur: 1.0,
                        //     chromatic_aberration: 1.0,
                        //     distortion: 1.0,
                        //     dof_focus_distance: 5,
                        //     dof_aperture: 0.8,			// set this very high for tilt-shift effect
                        //     grain_amount: 1.0,
                        //     dof_pentagon: false,
                        //     dof_gain: 0,
                        //     dof_threshold: 1.0,
                        //     dof_darken: 0.1
                        // }, PVRGlobals.scene, 1.0, PVRGlobals.scene.activeCamera);

                        sceneLoadedAndReady = true;
                    }.bind({
                        urlCacheBreakTxt: this.urlCacheBreakTxt,
                        proteinVRInfo: this.proteinVRInfo
                    }));
                }.bind({
                    urlCacheBreakTxt: urlCacheBreakTxt,
                    proteinVRInfo: proteinVRInfo
                }));
            });
        });
    });
}
// }

export function continueSetupAfterSettingsPanelClosed() {
    if (sceneLoadedAndReady === false) {
        // Try again in a second...
        setTimeout(continueSetupAfterSettingsPanelClosed, 1000);
    } else {
        // Scene has been loaded, ready to set up additional stuff...

        // PVRGlobals.engine.getCaps().maxTextureSize = 32;

        // Set up sounds
        for (let soundIdx = 0; soundIdx < proteinVRInfo["sounds"].length; soundIdx++) {
            let sound = proteinVRInfo["sounds"][soundIdx];
            let filename = sound[0];
            let loc = new BABYLON.Vector3(sound[1][0], sound[1][2], sound[1][1]);
            Sound.addSound(filename, loc);
        }


        // Set up the game character/camera.
        CameraChar.setup();

        // Set up the environment.
        Environment.setup();

        // Set up events.
        // debugger;
        setEvents();

        RenderLoop.start();
    }
}

function roundToHundredth(num: number) {
    return Math.round(num * 100) / 100;
}

// export default Setup;
