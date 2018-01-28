define(["require", "exports", "./Material", "./Material", "../config/Globals", "./CameraPoints", "./SphereCollection", "../Triggers/TriggerCollection"], function (require, exports, Material_1, Material_2, Globals, CameraPoints_1, SphereCollection, TriggerCollection) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Sphere {
        constructor(textureFileName, meshFileName, position) {
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
            this.sphereMesh = null; // BABYLON.Mesh
            this.assetsLoaded = false; // assets are not loaded to begin with
            this.index = undefined;
            this._neighboringSpheresByDist = undefined;
            this._navNeighboringSpheresByDist = undefined;
            this.__deltaVecsToOther = undefined;
            // Specify the meshFileName location and textureFileName location when
            // you create the sphere object, though it doesn't load them on object
            // creation.
            this.textureFileName = textureFileName;
            this.meshFileName = meshFileName;
            this.position = position;
            this.material = new Material_1.Material(true); // but no texture yet
        }
        loadMesh(callBack = function () { }) {
            /*
            Loads the mesh specifically. This is in a separate private function
            because it can only be called after the material is loaded, and I
            thought it would be more organized to separate it into a seprate
            function rather than placing the code itself in the above callback.
            mesh). Note that this does not happen on Sphere object creation.
    
            :param func callBack: A callback function to run when the assets
                        associated with this sphere are loaded.
            */
            // Now load the mesh (with material now loaded)
            // Eventually separate viewer meshes might be loaded remotely. For
            // example, if we decide to deform the meshes slightly to give a more
            // 3D look. But for now, just duplicate the template.
            if ((this.sphereMesh === undefined) || (this.sphereMesh === null)) {
                // Get the template sphere
                let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
                viewerSphereTemplate.isVisible = false;
                // Clone the sphere for this specific PNG/materials
                this.sphereMesh = viewerSphereTemplate.clone("viewer_sphere_" + this.textureFileName);
                // Position that sphere at the associated camera location (in same order).
                this.sphereMesh.position = this.position;
                // Hide the sphere. In ViewerSphere.ts, show just the first one.
                this.opacity(0.0);
                // console.log("Mesh loaded: ", this.textureFileName);
                this.assetsLoaded = true; // Assets have now been loaded. Because spheres are always loaded after textures.
            }
            // Do this regardless. If texture updated, need to update material.
            this.sphereMesh.material = this.material.material;
            callBack();
        }
        tryToUpgradeTextureIfAppropriate() {
            // Upgrades the texture of this sphere if it's appropriate.
            if (this.material.textureType === Material_2.TextureType.Full) {
                // Already maxed out;
                return;
            }
            if (!SphereCollection.hasEnoughTimePastSinceLastMove()) {
                // Not enough time has passed since the user sat still. Only load
                // if not much movement.
                return;
            }
            if (Globals.get("isMobile")) {
                // If it's mobile, you never want the high-res images.
                return;
            }
            this.material.loadTexture("frames/" + this.textureFileName, () => {
                this.loadMesh(); // Mesh has never been loaded, so take care of that.
                // console.log(this.sphereMesh.visibility, this.sphereMesh.isVisible);
            }, Material_2.TextureType.Full);
            // For debugging...
            // console.log("==========");
            // for (let i=0; i<Globals.get("lazyLoadCount"); i++) {
            //     let cameraPt = neighborPts.get(i);
            //     let sphere: Sphere = cameraPt.associatedViewerSphere;
            //     // Load the texture.
            //     console.log("frames/" + sphere.textureFileName, sphere.material.textureType);
            // }
        }
        loadAssets() {
            if (!this.assetsLoaded) {
                let typeToLoad = Material_2.TextureType.Mobile;
                // If you're not on mobile, and if the full texture isn't very
                // big, just load the full texture instead.
                let pngFileSizes = Globals.get("pngFileSizes");
                if (pngFileSizes !== undefined) {
                    // console.log("MOO", pngFileSizes[sphere.textureFileName]);
                    if (pngFileSizes[this.textureFileName] < 100) {
                        typeToLoad = Material_2.TextureType.Full;
                    }
                }
                this.material.loadTexture("frames/" + this.textureFileName, () => {
                    this.loadMesh(); // Mesh has never been loaded, so take care of that.
                }, typeToLoad);
            }
        }
        unloadAssets() {
            /*
            Unload the assets associated with this sphere (material and mesh) from
            memory. Probably as part of some lazy-loading scheme.
            */
            if (this.assetsLoaded) {
                this._unloadMesh();
                this._unloadTexture();
                this.assetsLoaded = false;
            }
        }
        _unloadTexture() {
            /*
            This function will remove the material from memory, probably as part
            of some lazy-loading scheme.
            */
            // Remove it from memory.
            // delete this.material;
            if ((this.material !== undefined) && (this.material !== null)) {
                this.material.unloadTextureFromMemory();
                // delete this.material;
            }
            // console.log("Material unloaded: ", this.textureFileName);
        }
        _unloadMesh() {
            /*
            This function will remove the sphere mesh from memory, probably as
            part of some lazy-loading scheme.
            */
            // Remove it from memory.
            if ((this.sphereMesh !== undefined) && (this.sphereMesh !== null)) {
                this.sphereMesh.dispose();
                this.sphereMesh = null;
                delete this.sphereMesh;
            }
            // console.log("Mesh unloaded: ", this.textureFileName);
        }
        opacity(val = undefined) {
            /*
            Sets the opacity of this sphere.
    
            :param number val: The opacity, between 0.0 and 1.0.
            */
            if (val === undefined) {
                // Getter
                return this.sphereMesh.visibility;
            }
            else if ((this.sphereMesh !== undefined) && (this.sphereMesh !== null)) {
                this.sphereMesh.visibility = val;
                // Might as well make entirely invisible if opacity is 0.
                if (val === 0.0) {
                    this.sphereMesh.isVisible = false;
                }
                else {
                    this.sphereMesh.isVisible = true;
                }
                return;
            }
        }
        _intersectionArrayOfSpheres(arr1, arr2) {
            let arr1Ids = [];
        }
        setToCurrentSphere() {
            // Update the current sphere variable
            SphereCollection.setCurrentSphereVar(this);
            // Update last move time.
            SphereCollection.setTimeOfLastMoveVar();
            // Trigger any triggers
            TriggerCollection.checkAll();
            // Make sure at least low-res neighbor textures loaded.
            let neighborPts = this.neighboringSpheresOrderedByDistance();
            let lazyLoadCount = Globals.get("lazyLoadCount");
            // Here load the low-res for all of close neighbors (one swoop)
            for (let i = 0; i < neighborPts.length(); i++) {
                // for (let i=0; i<Globals.get("lazyLoadCount"); i++) {
                let cameraPt = neighborPts.get(i);
                let sphere = cameraPt.associatedViewerSphere;
                if (i < lazyLoadCount) {
                    // They need to be loaded, because it's within the lazy-load
                    // range.
                    sphere.loadAssets();
                    // if (!sphere.assetsLoaded) {
                    //     let typeToLoad = TextureType.Mobile;
                    //     // If you're not on mobile, and if the full texture isn't very
                    //     // big, just load the full texture instead.
                    //     let pngFileSizes = Globals.get("pngFileSizes");
                    //     if (pngFileSizes !== undefined) {
                    //         // console.log("MOO", pngFileSizes[sphere.textureFileName]);
                    //         if (pngFileSizes[sphere.textureFileName] < 100) {  // 100 kb is arbitrary.
                    //             typeToLoad = TextureType.Full;
                    //         }
                    //     }
                    //     sphere.material.loadTexture("frames/" + sphere.textureFileName, () => {
                    //         sphere.loadMesh();  // Mesh has never been loaded, so take care of that.
                    //     }, typeToLoad);
                    // }
                }
                else {
                    // It needs to be unloaded, because it's outside the lazy-load
                    // range.
                    // if (sphere.assetsLoaded) {
                    sphere.unloadAssets();
                    // }
                }
            }
            let output = "";
            for (let i = 0; i < SphereCollection.spheres.length; i++) {
                if (i === SphereCollection.getIndexOfCurrentSphere()) {
                    output = output + "+";
                }
                else {
                    output = output + (SphereCollection.spheres[i].assetsLoaded ? "1" : ".");
                }
            }
            // Remove extra textures and meshes
            // SphereCollection.removeExtraSphereTexturesAndMeshesFromMemory();
        }
        neighboringSpheresOrderedByDistance() {
            /*
            Provides a list containing information about other spheres, ordered by
            their distances from this one. Calculates this only one. Uses cache on
            subsequent calls.
    
            :returns: An object with the data.
            :rtype: :class:`CameraPoints`
            */
            // This list includes the positions of all other spheres. So could be
            // a long list.
            if (this._neighboringSpheresByDist === undefined) {
                // Let's get the points close to this sphere, since never before
                // calculated. Includes even this sphere.
                let tmp = SphereCollection;
                this._neighboringSpheresByDist = new CameraPoints_1.CameraPoints();
                for (let i = 0; i < SphereCollection.count(); i++) {
                    let cameraPos = SphereCollection.getByIndex(i).position;
                    let pos = cameraPos.clone();
                    let dist = pos.subtract(this.position).length();
                    this._neighboringSpheresByDist.push({
                        distance: dist,
                        position: pos,
                        associatedViewerSphere: SphereCollection.getByIndex(i)
                    });
                }
                // Sort by distance
                this._neighboringSpheresByDist.sort();
                // Keep only the closest ones.
                // Not doing this anymore...
                // this._neighboringSpheresByDist = this._neighboringSpheresByDist.firstFewPoints(Globals.get("lazyLoadCount"));
            }
            return this._neighboringSpheresByDist;
        }
        navigationNeighboringSpheresOrderedByDistance() {
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
                // // Start by considering all neighbors
                // this._navNeighboringSpheresByDist = this.neighboringSpheresOrderedByDistance().copy();
                // // Remove first one (closest). To make sure any movement is to a new
                // // sphere, not the one where you already are.
                // this._navNeighboringSpheresByDist.removeFirst();
                // // Keep only four points. So I guess paths can't be too bifurcated.
                // this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.firstFewPoints(Globals.get("numNeighboringCameraPosForNavigation"));  // choose four close points
                // // Remove the points that are off in the same general direction
                // this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.removePointsInSameGeneralDirection(this.position);
                // Need to index camera points by associated spheres. So {textureName: Sphere}
                var neighboringSpheresBySphereTexture = {};
                for (let i = 0; i < this.neighboringSpheresOrderedByDistance().length(); i++) {
                    let cameraPt = this.neighboringSpheresOrderedByDistance().get(i);
                    let sphere = cameraPt.associatedViewerSphere;
                    let textureName = sphere.textureFileName;
                    neighboringSpheresBySphereTexture[textureName] = cameraPt;
                }
                // Now keep only the camera points that are neighbors.
                this._navNeighboringSpheresByDist = new CameraPoints_1.CameraPoints();
                let neighborsToConsider = Globals.get("nextMoves")[this.index];
                for (let i = 0; i < neighborsToConsider.length; i++) {
                    let neighborToConsider = neighborsToConsider[i];
                    let textureName = SphereCollection.getByIndex(neighborToConsider).textureFileName;
                    this._navNeighboringSpheresByDist.push(neighboringSpheresBySphereTexture[textureName]);
                }
                // console.log(this.index, Globals.get("nextMoves")[this.index]);
                // console.log(this._navNeighboringSpheresByDist);
            }
            return this._navNeighboringSpheresByDist;
        }
        _deltaVecsToOtherPts() {
            // other_pt - this_point vector used for calculating which nav sphere
            // user is looking at. No need to keep calculating this over and over.
            // Just once, and cache.
            if (this.__deltaVecsToOther === undefined) {
                this.__deltaVecsToOther = [];
                let neighboringPts = this.neighboringSpheresOrderedByDistance();
                for (let i = 0; i < neighboringPts.length(); i++) {
                    let neighborPt = neighboringPts.get(i).position;
                    this.__deltaVecsToOther.push(neighborPt.subtract(this.position));
                }
            }
            return this.__deltaVecsToOther;
        }
    }
    exports.Sphere = Sphere;
});
