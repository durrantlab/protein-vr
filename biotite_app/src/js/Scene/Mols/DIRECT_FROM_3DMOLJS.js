let lastVertex;

var createScene = function () {
    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    let coor = rightHandedToLeftHanded(40.38365936279297, 19.26494026184082, 16.426000595092773);
    camera.setTarget(new BABYLON.Vector3(coor[0], coor[1], coor[2]));

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // scene.useRightHandedSystem = true;

    let vrHelper = scene.createDefaultVRExperience();

    getVRMLData(scene);

    return scene;
ˆ
};
