var createScene = function () {
    // Playground needs to return at least an empty scene and default camera
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.Camera("camera1", BABYLON.Vector3.Zero(), scene);

    // Async call
    BABYLON.SceneLoader.Append("https://www.babylonjs.com/scenes/sponza/",
    "sponza.babylon", scene, function () {


    // BABYLON.SceneLoader.Append("https://durrantlab.com/tmp/babylon_test/",
    //     "babylon.babylon", scene, function () {
            // The main file has been loaded but let's wait for all ressources
            // to be ready (textures, etc.)
            scene.executeWhenReady(function () {
                // Setting the camera position at the center of the scene
                if (navigator.getVRDisplays) {
                    camera = new BABYLON.WebVRFreeCamera("WebVRCamera",
                        new BABYLON.Vector3(-0.8980848729619885, 1.1, 0.4818257550471734), scene);
                }
                else {
                    camera = new BABYLON.VRDeviceOrientationFreeCamera("VRDeviceOrientation",
                        new BABYLON.Vector3(-0.8980848729619885, 2, 0.4818257550471734), scene);
                }

                scene.activeCamera = camera;
                // When you're clicking or touching the rendering canvas on the right
                scene.onPointerDown = function () {
                    scene.onPointerDown = undefined;
                    // Taking the default camera and using the embedded services
                    // In this case: moving using touch, gamepad or mouse/keyboard
                    scene.activeCamera.attachControl(canvas, true);
                };
            });
        });

    return scene;
};

var canvas = document.getElementById('renderCanvas');   
var engine = new BABYLON.Engine(canvas, true);

jQuery(document).ready(() => {
    var scene = createScene();

    engine.runRenderLoop(function(){
        scene.render();
    });

});
