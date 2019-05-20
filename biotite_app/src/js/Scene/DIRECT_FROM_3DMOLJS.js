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

function betweenbookends(bookend1, bookend2, str) {
    // Find the text between two bookends.
    str = str.split(bookend1, 2);
    str = str[1].split(bookend2,2);
    str = str[0];
    return str
}

function strToCoors(str) {
    // Convert coordinates in string form to arrays.
    return str.split(",").map(s => {
        s = s.replace(/\n/g, "").replace(/^ +/gm, "");
        return s.split(" ").map(s => parseFloat(s));
    });
}

function makeBabylon(vrmlStr, scene) {
    // Get the coordinates.
    let coors = strToCoors(betweenbookends("point [", "]", vrmlStr));
    // HOW TO CONVERT TO BABYLON.JS's LEFT-HANDED COORDINATE SYSTEM???
    coors = coors.map(c => {
        return rightHandedToLeftHanded(c[0], c[1], c[2]);
        // return [c[0], c[1], c[2]];
        // return [c[1], c[0], c[2]];
        // return [c[2], c[1], c[0]];
        // return [c[0], c[2], c[1]];
    })
    lastVertex = coors[0];  // Get the last vertex
    coors = coors.flat();

    // Get the normals
    let norms = strToCoors(betweenbookends("vector [", "]", vrmlStr));
    norms = norms.flat();

    // Get the colors
    let colors = strToCoors(betweenbookends("color [", "]", vrmlStr));
    colors = colors.map(c => [c[0], c[1], c[2], 1]);
    colors = colors.flat();

    // Get the indexes of the triangles
    let trisIdxStr = betweenbookends("coordIndex [", "]", vrmlStr);
    // console.log(trisIdxStr);
    let trisIdxs = trisIdxStr.split(",").map(s => parseInt(s, 10)).filter(s => (s !== -1) && (s !== NaN));

    // Compile all that into vertex data.
    var vertexData = new BABYLON.VertexData();
    vertexData.positions = coors;
    vertexData.indices = trisIdxs;
    vertexData.normals = norms;
    vertexData.colors = colors;

    // console.log("positions", vertexData.positions);
    // console.log("indices", vertexData.indices);
    // console.log("normals", vertexData.normals);
    // console.log("colors", vertexData.colors);

    // Make a mesh
    var customMesh = new BABYLON.Mesh("custom", scene);
    vertexData.applyToMesh(customMesh);

    // Add a material.
    var mat = new BABYLON.StandardMaterial("Material", scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    // mat.sideOrientation = BABYLON.Mesh.FRONTSIDE;
    mat.sideOrientation = BABYLON.Mesh.BACKSIDE;
    customMesh.material = mat;
}

// The vrml data.
function getVRMLData(scene) {
    // Add a container for 3dmoljs
    if (jQuery("#container-01").length === 0) {
        jQuery('body').append(`<div
            id="container-01"
            class="mol-container"
            style="display:none;"></div>`);
    }

    // Load 3DMoljs
    try {
        $.getScript("https://3Dmol.csb.pitt.edu/build/3Dmol-min.js", ( data, textStatus, jqxhr ) => {
            after3DMolJsLoaded();
        });
    } catch(err) {
        after3DMolJsLoaded();
    }
}

function after3DMolJsLoaded() {
    // Load in the molecule
    if (window.viewer === undefined) {
        let element = $('#container-01');
        let config = { backgroundColor: 'white' };
        window.viewer = $3Dmol.createViewer( element, config );
    }

    let pdbUri = 'https://files.rcsb.org/view/1XDN.pdb';
    jQuery.ajax( pdbUri, {
        success: (data) => {
            // Setup the visualization
            let v = window.viewer;
            v.addModel( data, "pdb" );
            v.setStyle({}, {cartoon: {color: 'spectrum'}});
            v.zoomTo();
            v.render();
            v.zoom(1.2, 1000);

            // Make the VRML string from that model.
            let vrmlStr = v.exportVRML();

            // Transfer that vrml to babylonjs
            makeBabylon(vrmlStr, scene);

            // Target the camera to one of the vertexes of the mesh
            scene.activeCamera.setTarget(new BABYLON.Vector3(lastVertex[0], lastVertex[1], lastVertex[2]));
        },
        error: (hdr, status, err) => {
            console.error( "Failed to load PDB " + pdbUri + ": " + err );
        },
    });
}

function rightHandedToLeftHanded(x, y, z) {
    // Not 100% sure this works, but I think it might...

    // return [x, y, z];
    // return [y, x, z];
    return [z, y, x];  // This one
    // return [x, z, y];
}
