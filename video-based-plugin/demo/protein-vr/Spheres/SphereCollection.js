define(["require", "exports", "./Sphere", "../config/Globals", "../scene/PVRJsonSetup"], function (require, exports, Sphere_1, Globals, PVRJsonSetup_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
        let BABYLON = Globals.get("BABYLON");
        // Get the sphere data from the JSON
        let sphereData = PVRJsonSetup_1.JSONData["spheres"];
        // Make the Sphere objects, add to list.
        for (let i = 0; i < sphereData.length; i++) {
            let sphereDatum = sphereData[i];
            let pt = sphereDatum["position"];
            let position = new BABYLON.Vector3(pt[0], pt[2], pt[1]); // note that Y and Z axes are switched on purpose.
            let textureFilename = sphereDatum["material"]; // filename of the PNG file.
            let meshFilename = sphereDatum["mesh"]; // filename of mesh
            let sphere = new Sphere_1.Sphere(textureFilename, meshFilename, position);
            _spheres.push(sphere);
            // WILLIAM: IF i = 0, first sphere, so use currentSphere() as a setter
            // below. Can't do this based on opacity, because not material loaded
            // yet.
        }
        // Start updating the loading progress bar
        let jQuery = Globals.get("jQuery");
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
        // Here, load and destroy the assets, as appropriate. For now, we're
        // not doing lazy loading, so let's just load them all.
        _loadAllAssets();
    }
    function _loadAllAssets() {
        /*
        Load the assets of all spheres and sets the first spheres opacity to 1.0.
        So no lazy loading here.
        */
        // Use this if you don't want to lazy load. Loads the sphere meshes
        // and textures.
        for (let i = 0; i < _spheres.length; i++) {
            let sphere = _spheres[i];
            sphere.loadAssets(() => {
                if (i === 0) {
                    sphere.opacity(1.0);
                }
            });
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
        for (let i = 0; i < _spheres.length; i++) {
            let viewerSphere = _spheres[i];
            viewerSphere.opacity(0.0);
        }
    }
    exports.hideAll = hideAll;
    function currentSphere(val = undefined) {
        /*
        Gets or sets the current sphere, depending on whether val is defined.
    
        :param Sphere val: An optional parameter. If defined, the current sphere
               will be set to this one.
    
        :returns: Can return the current sphere, if val is defined.
        :rtype: :class:`Sphere`
        */
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
        let numTexturesLoaded = Globals.get("numFrameTexturesLoaded");
        let numTexturesTotal = count();
        // Updating the progress bar.
        let progressVal = Math.round(100 * numTexturesLoaded / numTexturesTotal);
        _progressBarObj.css("width", Math.min(progressVal, 100).toString() + "%");
        if ((numTexturesTotal === undefined) || (progressVal < 100)) {
            setTimeout(() => {
                _startUpdatingAssetLoadBar();
            }, 10);
        }
        else {
            let jQuery = Globals.get("jQuery");
            // Start game button now enabled. Removed this because lazy loading.
            // jQuery("#start-game").prop("disabled", false);
            // Hide material-load progress bar.
            jQuery("#loading-progress-bar").slideUp();
            // Change the loading-panel title
            jQuery("#loading-title").html("Game Loaded");
        }
    }
});
