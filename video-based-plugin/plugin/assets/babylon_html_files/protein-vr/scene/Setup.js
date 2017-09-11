define(["require", "exports", "./Camera", "../config/Globals", "../config/Globals", "../shaders/StandardShader"], function (require, exports, Camera_1, Globals, Globals_1, StandardShader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function loadBabylonFile() {
        return new Promise((resolve) => {
            BABYLON.SceneLoader.Load("", "babylon.babylon", Globals.get("engine"), (newScene) => {
                Globals.set("scene", newScene);
                window.scrollTo(0, 1); // supposed to autohide scroll bar.
                // this._canvas.addEventListener("click", function() {
                //     this.engine.switchFullscreen(true);
                // }.bind(this));
                // Wait for textures and shaders to be ready
                newScene.executeWhenReady(() => {
                    let camera = new Camera_1.Camera();
                    Globals.set("camera", camera);
                    let radius = 12; // When using VR, this needs to be farther away that what it was rendered at. this._JSONData["viewerSphereSize"];
                    // Setup viewer sphere template
                    _setupViewerSphereTemplate(newScene, radius);
                    // Set up environmental (background) sphere
                    _setupEnvironmentalSphere(newScene, radius);
                    // Delay textures until needed. Cool, but too slow for our purposes here...
                    // newScene.useDelayedTextureLoading = true
                    if (Globals.get("debug")) {
                        newScene.debugLayer.show();
                    }
                    resolve({ msg: "BABYLON.BABYLON LOADED" });
                });
            });
        });
    }
    exports.loadBabylonFile = loadBabylonFile;
    function _setupViewerSphereTemplate(newScene, radius) {
        // Identify viewer sphere template
        let viewerSphereTemplate;
        for (let t = 0; t < newScene.meshes.length; t++) {
            if (newScene.meshes[t].name.indexOf("ProteinVR_ViewerSphere") !== -1) {
                viewerSphereTemplate = newScene.meshes[t];
            }
        }
        viewerSphereTemplate.scaling = new BABYLON.Vector3(radius, radius, -radius);
        viewerSphereTemplate.isPickable = false;
        viewerSphereTemplate.renderingGroupId = Globals_1.RenderingGroups.ViewerSphere;
        viewerSphereTemplate.rotation.y = 4.908738521234052; // To align export with scene. 281.25 degrees = 25/32*360
        Globals.set("viewerSphereTemplate", viewerSphereTemplate);
    }
    function _setupEnvironmentalSphere(newScene, radius) {
        let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
        let backgroundSphere = viewerSphereTemplate.clone("backgroundSphere");
        let slightlyBiggerRadius = radius * 1.05;
        backgroundSphere.scaling = new BABYLON.Vector3(slightlyBiggerRadius, slightlyBiggerRadius, -slightlyBiggerRadius);
        backgroundSphere.rotation.y = 4.908738521234052; // To align export with scene. 281.25 degrees = 25/32*360
        backgroundSphere.isPickable = false;
        backgroundSphere.renderingGroupId = Globals_1.RenderingGroups.EnvironmentalSphere;
        let shader2 = new StandardShader_1.Shader('environment.png', false);
        backgroundSphere.material = shader2.material;
        Globals.set("backgroundSphere", backgroundSphere);
    }
});
