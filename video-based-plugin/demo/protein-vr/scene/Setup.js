// Sets up the scene.
define(["require", "exports", "./Camera", "../config/Globals", "../config/Globals", "../sphere_material/SphereMaterial", "./Arrows", "./Sign"], function (require, exports, Camera_1, Globals, Globals_1, SphereMaterial_1, Arrows, Sign_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadBabylonFile() {
        /*
        Loads and sets up the main scene.
    
        :returns: A promise to load and set  up the scene.
        :rtype: :class:`Promise<any>`
        */
        return new Promise((resolve) => {
            var engine = Globals.get("engine");
            var scene = new BABYLON.Scene(engine);
            Globals.set("scene", scene);
            BABYLON.SceneLoader.Append("", "babylon.babylon", scene, () => {
                window.scrollTo(0, 1); // supposed to autohide scroll bar.
                // Wait for textures and materials to be ready
                scene.executeWhenReady(() => {
                    let camera = new Camera_1.Camera();
                    Globals.set("camera", camera);
                    // Delay textures until needed. Cool, but too slow for our
                    // purposes here... Keep it commented out for now.
                    // newScene.useDelayedTextureLoading = true
                    // Setup viewer sphere template
                    let radius = 12; // When using VR, this needs to be farther away that what it was rendered at. this._JSONData["viewerSphereSize"];
                    _setupViewerSphereTemplate(scene, radius);
                    // Set up environmental (background) sphere
                    _setupEnvironmentalSphere(radius);
                    // Setup arrows
                    Arrows.setup();
                    // Setup signs
                    Sign_1.setupAllSigns();
                    // window.debugit = scene.debugLayer;
                    // scene.debugLayer.show();
                    if (Globals.get("debug")) {
                        scene.debugLayer.show();
                    }
                    resolve({ msg: "BABYLON.BABYLON LOADED" });
                });
            });
        });
    }
    exports.loadBabylonFile = loadBabylonFile;
    function getMeshThatContainsStr(str, scene) {
        /*
        Gets the first mesh with a name that contains the given substring.
    
        :param string str: The substring.
    
        :param ??? scene: The BABYLON scene.
    
        :returns: The first mesh.
        :rtype: :class:`???`
        */
        // Identify viewer sphere template
        let theMesh;
        for (let t = 0; t < scene.meshes.length; t++) {
            if (scene.meshes[t].name.indexOf(str) !== -1) {
                theMesh = scene.meshes[t];
                break;
            }
        }
        return theMesh;
    }
    exports.getMeshThatContainsStr = getMeshThatContainsStr;
    function _setupViewerSphereTemplate(scene, radius) {
        /*
        Sets up the initial viewer sphere. This will be cloned for each valid
        camera location in the scene.
    
        :param ??? scene: The BABYLON scene.
    
        :param number radius: The size of the viewer sphere.
        */
        // Identify viewer sphere template
        let viewerSphereTemplate = getMeshThatContainsStr("ProteinVR_ViewerSphere", scene);
        viewerSphereTemplate.scaling = new BABYLON.Vector3(radius, radius, -radius);
        viewerSphereTemplate.isPickable = false;
        viewerSphereTemplate.renderingGroupId = Globals_1.RenderingGroups.ViewerSphere;
        viewerSphereTemplate.rotation.y = 4.908738521234052; // To align export with scene. 281.25 degrees = 25/32*360
        Globals.set("viewerSphereTemplate", viewerSphereTemplate);
    }
    function _setupEnvironmentalSphere(radius) {
        /*
        Sets up the environmental sphere (unchanging depending on position). Note
        that Alex's blender plugin uses a different nomenclature. You should
        standardize these names.
    
        :param number radius: The size of the environmenal sphere.
        */
        let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
        let backgroundSphere = viewerSphereTemplate.clone("backgroundSphere");
        let slightlyBiggerRadius = radius * 1.05;
        backgroundSphere.scaling = new BABYLON.Vector3(slightlyBiggerRadius, slightlyBiggerRadius, -slightlyBiggerRadius);
        backgroundSphere.rotation.y = 4.908738521234052; // To align export with scene. 281.25 degrees = 25/32*360
        backgroundSphere.isPickable = false;
        backgroundSphere.renderingGroupId = Globals_1.RenderingGroups.EnvironmentalSphere;
        let sphereMaterial2 = new SphereMaterial_1.SphereMaterial('environment.png', false, () => {
            backgroundSphere.material = sphereMaterial2.material;
            Globals.set("backgroundSphere", backgroundSphere);
        });
    }
});