import * as Globals from "../config/Globals";
import * as Camera from "./Camera";
import { RenderingGroups } from "../config/Globals";

var data;
export function loadJSON() {
    let jQuery = Globals.get("jQuery");
    let BABYLON = Globals.get("BABYLON");

    return new Promise((resolve) => {
        jQuery.get("data.json", (_data) => {
            data = _data;
            
            // Load camera tracks data
            let cameraPositions = []; 
            let sphereShaders = [];  // For storage now.
            for (let i=0; i<data["cameraPositions"].length; i++) {
                let pt = data["cameraPositions"][i];
                let v = new BABYLON.Vector3(pt[0], pt[2], pt[1]);  // note that Y and Z axes are switched on purpose.
                cameraPositions.push(v);
                sphereShaders.push(null);
            }
            Globals.set("cameraPositions", cameraPositions);
            Globals.set("sphereShaders", sphereShaders);            
            resolve({msg: "LOADED PROTIENVR JSON"});
        });
    })
}

export function afterSceneLoaded() {
    return new Promise((resolve) => {
        // This._JSONData = data;
        _addGuideSpheres();
        _loadClickableFiles();
        _loadAnimatedObjects();

        resolve({msg: "LOADED PROTEINVR JSON AFTER BABYLON SCENE LOADED"})
    });
}

var _guideSpheres = [];
var _guideSphereHiddenCutoffDist;
var _guideSphereShowCutoffDist;
var _guideSphereIntermediateFactor;
var _guideSphereMaxVisibility: number = 1.0; //0.25;
var _guideSphereSize: number = 0.02;
function _addGuideSpheres() {
    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");

    // Add in guide spheres.
    let sphereMat = new BABYLON.StandardMaterial("sphereMat", scene);
    // sphereMat.backFaceCulling = false;
    sphereMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
    sphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
    sphereMat.diffuseTexture = null;
    sphereMat.emissiveTexture = null; //new BABYLON.Texture("dot.png", scene);
    // sphereMat.emissiveTexture.hasAlpha = true;
    sphereMat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);

    for (let i=0; i<data["guideSphereLocations"].length; i++) {
        let sphereLoc = data["guideSphereLocations"][i];
        let sphere = BABYLON.Mesh.CreateDisc("guide_sphere" + i.toString(), 0.05, 12, scene, false, BABYLON.Mesh.DEFAULTSIDE);
        sphere.material = sphereMat;
        sphere.position.x = sphereLoc[0];
        sphere.position.y = sphereLoc[2];  // note y and z reversed.
        sphere.position.z = sphereLoc[1];
        sphere.renderingGroupId = RenderingGroups.VisibleObjects;
        sphere.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        // sphere.alpha = 1.0;
        _guideSpheres.push(sphere);
    }

    // Set some guide-sphere parameters
    let viewerSphereSize = 5.0; // data["viewerSphereSize"];
    _guideSphereHiddenCutoffDist = 0.1 * viewerSphereSize;
    _guideSphereShowCutoffDist = 2.0 * viewerSphereSize;
    _guideSphereIntermediateFactor = _guideSphereMaxVisibility / (_guideSphereShowCutoffDist - _guideSphereHiddenCutoffDist);
}

export function updateGuideSpheres(newCameraData) {
    let BABYLON = Globals.get("BABYLON");

    // Keep only guide spheres that are not so close
    for (let i=0; i<_guideSpheres.length; i++) {
        let sphere = _guideSpheres[i];
        let distToGuideSphere = BABYLON.Vector3.Distance(sphere.position, newCameraData.position);
        if (distToGuideSphere < _guideSphereHiddenCutoffDist) {
            sphere.visibility = 0.0;
        } else if (distToGuideSphere < _guideSphereShowCutoffDist) {
            sphere.visibility = _guideSphereIntermediateFactor * (distToGuideSphere - _guideSphereHiddenCutoffDist);
        } else {
            sphere.visibility = _guideSphereMaxVisibility;
        }
    }
}

function _loadClickableFiles() {
    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");

    // Load extra obj files
    let loader = new BABYLON.AssetsManager(scene);
    let objFilenames = data["clickableFiles"];
    for (let i=0; i<objFilenames.length;i++) {
        let objFilename = objFilenames[i];
        // console.log(objFilename);
        let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
        meshTask.onSuccess = function (task) {
            let mesh = task.loadedMeshes[0];  // Why is this necessary?
            mesh.scaling.z = -1.0;
            mesh.renderingGroupId = RenderingGroups.ClickableObjects;
            // this._viewerSphere.isPickable = true;
            mesh.isPickable = true;
        }
    }
    loader.load();

    // Make those meshes clickable
    _makeSomeMeshesClickable();
}

function _loadAnimatedObjects() {
    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");
    let loader = new BABYLON.AssetsManager(scene);
    for (var objName in data["animations"]) {
        if (data["animations"].hasOwnProperty(objName)) {
            let objFilename = objName + "_animated.obj";
            let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
            meshTask.onSuccess = function (task) {
                let mesh = task.loadedMeshes[0];  // Why is this necessary?
                mesh.scaling.z = -1.0;

                console.log(mesh);
                mesh.renderingGroupId = RenderingGroups.VisibleObjects;  // In front of viewer sphere.
                // this._viewerSphere.isPickable = true;
                mesh.isPickable = false;

                // Load texture here.
                let mat = new BABYLON.StandardMaterial(mesh.name + "_material", scene);
                mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mat.specularColor = new BABYLON.Color3(0, 0, 0);
                mat.emissiveTexture = new BABYLON.Texture(mesh.name + "_animated.png", scene);
                mat.diffuseTexture = null;
                mat.backFaceCulling = false;

                mesh.material = mat;                
            }    
        }
    }
    loader.load();    
}

var _timeOfLastClick: number = new Date().getTime();  // A refractory period
function _makeSomeMeshesClickable() {
    let scene = Globals.get("scene");

    // When click event is raised
    window.addEventListener("click", (evt) => {
        let now = new Date().getTime();
        if (now - _timeOfLastClick > 500) {
            _timeOfLastClick = now;

            // We try to pick an object
            var pickResult = scene.pick(evt.clientX, evt.clientY);
            if ((pickResult !== null) && (pickResult.pickedMesh !== null) && (pickResult.pickedMesh.id != "ProteinVR_ViewerSphere")) {
                console.log(pickResult.pickedMesh.id);
            }
        }
    });
}