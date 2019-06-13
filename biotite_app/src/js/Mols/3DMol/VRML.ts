// An module to manage VRML data obtained from 3Dmol.js. Assumes the 3Dmol.js
// javascript file is already loaded.

import { setMoleculeNameInfos } from "../../Navigation/VoiceCommands";
import * as Optimizations from "../../Scene/Optimizations";
import * as Vars from "../../Vars";
import * as CommonLoader from "../CommonLoader";
import * as Visualize from "./Visualize";
import * as VRMLParserWebWorker from "./VRMLParserWebWorker";  // So you can access when no webworker support.

declare var BABYLON;
declare var jQuery;
declare var $3Dmol;

export interface IVRMLModel {
    coors: any;  // Float32Array
    colors: any;  // Float32Array
    trisIdxs: any;  // Uint32Array
}

let modelData: IVRMLModel[] = [];
let molRotation = new BABYLON.Vector3(0, 0, 0);

export let viewer;
let element;
let config;

let vrmlStr;
let vrmlParserWebWorker;
let pdbTxt = "";
let hasActiveSurface = false;

/**
 * Setup the ability to work with 3Dmol.js.
 * @param  {Function()} callBack  Runs once the iframe is loaded is loaded.
 * @returns void
 */
export function setup(callBack): void {
    // Add a container for 3dmoljs.
    addDiv();

    // Make the viewer object.
    element = jQuery("#mol-container");
    config = { backgroundColor: "white" };
    viewer = $3Dmol.createViewer( element, config );
    // jQuery("#mol-container canvas")["attr"]("style", extraStyle);
    window["viewer"] = viewer;  // For debugging.

    callBack();
}

/**
 * Add (or readd) div 3DMoljs div.
 * @returns void
 */
function addDiv(): void {
    let molContainer = jQuery("#mol-container");
    if (molContainer) {
        molContainer.remove();
    }

    let extraStyle = "display:none;";
    // let extraStyle = "width:150px; height:150px; z-index:150; position:fixed; top:0; left:0;";
    jQuery("body").append(`<div
        id="mol-container"
        class="mol-container"
        style="${extraStyle}"></div>`);
}

export function resetAll() {
    if (hasActiveSurface) {
        hasActiveSurface = false;

        // I can't get rid of the surfaces without causing
        // problems. I'm just going to go nuclear and reload the
        // whole thing.
        viewer = null;
        setup(() => {
            viewer.addModel( pdbTxt, "pdb" );
        });
    }

    viewer.setStyle({}, {});
}

/**
 * Load a file into the 3dmol object.
 * @param  {string}     url       The url.
 * @param  {Function()} callBack  A callback function.
 * @returns void
 */
export function loadPDBURL(url: string, callBack): void {
    jQuery.ajax( url, {
        "success": (data) => {
            // Setup the visualization
            pdbTxt = data;  // In case you need to restart.
            viewer.addModel( data, "pdb" );
            // viewer.zoomTo();

            // render();  // Use default style.
            // viewer.render();

            callBack();
        },
        "error": (hdr, status, err) => {
            console.error( "Failed to load PDB " + url + ": " + err );
        },
    });
}

/**
 * Set the style on the 3DMoljs viewer.
 * @param  {Object<*,*>} sels  A selection object.
 * @param  {Object<*,*>} rep   A representation object.
 * @returns void
 */
export function setStyle(sels: any, rep: any): void {
    viewer.setStyle(sels, rep);
    viewer.render();
}

/**
 * Add a surface to the 3DMoljs viewer.
 * @param  {Object<*,*>} colorScheme  A colorscheme object.
 * @param  {Object<*,*>} sels         A selection object.
 * @param  {Function()} callBack     A callback function.
 * @returns void
 */
export function addSurface(colorScheme: any, sels: any, callBack: any): void {
    hasActiveSurface = true;
    viewer.addSurface(
        $3Dmol.SurfaceType.MS,
        colorScheme,
        sels,
        undefined,
        undefined,
        () => {
            callBack();
        },
    );
}

/**
 * Sets the 3dmol.js style. Also generates a vrml string and values.
 * @param  {boolean=}      updateData  Whether to update the underlying data
 *                                     with this visualization. True by
 *                                     default.
 * @param  {string}        repName     The representative name. Like
 *                                     "Surface".
 * @param  {Function(*)=}  callBack    The callback function, with the new
 *                                     mesh as a parameter.
 * @returns void
 */
export function render(updateData: boolean = true, repName: string, callBack: any = () => { return; }): void {
    // Make sure there are no waiting menus up and running. Happens some
    // times.
    Vars.engine.hideLoadingUI();

    // Render the style
    // viewer.render();

    if (updateData) {
        // Load the data.
        loadVRMLFrom3DMol(() => {
            loadValsFromVRML(repName, () => {
                // Could modify coordinates before importing into babylon
                // scene, so comment out below. Changed my mind the kinds of
                // manipulations above should be performed on the mesh.
                // Babylon is going to have better functions for this than I
                // can come up with.
                let newMesh = importIntoBabylonScene();

                positionAll3DMolMeshInsideAnother(newMesh, Vars.scene.getMeshByName("protein_box"));

                callBack(newMesh);  // Cloned so it won't change with new rep in future.

                // Clean up.
                modelData = [];
            });
        });
    }
}

