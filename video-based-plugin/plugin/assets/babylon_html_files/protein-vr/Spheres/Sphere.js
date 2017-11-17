"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Material_1 = require("./Material");
var Globals = require("../config/Globals");
var CameraPoints_1 = require("./CameraPoints");
var SphereCollection = require("./SphereCollection");
var Sphere = (function () {
    function Sphere(textureFileName, meshFileName, position) {
        /*
        Creates the sphere object, but doesn't load any textures of meshes.

        :param string textureFileName: The name of the texture associated with
                      this sphere. Probably ends in ".png"

        :param string meshFileName: The name of the mesh. Maybe ends in .obj?
                      For now ignored, since creates sphere programmatically
                      via cloning.

        :param BABYLON.Vector3 position: The location of the sphere in 3D
                               space.
        */
        this._assetsLoaded = false; // Track whether or not a given Sphere's assets (texture, mesh) have been loaded
        this._sphereMesh = undefined; // BABYLON.Mesh
        this._allNeighboringSpheresByDist = undefined;
        this._navNeighboringSpheresByDist = undefined;
        // Specify the meshFileName location and textureFileName location when
        // you create the sphere object, though it doesn't load them on object
        // creation.
        this.textureFileName = textureFileName;
        this.meshFileName = meshFileName;
        this.position = position;
        this._uniqueID = Math.floor(Math.random() * 1000000).toString();
    }
    Sphere.prototype.loadAssets = function (callBack) {
        /*
        Loads the external assets associated with this sphere (material and
        mesh). Note that this does not happen on Sphere object creation.

        :param func callBack: A callback function to run when the assets
                    associated with this sphere are loaded.
        */
        var _this = this;
        if (callBack === void 0) { callBack = function () { }; }
        // LOAD THE MATERIAL
        // Note that this.textureFileName was set when the object was created.
        var filename;
        // isMobile = true;
        var isMobile = Globals.get("isMobile");
        if (isMobile) {
            // Some kind of phone... use low-res images
            filename = "frames/" + this.textureFileName + ".small.png"; // Note no caching, for debugging.
        }
        else {
            // desktop and laptops ... full res images
            filename = "frames/" + this.textureFileName; // Note no caching, for debugging.
        }
        if (Globals.get("breakCaching") === false) {
            filename = filename + "?" + Math.random().toString();
        }
        // Make the material.
        this.material = new Material_1.Material(filename, true, function () {
            setTimeout(function () {
                // Update the total number of textures loaded.
                var numTextures = Globals.get("numFrameTexturesLoaded") + 1;
                Globals.set("numFrameTexturesLoaded", numTextures);
                _this._loadMesh(callBack);
            });
        });
        var _assetsLoaded = true; // now that the assets have been loaded, set the variable to true
    };
    Sphere.prototype._loadMesh = function (callBack) {
        /*
        Loads the mesh specifically. This is in a separate private function
        because it can only be called after the material is loaded, and I
        thought it would be more organized to separate it into a seprate
        function rather than placing the code itself in the above callback.
        mesh). Note that this does not happen on Sphere object creation.

        :param func callBack: A callback function to run when the assets
                    associated with this sphere are loaded.
        */
        if (callBack === void 0) { callBack = function () { }; }
        // Now load the mesh (with material now loaded)
        // Eventually separate viewer meshes might be loaded remotely. For
        // example, if we decide to deform the meshes slightly to give a more
        // 3D look. But for now, just duplicate the template.
        // Get the template sphere
        var viewerSphereTemplate = Globals.get("viewerSphereTemplate");
        viewerSphereTemplate.isVisible = false;
        // Clone the sphere for this specific PNG/materials
        this._sphereMesh = viewerSphereTemplate.clone("viewer_sphere" + this._uniqueID);
        // Position that sphere at the associated camera location (in same order).
        this._sphereMesh.position = this.position;
        this._sphereMesh.material = this.material.material;
        // Hide the sphere. In ViewerSphere.ts, show just the first one.
        this.opacity(0.0);
        callBack();
    };
    Sphere.prototype.meshLoaded = function () {
        return !(this._sphereMesh === undefined);
    };
    Sphere.prototype.unloadAssets = function () {
        /*
        Unload the assets associated with this sphere (material and mesh) from
        memory. Probably as part of some lazy-loading scheme.
        */
        this._unloadMesh();
        this._unloadMaterial();
    };
    Sphere.prototype._unloadMaterial = function () {
        /*
        This function will remove the material from memory, probably as part
        of some lazy-loading scheme.
        */
        // Remove it from memory.
        delete this.material; //May or may not be the answer to how to accomplish this.
    };
    Sphere.prototype._unloadMesh = function () {
        /*
        This function will remove the sphere mesh from memory, probably as
        part of some lazy-loading scheme.
        */
        // Remove it from memory.
    };
    Sphere.prototype.opacity = function (val) {
        /*
        Sets the opacity of this sphere.

        :param number val: The opacity, between 0.0 and 1.0.
        */
        if (val === void 0) { val = undefined; }
        if (val === undefined) {
            // Getter
            return this._sphereMesh.visibility;
        }
        else {
            // Setter
            this._sphereMesh.visibility = val;
            // Might as well make entirely invisible if opacity is 0.
            if (val === 0.0) {
                this._sphereMesh.isVisible = false;
            }
            else {
                this._sphereMesh.isVisible = true;
            }
            // If opacity is 1, this must be the current sphere.
            if (val === 1.0) {
                // debugger;
                SphereCollection.currentSphere(this);
                // this is where currentSphere is changed, so this is where we want to load in assets for local spheres if lazy loading is enabled
                if (Globals.get("lazyLoadViewSpheres") === true) {
                    for (var i = 0; i < Globals.get("lazyLoadCount"); i++) {
                        if (this.allNeighboringSpheresOrderedByDistance()[i].associatedViewerSphere._assetsLoaded === false) {
                            this.allNeighboringSpheresOrderedByDistance()[i].associatedViewerSphere.loadAssets(); // load in that sphere's assets (mesh and material)
                        }
                    }
                }
            }
            return;
        }
    };
    Sphere.prototype.allNeighboringSpheresOrderedByDistance = function () {
        /*
        Provides a list containing information about other spheres, ordered by
        their distances from this one. Calculates this only one. Uses cache on
        subsequent calls.

        :returns: An object with the data.
        :rtype: :class:`CameraPoints`
        */
        // This list includes the positions of all other spheres. So could be
        // a long list.
        if (this._allNeighboringSpheresByDist === undefined) {
            // Let's get the points close to this sphere, since never before
            // calculated. Includes even this sphere.
            this._allNeighboringSpheresByDist = new CameraPoints_1.CameraPoints();
            for (var i = 0; i < SphereCollection.count(); i++) {
                var cameraPos = SphereCollection.getByIndex(i).position;
                var pos = cameraPos.clone();
                var dist = pos.subtract(this.position).length();
                this._allNeighboringSpheresByDist.push({
                    distance: dist,
                    position: pos,
                    associatedViewerSphere: SphereCollection.getByIndex(i)
                });
            }
            // Sort by distance
            this._allNeighboringSpheresByDist.sort();
        }
        return this._allNeighboringSpheresByDist;
    };
    Sphere.prototype.navigationNeighboringSpheresOrderedByDistance = function () {
        /*
        Provides a list containing information about the closest spheres,
        ordered by their distances from this one. Calculates this only one.
        Uses cache on subsequent calls. These are the spheres that should be
        considered when positioning navigation arrows or considering where to
        move the camera next.

        :returns: An object with the data.
        :rtype: :class:`CameraPoints`
        */
        // This is just a few neighboring spheres near this sphere. User to
        // position arrows and for next-step destinations when moving through
        // the scene.
        if (this._navNeighboringSpheresByDist === undefined) {
            // Start by considering all neighbors
            this._navNeighboringSpheresByDist = this.allNeighboringSpheresOrderedByDistance().copy();
            // Remove first one (closest). To make sure any movement is to a new
            // sphere, not the one where you already are.
            this._navNeighboringSpheresByDist.removeFirst();
            // Keep only four points. So I guess paths can't be too bifurcated.
            this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.firstFewPoints(Globals.get("numNeighboringCameraPosForNavigation")); // choose four close points
            // Remove the points that are off in the same general direction
            this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.removePointsInSameGeneralDirection(this.position);
        }
        return this._navNeighboringSpheresByDist;
    };
    return Sphere;
}());
exports.Sphere = Sphere;
//# sourceMappingURL=Sphere.js.map