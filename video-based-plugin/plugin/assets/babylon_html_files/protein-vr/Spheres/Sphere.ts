import { Material } from "./Material";
import { TextureType } from "./Material";
import * as Globals from "../config/Globals";
import { CameraPoints } from "./CameraPoints";
import * as SphereCollection from "./SphereCollection";
import * as Sets from "./Sets";

export class Sphere {
    /*
    A class that stores variables and functions for a given viewer sphere
    (environment or frame).
    */

    public position: any;  // BABYLON.Vector3
    public textureFileName: string;
    public meshFileName: string;
    public material: Material;
    public sphereMesh: any = null;  // BABYLON.Mesh
    public assetsLoaded: boolean = false; // assets are not loaded to begin with

    constructor(textureFileName: string, meshFileName: string, position: any) {
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
        
        // Specify the meshFileName location and textureFileName location when
        // you create the sphere object, though it doesn't load them on object
        // creation.

        this.textureFileName = textureFileName;
        this.meshFileName = meshFileName;
        this.position = position;
        this.material = new Material(true);  // but no texture yet
    }

    // public loadAssets(callBack = function() {}): void {
    //     /*
    //     Loads the external assets associated with this sphere (material and
    //     mesh). Note that this does not happen on Sphere object creation.

    //     :param func callBack: A callback function to run when the assets
    //                 associated with this sphere are loaded.
    //     */

    //     // LOAD THE MATERIAL
    //     // Note that this.textureFileName was set when the object was created.

    //     if (this.assetsLoaded === true) {
    //         return;
    //     }

    //     let filename: string;
        
    //     let isMobile = Globals.get("isMobile");
    //     isMobile = true;
    //     if (isMobile) {
    //         // Some kind of phone... use low-res images
    //         filename = "frames/" + this.textureFileName + ".small.png";  // Note no caching, for debugging.
    //     } else {
    //         // desktop and laptops ... full res images
    //         filename = "frames/" + this.textureFileName;  // Note no caching, for debugging.
    //     }

    //     if (Globals.get("breakCaching") === false) {
    //         filename = filename + "?" + Math.random().toString();
    //     }
        
    //     // Make the material.
    //     this.material.loadTexture(filename, () => {
    //         setTimeout(() => {  // kind of like doEvents from VB days.
    //             // console.log("Material loaded: ", this.textureFileName);
    //             // Update the total number of textures loaded.
    //             let numTextures = Globals.get("numFrameTexturesLoaded") + 1;
    //             Globals.set("numFrameTexturesLoaded", numTextures);
    //             this.loadMesh(callBack);
    //             this.assetsLoaded = true; // assets have now been loaded

    //             let lazyLoadedSpheres = Globals.get("lazyLoadedSpheres");
    //             lazyLoadedSpheres.push(this);
    //             Globals.set("lazyLoadedSpheres", lazyLoadedSpheres);
    //         }, 0);
    //     });
    // }

