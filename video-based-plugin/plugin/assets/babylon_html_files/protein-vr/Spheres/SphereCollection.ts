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
    let timePassed = new Date().getTime() - _timeOfLastMove;
    return (timePassed > 1000)
}

export var spheresWithAssetsCount: number = 0;  // read only outside this file
export var addToSpheresWithAssetsCount = (val: number) => { spheresWithAssetsCount = spheresWithAssetsCount + val; }

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
        sphere.index = i;
        _spheres.push(sphere);
    }

    // The initial sphere is the first one
    _spheres[0].setToCurrentSphere();

    // Start updating the loading progress bar
    let jQuery = Globals.get("jQuery");
    _progressBarObj = jQuery("#loading-progress-bar .progress-bar");
    _startUpdatingAssetLoadBar();

    // Periodically check current sphere to make sure has best appropriate
    // texture resolution
    setInterval(() => { 
        _currentSphere.tryToUpgradeTextureIfAppropriate(); 
    }, 100);

    // Start loading spheres, one per second.
    // setInterval(_loadNextSphere, 100);
}

// function _loadNextSphere() {
    // _currentSphere.loadNextUnloadedAsset();
// }

export function removeExtraSphereTexturesAndMeshesFromMemory() {
    // Now check if there are too many spheres. If so, delete some that
    // are too far away.
    let neighborPts = _currentSphere.neighboringSpheresForLazyLoadingOrderedByDistance();
    let lazyLoadCount = Globals.get("lazyLoadCount");
    if (spheresWithAssetsCount > lazyLoadCount) {
        for (let idx = neighborPts.length() - 1; idx > -1; idx--) {
            let cameraPt = neighborPts.get(idx);
            let sphere = cameraPt.associatedViewerSphere;
            if (sphere.assetsLoaded) {
                sphere.unloadAssets();
            }

            if (spheresWithAssetsCount <= lazyLoadCount) {
                break;
            }
        }
    }
}

export function getByIndex(idx: number): Sphere {
    /*
    Given an index, return the associated sphere.

    :param number idx: The index of the desired sphere.

    :returns: An Sphere object.
    :rtype: :class:`Sphere`
    */

    return _spheres[idx];
}

export function getIndexOfCurrentSphere(): number {
    return _currentSphere.index;
}

export function count(): number {
    /*
    Get the number of Sphere objects in this collection.

    :returns: The number of objects.
    :rtype: :class:`number`
    */

    return _spheres.length;
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

