// Let Typescript know there is a global variable called BABYLON
declare var BABYLON;
declare var html2canvas;
declare var jQuery;

function html_texture(planeMesh, url) {
    // Use jQuery to add a div to the document body, with id "html_rendered".
    // Width and height = 350px.

    // Use jQuery.ajax or jQuery.get to place the contents of the webpage at
    // url into that div. url in this test case will be test.html (see below,
    // where this function is called).

    // Save the div to an image on a canvas. This part is already working.
    html2canvas(jQuery("#html_rendered"), {
        onrendered: function(canvas) {
            // The canvas contains the rendered html.

            // Get the planeMesh.
            let planeMesh = this;

            // Make the canvas into a BABYLON texture.
            // See http://www.html5gamedevs.com/topic/9590-textures-from-canvas/

            // Apply that texture to the plane. Remember the plane is planeMesh.

            // Delete the original div ("#html_rendered") to clean up.
        }.bind(planeMesh)
    });
}

// Cara, don't change this function.
function createScene() {
    // Where to render the scene?
    var canvas = document.getElementById('renderCanvas');

    // Load the engine
    var engine = new BABYLON.Engine(canvas, true);

    // This creates a basic Babylon Scene object (non-mesh)
    var scene = new BABYLON.Scene(engine);

    // This creates and positions a free camera (non-mesh)
    var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

    // This targets the camera to scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // This attaches the camera to the canvas
    camera.attachControl(canvas, true);

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

    // Default intensity is 1. Let's dim the light a small amount
    light.intensity = 0.7;

    // Add a plane
    var plane = BABYLON.Mesh.CreatePlane("plane", 5.0, scene, false, BABYLON.Mesh.DEFAULTSIDE);

    // Add html to that plane
    html_texture(plane, "test.html");

    // Start the render loop
    engine.runRenderLoop(function() {
        scene.render();
    });

    // Let the engine know if you resize the window.
    window.addEventListener('resize', function() {
        engine.resize();
    });

    return scene;
}

// Create the scene
createScene();