    public loadMesh(callBack = function() {}): void {
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
            this.sphereMesh.material = this.material.material;

            // Hide the sphere. In ViewerSphere.ts, show just the first one.
            this.opacity(0.0);

            // console.log("Mesh loaded: ", this.textureFileName);

            this.assetsLoaded = true;  // Assets have now been loaded. Because spheres are always loaded after textures.
            
            callBack();
        }
    }

    public loadNextUnloadedAsset() {
        // Lazy loads the next unloaded asset.
        let isMobile: boolean = Globals.get("isMobile");
        let recentlyMoved: boolean = SphereCollection.hasEnoughTimePastSinceLastMove();
        
        let neighborPts = this.neighboringSpheresForLazyLoadingOrderedByDistance();

        // Now add in high-res little by little
        for (let i=0; i<Globals.get("lazyLoadCount"); i++) {
            let cameraPt = neighborPts.get(i);
            let sphere: Sphere = cameraPt.associatedViewerSphere;
            
            // Load the texture.
            let wasNewTexLoaded = sphere.material.loadTexture("frames/" + sphere.textureFileName, () => {
                sphere.loadMesh();  // Mesh has never been loaded, so take care of that.
            });
            
            if (wasNewTexLoaded) {
                // So only loading one high-res per function call.
                break;
            }
        }
        
        // For debugging...
        // console.log("==========");
        // for (let i=0; i<Globals.get("lazyLoadCount"); i++) {
        //     let cameraPt = neighborPts.get(i);
        //     let sphere: Sphere = cameraPt.associatedViewerSphere;
            
        //     // Load the texture.
        //     console.log("frames/" + sphere.textureFileName, sphere.material.textureType);
        // }


        // Now check if there are too many spheres. If so, delete some that
        // are too far away.
        if (SphereCollection.countLazyLoadedSpheres() > Globals.get("lazyLoadCount")) {
            for (let idx = neighborPts.length() - 1; idx > -1; idx--) {
                let cameraPt = neighborPts.get(idx);
                let sphere = cameraPt.associatedViewerSphere;
                if (sphere.assetsLoaded) {
                    sphere.unloadAssets();
                }
    
                if (SphereCollection.countLazyLoadedSpheres() <= Globals.get("lazyLoadCount")) {
                    break;
                }
            }
        }
    }

    // public meshLoaded(): boolean {
    //     return !(this.sphereMesh === null);  // *****
    // }

    public unloadAssets(): void {
        /*
        Unload the assets associated with this sphere (material and mesh) from
        memory. Probably as part of some lazy-loading scheme.
        */

        this._unloadMesh();
        this._unloadTexture();
        this.assetsLoaded = false;
    }

    private _unloadTexture(): void {
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

        console.log("Material unloaded: ", this.textureFileName);

    }

    private _unloadMesh() {
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

        console.log("Mesh unloaded: ", this.textureFileName);
        
    }

    public opacity(val: number = undefined): void {
        /*
        Sets the opacity of this sphere.

        :param number val: The opacity, between 0.0 and 1.0.
        */

        if (val === undefined) {
            // Getter
            return this.sphereMesh.visibility;

        } else if ((this.sphereMesh !== undefined) && (this.sphereMesh !== null)) {  // If this.sphereMesh is undefined, probably hasn't been loaded yet.
            // Setter
            // if (this.sphereMesh === undefined) {
                // console.log("Get ready for error:", this);
                // debugger;

            // }
            this.sphereMesh.visibility = val;

            // *********
            
            // Might as well make entirely invisible if opacity is 0.
            if (val === 0.0) {
                this.sphereMesh.isVisible = false;
            } else {
                this.sphereMesh.isVisible = true;
            }

            return;
        }
    }

    private _intersectionArrayOfSpheres(arr1: Sphere[], arr2: Sphere[]) {
        let arr1Ids = [];
    }

    public setToCurrentSphere() {
        // Update the current sphere variable
        SphereCollection.setCurrentSphereVar(this);

        // Update last move time.
        SphereCollection.setTimeOfLastMoveVar();

        // Make sure at least low-res neighbor textures loaded.
        let neighborPts = this.neighboringSpheresForLazyLoadingOrderedByDistance();
        
        // Here load the low-res for all of close neighbors (one swoop)
        for (let i=0; i<Globals.get("lazyLoadCount"); i++) {
            let cameraPt = neighborPts.get(i);
            let sphere: Sphere = cameraPt.associatedViewerSphere;

            if (!sphere.assetsLoaded) {
                sphere.material.loadTexture("frames/" + sphere.textureFileName, () => {
                    sphere.loadMesh();  // Mesh has never been loaded, so take care of that.
                }, TextureType.Mobile);
            }
        }

        // if (Globals.get("lazyLoadViewerSpheres") === true) {  // if we are Lazy Loading...
        //     this._lazyLoadNeighbors();
        // }
    }

    // private _lazyLoadNeighbors(numNeighbors: number = undefined) {
    //     // Get a list of spheres that need to be loaded (some might already be
    //     // loaded)
    //     let newSpheres = [];
    //     let toLoad: CameraPoints = this.neighboringSpheresForLazyLoadingOrderedByDistance();  // all the ones to load, including ones already loaded.
    //     for (let i=0; i<toLoad.length(); i++) {
    //         let d = toLoad.get(i);
    //         let sphere = d.associatedViewerSphere;
    //         newSpheres.push(sphere);
    //     }

    //     // Get a list of the currently loaded spheres.
    //     let currentlyLoaded = Globals.get("lazyLoadedSpheres");

    //     // Get lists of spheres that are only in one or the other.
    //     let spheresToProcess = Sets.difference(newSpheres, currentlyLoaded);

    //     // Load new spheres
    //     for (let i=0; i<spheresToProcess.inFirstOnly.length; i++) {
    //         spheresToProcess.inFirstOnly[i].loadAssets();
    //     }

    //     // Unload spheres no longer needed
    //     for (let i=0; i<spheresToProcess.inSecondOnly.length; i++) {
    //         spheresToProcess.inSecondOnly[i].unloadAssets();
    //     }

    //     // Upload the list of currently loaded spheres
    //     Globals.set("lazyLoadedSpheres", newSpheres);
    // }

    private _neighboringSpheresForLazyLoadingByDist: CameraPoints = undefined;
    public neighboringSpheresForLazyLoadingOrderedByDistance() {
        /*
        Provides a list containing information about other spheres, ordered by
        their distances from this one. Calculates this only one. Uses cache on
        subsequent calls.

        :returns: An object with the data.
        :rtype: :class:`CameraPoints`
        */

        // This list includes the positions of all other spheres. So could be
        // a long list.
        
        if (this._neighboringSpheresForLazyLoadingByDist === undefined) {
            // Let's get the points close to this sphere, since never before
            // calculated. Includes even this sphere.
            let tmp = SphereCollection;
            this._neighboringSpheresForLazyLoadingByDist = new CameraPoints();
            for (let i=0; i<SphereCollection.count(); i++) {
                let cameraPos = SphereCollection.getByIndex(i).position;
                let pos = cameraPos.clone();
                let dist = pos.subtract(this.position).length();
                this._neighboringSpheresForLazyLoadingByDist.push({
                    distance: dist, 
                    position: pos, 
                    associatedViewerSphere: SphereCollection.getByIndex(i)
                });
            }
            
            // Sort by distance
            this._neighboringSpheresForLazyLoadingByDist.sort();

            // Keep only the closest ones.
            // this._neighboringSpheresForLazyLoadingByDist = this._neighboringSpheresForLazyLoadingByDist.firstFewPoints(Globals.get("lazyLoadCount"));
        }

        return this._neighboringSpheresForLazyLoadingByDist;
    }

    private _navNeighboringSpheresByDist: CameraPoints = undefined;
    public navigationNeighboringSpheresOrderedByDistance() {
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
            this._navNeighboringSpheresByDist = this.neighboringSpheresForLazyLoadingOrderedByDistance().copy();
        
            // Remove first one (closest). To make sure any movement is to a new
            // sphere, not the one where you already are.
            this._navNeighboringSpheresByDist.removeFirst();
    
            // Keep only four points. So I guess paths can't be too bifurcated.
            this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.firstFewPoints(Globals.get("numNeighboringCameraPosForNavigation"));  // choose four close points
    
            // Remove the points that are off in the same general direction
            this._navNeighboringSpheresByDist = this._navNeighboringSpheresByDist.removePointsInSameGeneralDirection(this.position);
        }

        return this._navNeighboringSpheresByDist;
    }

}