/**
 * Loads the VRML string from the 3Dmol instance.
 * @param  {Function(*)=}  callBack    The callback function.
 * @returns void
 */
function loadVRMLFrom3DMol(callBack): void {
    // Make the VRML string from that model.
    vrmlStr = viewer.exportVRML();
    callBack();
}

/**
 * Load in values like coordinates and colors from the VRML string.
 * @param  {string}  repName  The representative name. Like "Surface".
 * @returns void
 */
function loadValsFromVRML(repName: string, callBack: any): void {
    // Clear previous model data.
    modelData = [];

    if (typeof(Worker) !== "undefined") {
        if (typeof(vrmlParserWebWorker) === "undefined") {
            vrmlParserWebWorker = new Worker("VRMLParserWebWorker.js");
        }

        vrmlParserWebWorker.onmessage = (event) => {
            // Msg back from web worker
            let resp = event.data;
            let chunk = resp["chunk"];
            let status = resp["status"];
            let modelIdx = chunk[0];
            let dataType = chunk[1];
            let vals = chunk[2];

            if (modelData.length === modelIdx) {
                modelData.push({
                    "coors": new Float32Array(0),
                    "colors": new Float32Array(0),
                    "trisIdxs": new Uint32Array(0),
                });
            }

            modelData[modelIdx][dataType] = typedArrayConcat(
                dataType === "trisIdxs" ? Uint32Array : Float32Array,
                [modelData[modelIdx][dataType], vals],
            );

            switch (status) {
                case "more":
                    // There's more data. Request it now.
                    vrmlParserWebWorker.postMessage({
                        "cmd": "sendDataChunk",
                        "data": undefined,
                    });
                    break;
                case "done":
                    // No more data. Run the callback.
                    // console.log(modelData);
                    callBack();
                    break;
                default:
                    console.log("Error here!");
            }
        };

        // Send message to web worker.
        vrmlParserWebWorker.postMessage({
            "cmd": "start",
            "data": vrmlStr,
            "removeExtraPts": (repName === "Stick"),
        });
    } else {
        // Sorry! No Web Worker support..
        modelData = VRMLParserWebWorker.loadValsFromVRML(vrmlStr);
        callBack();
    }
}

/**
 * Concatonates a list of typed arrays.
 * @param  {} resultConstructor  The type of array. E.g., Uint8Array.
 * @param  {} listOfArrays       A list of typed arrays to concatonate.
 * @returns any The typed array.
 */
function typedArrayConcat(resultConstructor, listOfArrays): any {
    // See http://2ality.com/2015/10/concatenating-typed-arrays.html
    let totalLength = 0;
    for (let arr of listOfArrays) {
        totalLength += arr.length;
    }
    let result = new resultConstructor(totalLength);
    let offset = 0;
    for (let arr of listOfArrays) {
        result.set(arr, offset);
        offset += arr.length;
    }
    return result;
}

/**
 * Creates a babylonjs object from the values and adds it to the babylonjs
 * scene.
 * @returns {*} The new mesh from the 3dmoljs instance.
 */
export function importIntoBabylonScene(): any {
    let meshes = [];
    for (let modelIdx in modelData) {
        if (modelData.hasOwnProperty(modelIdx)) {
            let modelDatum = modelData[modelIdx];

            // Calculate normals instead? It's not necessary. Doesn't chang over
            // 3dmoljs calculated normals.
            let norms = [];
            BABYLON.VertexData.ComputeNormals(
                modelDatum["coors"], modelDatum["trisIdxs"], norms,
            );

            // Compile all that into vertex data.
            let vertexData = new BABYLON.VertexData();
            vertexData["positions"] = modelDatum["coors"];  // In quotes because from webworker (external)
            vertexData["indices"] = modelDatum["trisIdxs"];
            vertexData["normals"] = norms;
            vertexData["colors"] = modelDatum["colors"];

            // Delete the old mesh if it exists.
            // if (Vars.scene.getMeshByName("MeshFrom3DMol") !== null) {
            //     Vars.scene.getMeshByName("MeshFrom3DMol").dispose();
            // }

            // Make the new mesh
            let babylonMeshTmp = new BABYLON.Mesh("mesh_3dmol_tmp" + modelIdx, Vars.scene);
            vertexData.applyToMesh(babylonMeshTmp);

            // Add a material.
            let mat = new BABYLON.StandardMaterial("Material", Vars.scene);
            mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
            mat.emissiveColor = new BABYLON.Color3(0, 0, 0);
            mat.specularColor = new BABYLON.Color3(0, 0, 0);
            // mat.sideOrientation = BABYLON.Mesh.FRONTSIDE;
            // mat.sideOrientation = BABYLON.Mesh.BACKSIDE;
            babylonMeshTmp.material = mat;

            meshes.push(babylonMeshTmp);
        }
    }

    let babylonMesh;
    if (meshes.length > 0) {
        // Merge all these meshes.
        // https://doc.babylonjs.com/how_to/how_to_merge_meshes
        babylonMesh = BABYLON.Mesh.MergeMeshes(meshes, true, true);  // dispose of source and allow 32 bit integers.
        // babylonMesh = meshes[0];
        babylonMesh.name = "MeshFrom3DMol" + Math.random().toString();
        babylonMesh.id = babylonMesh.name;

        // Work here
        CommonLoader.setupMesh(
            babylonMesh, babylonMesh.name, "Skip", 123456789,
        );
    }

    return babylonMesh;
}

