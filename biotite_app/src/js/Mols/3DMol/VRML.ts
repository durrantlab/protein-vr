// An module to manage VRML data obtained from 3Dmol.js. Assumes the 3Dmol.js
// javascript file is already loaded.

import { setMoleculeNameInfos } from "../../Navigation/VoiceCommands";
import * as Optimizations from "../../Scene/Optimizations";
import * as Vars from "../../Vars";
import * as CommonLoader from "../CommonLoader";
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
let meshScaling = undefined;
let meshTranslation = undefined;

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

export function setStyle(sels, rep) {
    viewer.setStyle(sels, rep);
    viewer.render();
}

export function addSurface(colorScheme, sels, callBack) {
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
 * @param  {Function(*)=}  callBack    The callback function, with the new
 *                                     mesh as a parameter.
 * @returns void
 */
export function render(updateData: boolean = true, callBack: any = () => { return; }): void {
    // Make sure there are no waiting menus up and running. Happens some
    // times.
    Vars.engine.hideLoadingUI();

    // Render the style
    // viewer.render();

    if (updateData) {
        // Load the data.
        loadVRMLFrom3DMol(() => {
            loadValsFromVRML(() => {
                // Could modify coordinates before importing into babylon
                // scene, so comment out below. Changed my mind the kinds of
                // manipulations above should be performed on the mesh.
                // Babylon is going to have better functions for this than I
                // can come up with.
                let newMesh = importIntoBabylonScene();

                positionMeshInsideAnother(newMesh, Vars.scene.getMeshByName("protein_box"));

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
 * @returns void
 */
function loadValsFromVRML(callBack: any): void {
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
 * Positions a given molecular mesh within a specified box..
 * @param  {any} babylonMesh       The molecular mesh.
 * @param  {any} otherBabylonMesh  The box.
 * @returns void
 */
export function positionMeshInsideAnother(babylonMesh: any, otherBabylonMesh: any): void {
    if (babylonMesh === undefined) {
        // No mesh exists.
        return;
    }

    // Make sure babylonMesh is not scaled or positioned. But note that
    // rotations are preserved.
    babylonMesh.scaling = new BABYLON.Vector3(1, 1, 1);
    babylonMesh.position = new BABYLON.Vector3(0, 0, 0);

    // Render to update the meshes
    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // If the required transformations have already been calculated, apply the
    // same ones.
    // console.log(meshScaling);
    // debugger;
    if (meshScaling === undefined) {
        // Get the bounding box of the other mesh and it's dimensions.
        let targetBox = otherBabylonMesh.getBoundingInfo().boundingBox;
        let targetBoxDimens = Object.keys(targetBox.maximumWorld).map(
            (k) => targetBox.maximumWorld[k] - targetBox.minimumWorld[k],
        );

        // Get the bounding box of this mesh.
        let thisBox = babylonMesh.getBoundingInfo().boundingBox;
        let thisBoxDimens = Object.keys(thisBox.maximumWorld).map(
            (k) => thisBox.maximumWorld[k] - thisBox.minimumWorld[k],
        );

        // Get the scales
        let scales = targetBoxDimens.map((targetBoxDimen, i) =>
            targetBoxDimen / thisBoxDimens[i],
        );

        // Get the minimum scale
        let minScale = Math.min.apply(null, scales);
        meshScaling = new BABYLON.Vector3(minScale, minScale, minScale);

        // Scale the mesh by that amount.
        babylonMesh.scaling = meshScaling;
        Vars.scene.render();  // Needed to get bounding box to recalculate.

        // Move the mesh into the target.
        meshTranslation = thisBox.centerWorld.subtract(targetBox.centerWorld);
        babylonMesh.position = babylonMesh.position.subtract(meshTranslation);
    } else {
        // Scaling and position already determined. So just use those.
        babylonMesh.scaling = meshScaling;
        babylonMesh.position = babylonMesh.position.subtract(meshTranslation);
    }

    // You need to recalculate the shadows.
    Optimizations.updateEnvironmentShadows();
}
