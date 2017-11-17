"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Sphere_1 = require("./Sphere");
var Globals = require("../config/Globals");
var PVRJsonSetup_1 = require("../scene/PVRJsonSetup");
var _spheres = [];
var _progressBarObj;
// export var prevViewerSphere: Sphere;
// export var nextViewerSphere: Sphere;
var _currentSphere = undefined;
function create() {
    /*
    If dependencies have loaded, creates a collection of Sphere objects. Also
    loads the assets of the appropriate spheres (all of them if no lazy
    loading, select ones otherwise).
    */
    if (Globals.delayExec(create, ["BabylonSceneLoaded", "DataJsonLoadingStarted"], "create", this)) {
        return;
    }
    // Create the sphere objects. Not that this does not load the sphere
    // meshes or textures. To do that, you must call the associated sphere
    // functions explicitly.
    var BABYLON = Globals.get("BABYLON");
    // Get the sphere data from the JSON
    var sphereData = PVRJsonSetup_1.JSONData["spheres"];
    // Make the Sphere objects, add to list.
    for (var i = 0; i < sphereData.length; i++) {
        var sphereDatum = sphereData[i];
        var pt = sphereDatum["position"];
        var position = new BABYLON.Vector3(pt[0], pt[2], pt[1]); // note that Y and Z axes are switched on purpose.
        var textureFilename = sphereDatum["material"]; // filename of the PNG file.
        var meshFilename = sphereDatum["mesh"]; // filename of mesh
        var sphere = new Sphere_1.Sphere(textureFilename, meshFilename, position);
        _spheres.push(sphere);
        // WILLIAM: IF i = 0, first sphere, so use currentSphere() as a setter
        // below. Can't do this based on opacity, because not material loaded
        // yet.
        if (i === 0) {
            currentSphere(sphere);
        }
    }
    // Start updating the loading progress bar
    var jQuery = Globals.get("jQuery");
    _progressBarObj = jQuery("#loading-progress-bar .progress-bar");
    _startUpdatingAssetLoadBar();
    // Load the appropriate viewer spheres.
    _loadRelevantAssets();
}
exports.create = create;
function _loadRelevantAssets() {
    /*
    Loads the relevant assets given the current sphere. As currently
    implemented, just loads all assets (no lazy loading).
    */
    // Here, load (and destroy?) the assets, as appropriate.
    if (Globals.get("lazyLoadViewSpheres") === false) {
        _loadAllAssets(); // simply load all assets up front
    }
    else {
        for (var i = 0; i < Globals.get("lazyLoadCount"); i++) {
            if (_currentSphere.allNeighboringSpheresOrderedByDistance()[i].associatedViewerSphere._assetsLoaded === false) {
                _currentSphere.allNeighboringSpheresOrderedByDistance()[i].associatedViewerSphere.loadAssets(); // load in that sphere's assets (mesh and material)
            }
        }
    }
}
function _loadAllAssets() {
    /*
    Load the assets of all spheres and sets the first spheres opacity to 1.0.
    So no lazy loading here.
    */
    var _loop_1 = function (i) {
        var sphere = _spheres[i];
        sphere.loadAssets(function () {
            if (i === 0) {
                sphere.opacity(1.0);
            }
        });
    };
    // Use this if you don't want to lazy load. Loads the sphere meshes
    // and textures.
    for (var i = 0; i < _spheres.length; i++) {
        _loop_1(i);
    }
}
function getByIndex(idx) {
    /*
    Given an index, return the associated sphere.

    :param number idx: The index of the desired sphere.

    :returns: An Sphere object.
    :rtype: :class:`Sphere`
    */
    return _spheres[idx];
}
exports.getByIndex = getByIndex;
function count() {
    /*
    Get the number of Sphere objects in this collection.

    :returns: The number of objects.
    :rtype: :class:`number`
    */
    return _spheres.length;
}
exports.count = count;
function hideAll() {
    /*
    Hide all spheres. Helper function.
    */
    for (var i = 0; i < _spheres.length; i++) {
        var viewerSphere = _spheres[i];
        viewerSphere.opacity(0.0);
    }
}
exports.hideAll = hideAll;
function currentSphere(val) {
    /*
    Gets or sets the current sphere, depending on whether val is defined.

    :param Sphere val: An optional parameter. If defined, the current sphere
           will be set to this one.

    :returns: Can return the current sphere, if val is defined.
    :rtype: :class:`Sphere`
    */
    if (val === void 0) { val = undefined; }
    if (val === undefined) {
        // Getter
        return _currentSphere;
    }
    else {
        // Setter
        _currentSphere = val;
    }
}
exports.currentSphere = currentSphere;
function _startUpdatingAssetLoadBar() {
    /*
    Updates the loading bar in the UI depending on the number of textures that
    have been loaded. Assuming the textures will take longer to load than
    meshes, so focusing on the bottle neck.
    */
    // Might as well put this here, since it's related to the loading of
    // sphere materials.
    var numTexturesLoaded = Globals.get("numFrameTexturesLoaded");
    var numTexturesTotal = count();
    // Updating the progress bar.
    var progressVal = Math.round(100 * numTexturesLoaded / numTexturesTotal);
    _progressBarObj.css("width", Math.min(progressVal, 100).toString() + "%");
    if ((numTexturesTotal === undefined) || (progressVal < 100)) {
        setTimeout(function () {
            _startUpdatingAssetLoadBar();
        }, 10);
    }
    else {
        var jQuery = Globals.get("jQuery");
        // Start game button now enabled. Removed this because lazy loading.
        // jQuery("#start-game").prop("disabled", false);
        // Hide material-load progress bar.
        jQuery("#loading-progress-bar").slideUp();
        // Change the loading-panel title
        jQuery("#loading-title").html("Game Loaded");
    }
}
//# sourceMappingURL=SphereCollection.js.map