/**
 * Rotate the molecular meshes.
 * @param  {string} axis    The axis. "x", "y", or "z".
 * @param  {number} amount  The amount. In radians, I think.
 * @returns void
 */
export function setMolRotation(axis: string, amount: number): void {
    molRotation[axis] += amount;
}

/**
 * Positions a given molecular mesh within a specified box.
 * @param  {any} babylonMesh       The molecular mesh.
 * @param  {any} otherBabylonMesh  The box.
 * @returns void
 */
export function positionAll3DMolMeshInsideAnother(babylonMesh: any, otherBabylonMesh: any): void {
    // Reset the scaling, position, and rotation of all the visible molecular
    // meshes.
    let allVisMolMeshes = [];
    for (let molMeshId in Visualize.styleMeshes) {
        if (Visualize.styleMeshes.hasOwnProperty(molMeshId)) {
            let allVisMolMesh = Visualize.styleMeshes[molMeshId].mesh;

            if (allVisMolMesh.isVisible === true) {
                // Make sure allVisMolMesh is not scaled or positioned. But
                // note that rotations are preserved.
                allVisMolMesh.scaling = new BABYLON.Vector3(1, 1, 1);
                allVisMolMesh.position = new BABYLON.Vector3(0, 0, 0);
                allVisMolMesh.rotation = molRotation;
                allVisMolMesh.visibility = 0;  // Hide while rotating.
                allVisMolMeshes.push(allVisMolMesh);
            }
        }
    }

    // Add the current one (just added).
    if (babylonMesh !== undefined) {
        babylonMesh.scaling = new BABYLON.Vector3(1, 1, 1);
        babylonMesh.position = new BABYLON.Vector3(0, 0, 0);
        babylonMesh.rotation = molRotation;
        allVisMolMeshes.push(babylonMesh);
    }

    if (allVisMolMeshes.length === 0) {
        // No meshes to show.
        return;
    }

    // Render to update the meshes
    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Get the bounding box of the other mesh and it's dimensions
    // (protein_box).
    let targetBox = otherBabylonMesh.getBoundingInfo().boundingBox;
    let targetBoxDimens = Object.keys(targetBox.maximumWorld).map(
        (k) => targetBox.maximumWorld[k] - targetBox.minimumWorld[k],
    );

    // Get the molecular model with the biggest volume.
    let maxVol = 0.0;
    let thisBox;
    let thisBoxDimens;
    for (let allVisMolMeshIdx in allVisMolMeshes) {
        if (allVisMolMeshes.hasOwnProperty(allVisMolMeshIdx)) {
            let allVisMolMesh = allVisMolMeshes[allVisMolMeshIdx];

            // Get the bounding box of this mesh.
            let thisBoxTmp = allVisMolMesh.getBoundingInfo().boundingBox;
            let thisBoxDimensTmp = Object.keys(thisBoxTmp.maximumWorld).map(
                (k) => thisBoxTmp.maximumWorld[k] - thisBoxTmp.minimumWorld[k],
            );
            let volume = thisBoxDimensTmp[0] * thisBoxDimensTmp[1] * thisBoxDimensTmp[2];

            if (volume > maxVol) {
                maxVol = volume;
                thisBox = thisBoxTmp;
                thisBoxDimens = thisBoxDimensTmp;
            }
        }
    }

    // Get the scales
    let scales = targetBoxDimens.map((targetBoxDimen, i) =>
        targetBoxDimen / thisBoxDimens[i],
    );

    // Get the minimum scale
    let minScale = Math.min.apply(null, scales);
    let meshScaling = new BABYLON.Vector3(minScale, minScale, minScale);

    // Scale the meshes.
    for (let allVisMolMeshIdx in allVisMolMeshes) {
        if (allVisMolMeshes.hasOwnProperty(allVisMolMeshIdx)) {
            let allVisMolMesh = allVisMolMeshes[allVisMolMeshIdx];
            allVisMolMesh.scaling = meshScaling;
        }
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Translate the meshes.
    let meshTranslation = thisBox.centerWorld.subtract(targetBox.centerWorld);
    for (let allVisMolMeshIdx in allVisMolMeshes) {
        if (allVisMolMeshes.hasOwnProperty(allVisMolMeshIdx)) {
            let allVisMolMesh = allVisMolMeshes[allVisMolMeshIdx];
            allVisMolMesh.position = allVisMolMesh.position.subtract(meshTranslation);
            allVisMolMesh.visibility = 1;  // Hide while rotating.
        }
    }

    // You need to recalculate the shadows.
    Optimizations.updateEnvironmentShadows();
}
