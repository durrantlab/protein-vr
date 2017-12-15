/* Get data about the scene from external json files. */

import * as Globals from "../config/Globals";
import { RenderingGroups } from "../config/Globals";
import * as Animations from "./Animations/Animations";
import { Sphere } from "../Spheres/Sphere";
import * as SphereCollection from "../Spheres/SphereCollection";
import * as TriggerCollection from "../Triggers/TriggerCollection";

export var JSONData;

export function loadJSON(): void {
    /*
    Load data about the scene from external json files.
    */
    
    let jQuery = Globals.get("jQuery");
    let BABYLON = Globals.get("BABYLON");

    jQuery.get("data.json", (_data) => {
        JSONData = _data;
        
        // Load data about where to put signs.
        let signData = [];
        for (let i=0; i<JSONData["signs"].length; i++) {
            signData.push(JSONData["signs"][i])
        }
        Globals.set("signData", signData);

        // Load animation data
        Globals.set("animationData", JSONData["animations"]);
        Globals.set("firstFrameIndex", JSONData["firstFrameIndex"]);
        Globals.set("lastFrameIndex", JSONData["lastFrameIndex"]);
        Globals.set("nextMoves", JSONData["nextMoves"]);
        Globals.set("uniqID", JSONData["uniqID"]);
        // Globals.set("triggers", );
        TriggerCollection.create(JSONData["triggers"]);

        if (JSONData["pngFileSizes"] !== undefined) {
            // only defined if you've used optimize.py
            Globals.set("pngFileSizes", JSONData["pngFileSizes"]);
        }

        Globals.milestone("DataJsonLoadingStarted", true);
    });
}

export function afterSceneLoaded(): void {
    /*
    Runs after the scene has loaded. Adds guid spheres, clickable files,
    animated objects, etc.
    */
    
    if (Globals.delayExec(afterSceneLoaded,
                          ["BabylonSceneLoaded", "DataJsonLoadingStarted"], 
                          "afterSceneLoaded", 
                          this)) {
        return;
    }

    // if (Globals.get("debug")) {
    //     _addGuideSpheres();
    // }

    _loadClickableFiles();
    _loadAnimatedObjects();

    Globals.milestone("DataJsonLoadingDone", true);
}

// var _guideSpheres = [];
// var _guideSphereSize: number = 0.02;
// function _addGuideSpheres(): void {
//     /*
//     Adds guide spheres to the current scene. Useful for debugging. They show
//     the paths where the camera can move. Doesn't work.
//     */
    
//     let BABYLON = Globals.get("BABYLON");
//     let scene = Globals.get("scene");

//     // Add in guide spheres.
//     let sphereMat = new BABYLON.StandardMaterial("sphereMat" + Math.random().toString(), scene);
//     sphereMat.diffuseColor = new BABYLON.Color3(0, 0, 0);
//     sphereMat.specularColor = new BABYLON.Color3(0, 0, 0);
//     sphereMat.diffuseTexture = null;
//     sphereMat.emissiveTexture = null; //new BABYLON.Texture("dot.png", scene);
//     sphereMat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);

//     for (let i=0; i<data["viewerSpheres"].count(); i++) {
//         let sphereLoc = data["viewerSpheres"].getByIndex(i).position;
//         let sphere = BABYLON.Mesh.CreateDisc("guide_sphere" + i.toString(), 0.05, 12, scene, false, BABYLON.Mesh.DEFAULTSIDE);
//         sphere.material = sphereMat;
//         sphere.position.x = sphereLoc[0];
//         sphere.position.y = sphereLoc[2];  // note y and z reversed.
//         sphere.position.z = sphereLoc[1];
//         sphere.renderingGroupId = RenderingGroups.VisibleObjects;
//         sphere.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
//         _guideSpheres.push(sphere);
//     }
// }

function _loadClickableFiles(): void {
    /*
    Load and setup clickable objects. These are hidden objects that can be
    clicked. So if the user clicks on an environmental sphere at the right
    location, the correct clicked object can be detected.
    */
    
    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");

    // Load extra obj files
    let loader = new BABYLON.AssetsManager(scene);
    let objFilenames = JSONData["clickableFiles"];
    for (let i=0; i<objFilenames.length;i++) {
        let objFilename = objFilenames[i];
        let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
        meshTask.onSuccess = function (task) {
            let mesh = task.loadedMeshes[0];  // Why is this necessary?
            mesh.scaling.z = -1.0;
            mesh.renderingGroupId = RenderingGroups.ClickableObjects;
            mesh.isPickable = true;
        }
    }
    loader.load();

    // Make those meshes clickable
    _makeSomeMeshesClickable();
}

function _loadAnimatedObjects(): void {
    /*
    Loads objects that are animated.
    */

    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");
    let loader = new BABYLON.AssetsManager(scene);
    for (var objName in JSONData["animations"]) {
        if (JSONData["animations"].hasOwnProperty(objName)) {
            let objFilename = objName + "_mesh.obj";
            let meshTask = loader.addMeshTask(objFilename + "_name", "", "", objFilename);
            meshTask.onSuccess = function (task) {
                let mesh = task.loadedMeshes[0];  // Why is this necessary?
                mesh.scaling.z = -1.0;

                // console.log(mesh);
                mesh.renderingGroupId = RenderingGroups.VisibleObjects;  // In front of viewer sphere.
                mesh.isPickable = false;

                // Load texture here.
                let mat = new BABYLON.StandardMaterial(mesh.name + "_material" + Math.random().toString(), scene);
                mat.diffuseColor = new BABYLON.Color3(0, 0, 0);
                mat.specularColor = new BABYLON.Color3(0, 0, 0);
                mat.emissiveTexture = new BABYLON.Texture(mesh.name + "_mesh.png", scene);
                mat.diffuseTexture = null;
                mat.backFaceCulling = false;

                mesh.material = mat;
                
                // Setup animations. Currently hard coded. TODO: Need more
                // elegant solution here!!!
                let anim = new Animations.Animation(mesh); // , 1, 5, 10);
                // if (window.mesh ===undefined) {
                //     window.mesh = mesh;
                // }
                // anim.play(1, 5, 10.0);
                // setInterval(() => {
                //     anim.updatePos();
                // }, 10);
                // window.anim = anim;
                // console.log(mesh);
            }
        }
    }
    loader.load();    
}

var _timeOfLastClick: number = new Date().getTime();  // A refractory period
function _makeSomeMeshesClickable(): void {
    /*
    The code that detects mesh clicking.
    */

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