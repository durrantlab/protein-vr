import { Sphere } from "./Sphere";
import * as Globals from "../config/Globals";
import { JSONData } from "../scene/PVRJsonSetup";

var _spheres: Sphere[] = [];
var _progressBarObj;

// export var prevViewerSphere: Sphere;
// export var nextViewerSphere: Sphere;

var _currentSphere: Sphere = undefined;
export var setCurrentSphereVar = (val: Sphere) => { _currentSphere = val; }

var _timeOfLastMove: number = 0;
export var setTimeOfLastMoveVar = () => { _timeOfLastMove = new Date().getTime(); }
export var hasEnoughTimePastSinceLastMove = () => {
    return new Date().getTime() - _timeOfLastMove < 1000
}

export function create(): void {
    /*
    If dependencies have loaded, creates a collection of Sphere objects. Also
    loads the assets of the appropriate spheres (all of them if no lazy
    loading, select ones otherwise).
    */

    if (Globals.delayExec(create,
                          ["BabylonSceneLoaded", "DataJsonLoadingStarted"], 
                          "create", 
                          this)) {
        return;
    }

    // Create the sphere objects. Not that this does not load the sphere
    // meshes or textures. To do that, you must call the associated sphere
    // functions explicitly.

    let BABYLON = Globals.get("BABYLON");

    // Get the sphere data from the JSON
    let sphereData = JSONData["spheres"];

    // Make the Sphere objects, add to list.
    for (let i=0; i<sphereData.length; i++) {
        let sphereDatum = sphereData[i];
        let pt = sphereDatum["position"];
        let position = new BABYLON.Vector3(pt[0], pt[2], pt[1]);  // note that Y and Z axes are switched on purpose.
        let textureFilename = sphereDatum["material"];  // filename of the PNG file.
        let meshFilename = sphereDatum["mesh"];  // filename of mesh
        let sphere = new Sphere(textureFilename, meshFilename, position);
        _spheres.push(sphere);
    }

    // The initial sphere is the first one
    _spheres[0].setToCurrentSphere();

    // Start updating the loading progress bar
    let jQuery = Globals.get("jQuery");
    _progressBarObj = jQuery("#loading-progress-bar .progress-bar");
    _startUpdatingAssetLoadBar();

    // Start loading spheres, one per second.
    setInterval(_loadNextSphere, 100);

    // Load the appropriate viewer spheres.
    // _loadRelevantAssets();
}

function _loadNextSphere() {
    _currentSphere.loadNextUnloadedAsset();
}

// function _loadRelevantAssets(): void {
//     /*
//     Loads the relevant assets given the current sphere. As currently
//     implemented, just loads all assets (no lazy loading).
//     */

//     // Here, load and destroy the assets, as appropriate. For now, we're
//     // not doing lazy loading, so let's just load them all.

//     if (Globals.get("lazyLoadViewerSpheres") === false) { // if Lazy Loading is NOT enabled
//         _loadAllAssets();   // simply load all assets up front
//     } else {    // otherwise Lazy Loading must BE enabled, so we trigger the lazy loading scheme for the first sphere
//         // // if sphereCollection.count() is less than lazyLoadCount, just load everything up front instead even if lazy loading is enabled
//         // for (let i = 0; i < Globals.get("lazyLoadCount"); i++) {    // counting from 0 to whatever global Lazy Loading count is specified to itterate over a CameraPoints object ordered by distance
//         //     if (_currentSphere.neighboringSpheresForLazyLoadingOrderedByDistance().get(i) === undefined) {
//         //         let dummy = _currentSphere.neighboringSpheresForLazyLoadingOrderedByDistance();
//         //         debugger;
//         //     }

//         //     if (_currentSphere.neighboringSpheresForLazyLoadingOrderedByDistance().get(i).associatedViewerSphere.assetsLoaded === false) {    // if the sphere we are looking at (one of the 16 nearest to the first sphere) has not had its assets loaded yet (NOTE: this will always be true at this point)
//         //         _currentSphere.neighboringSpheresForLazyLoadingOrderedByDistance().get(i).associatedViewerSphere.loadAssets(); // load in that sphere's assets (mesh and material)
//         //     }
//         // }
//     }
// }

// function _loadAllAssets(): void {
//     /*
//     Load the assets of all spheres and sets the first spheres opacity to 1.0.
//     So no lazy loading here.
//     */
    
//     // Use this if you don't want to lazy load. Loads the sphere meshes
//     // and textures.
//     for (let i=0; i<_spheres.length; i++) {
//         let sphere: Sphere = _spheres[i];
//         // if sphere.assetsLoaded === false
//         sphere.loadAssets(() => {
//             if (i === 0) {
//                 sphere.opacity(1.0);
//             }
//         });
//     }
// }

export function getByIndex(idx: number): Sphere {
    /*
    Given an index, return the associated sphere.

    :param number idx: The index of the desired sphere.

    :returns: An Sphere object.
    :rtype: :class:`Sphere`
    */

    return _spheres[idx];
}

export function count(): number {
    /*
    Get the number of Sphere objects in this collection.

    :returns: The number of objects.
    :rtype: :class:`number`
    */

    return _spheres.length;
}

export function countLazyLoadedSpheres(): number {
    let count = 0;
    for (let i=0; i<_spheres.length; i++) {
        if (_spheres[i].assetsLoaded) {
            count = count + 1;
        }
    }
    return count;
}

export function hideAll() {
    /*
    Hide all spheres. Helper function.
    */

    for (let i = 0; i < _spheres.length; i++) {
        let viewerSphere = _spheres[i];
        if (viewerSphere.assetsLoaded === true) {
            viewerSphere.opacity(0.0);            
        }
    }
}

function _startUpdatingAssetLoadBar(): void {
    /*
    Updates the loading bar in the UI depending on the number of textures that
    have been loaded. Assuming the textures will take longer to load than
    meshes, so focusing on the bottle neck.
    */

    // Might as well put this here, since it's related to the loading of
    // sphere materials.

    let numTexturesLoaded = Globals.get("numFrameTexturesLoaded");
    let numTexturesTotal = count();

    // Updating the progress bar.
    let progressVal = Math.round(100 * numTexturesLoaded / numTexturesTotal);
    _progressBarObj.css("width", Math.min(progressVal, 100).toString() + "%");

    if ((numTexturesTotal === undefined) || (progressVal < 100)) {
        setTimeout(() => {
            _startUpdatingAssetLoadBar();
        }, 10);
    } else {
        let jQuery = Globals.get("jQuery");
        
        // Start game button now enabled. Removed this because lazy loading.
        // jQuery("#start-game").prop("disabled", false);
    
        // Hide material-load progress bar.
        jQuery("#loading-progress-bar").slideUp();
    
        // Change the loading-panel title
        jQuery("#loading-title").html("Game Loaded");
    }
}
