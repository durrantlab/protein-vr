// function makeWebVRCamera(scene, position) {
//     // var metrics = BABYLON.VRCameraMetrics.GetDefault();
//     var camera = new BABYLON.WebVRFreeCamera(
//         "deviceOrientationCamera", 
//         position, 
//         scene /*,
//         false,  // compensate distortion
//         metrics*/
//     );
//     window.scrollTo(0, 1);  // supposed to autohide scroll bar.
//     return camera;
// }

function startLoop(engine, scene) {
    engine.runRenderLoop(function(){
        scene.render();
    });
}

// function addLight(scene) {
//     var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
//     light.intensity = .5;
// }

function createSceneFromBabylonFile(canvas, engine) {
    var scene = new BABYLON.Scene(engine);

    // BABYLON.SceneLoader.Load("", "babylon.babylon", engine, (newScene) => {
    BABYLON.SceneLoader.Append("", "babylon.babylon", scene, () => {

        // Wait for textures and shaders to be ready
        scene.executeWhenReady(() => {
            // var webVRCamera = makeWebVRCamera(scene, scene.activeCamera.position);    
            var webVRCamera = new BABYLON.WebVRFreeCamera("WebVRCamera", new BABYLON.Vector3(-0.8980848729619885, 1.1, 0.4818257550471734), scene);

            // Set the new (VR) camera to be active
            scene.activeCamera = webVRCamera;
                            
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            light.intensity = .5;
        
            scene.onPointerDown = function () {
                scene.onPointerDown = undefined;
            
                // Attach that camera to the canvas.
                scene.activeCamera.attachControl(canvas, true);  // This won't work if desktop-based vr like htc vive. So this command also run on play-button click.

                // scene.activeCamera.initControllers()
            };

            startLoop(engine, scene);
        });
    });
}

// function createSceneFromScratch(canvas, engine) {
//     window.scrollTo(0, 1);  // supposed to autohide scroll bar.

//     var scene = new BABYLON.Scene(engine);
//     var webVRCamera = makeWebVRCamera(scene, new BABYLON.Vector3(1.8756, 3.4648, 8.517));
    
//     jQuery("#renderCanvas").click(() => {
//         // Set the new (VR) camera to be active
//         scene.activeCamera = webVRCamera;
    
//         // Attach that camera to the canvas.
//         scene.activeCamera.attachControl(canvas);  // This won't work if desktop-based vr like htc vive. So this command also run on play-button click.
//     });

//     addLight(scene);
//     var box = BABYLON.Mesh.CreateBox("Box", 4.0, scene);        

//     startLoop(engine, scene);
// }

jQuery(document).ready(() => {
    var canvas = document.getElementById('renderCanvas');   
    var engine = new BABYLON.Engine(canvas, true);

    createSceneFromBabylonFile(canvas, engine);
    // createSceneFromScratch(canvas, engine);
});


