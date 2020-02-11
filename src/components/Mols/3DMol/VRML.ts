// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


// An module to manage VRML data obtained from 3Dmol.js. Assumes the 3Dmol.js
// javascript file is already loaded.

import * as UrlVars from "../../Vars/UrlVars";
import * as Vars from "../../Vars/Vars";
import * as Load from "../Load";
import * as PositionInScene from "./PositionInScene";
import * as OpenPopup from "../../UI/OpenPopup/OpenPopup";

declare var $3Dmol;

declare var BABYLON: any;
declare var jQuery: any;

export interface IVRMLModel {
    coors: any;  // Float32Array
    colors: any;  // Float32Array
    trisIdxs: any;  // Uint32Array
}

/** @type {Array<Object<string,*>>} */
let modelData: IVRMLModel[] = [];

export let molRotation: any = new BABYLON.Vector3(0, 0, 0);

export let viewer: any;
let element: any;

/** @type {Object<string,string>} */
let config: any;

/** @type {string} */
let vrmlStr: string;

const vrmlParserWebWorker = new Worker("vrmlWebWorker.js");

let molTxt = "";
let molTxtType = "pdb";
let hasActiveSurface = false;

/**
 * Setup the ability to work with 3Dmol.js.
 * @param  {Function} callBack  Runs once the iframe is loaded is loaded.
 * @returns void
 */
export function setup(callBack: any): void {
    // Deactivate 3Dmol.js tracking. This is now done via manual modifications
    // to the vendor.js code itself.
    // $3Dmol["notrack"] = true;

    // Add a container for 3dmoljs.
    addDiv();

    // Make the viewer object.
    element = jQuery("#mol-container");
    config = { backgroundColor: "white" };
    viewer = $3Dmol.createViewer( element, config );
    window["viewer"] = viewer;  // For debugging.

    callBack();
}

/**
 * Add (or readd) div 3DMoljs div.
 * @returns void
 */
function addDiv(): void {
    const molContainer = jQuery("#mol-container");
    if (molContainer) {
        molContainer.remove();
    }

    const extraStyle = "display:none;";
    jQuery("body").append(`<div
        id="mol-container"
        class="mol-container"
        style="${extraStyle}"></div>`);
}

/**
 * Resets the 3Dmol.js visualization.
 * @returns void
 */
export function resetAll(): void {
    if (hasActiveSurface) {
        hasActiveSurface = false;

        // I can't get rid of the surfaces without causing
        // problems. I'm just going to go nuclear and reload the
        // whole thing.
        viewer = null;
        setup(() => {
            viewer.addModel(molTxt, "pdb", {"keepH": true});
        });
    }

    viewer.setStyle({}, {});
}

/**
 * Load a file into the 3dmol object.
 * @param  {string}   url       The url.
 * @param  {Function} callBack  A callback function. The 3DMoljs molecule
 *                              object is the parameter.
 * @returns void
 */
export function loadPDBURL(url: string, callBack: any): void {
    jQuery.ajax( url, {

        /**
         * When the url data is retrieved.
         * @param  {string} data  The remote data.
         * @returns void
         */
        "success": (data: string): void => {
            // Setup the visualization
            /** @type {string} */
            molTxt = data;  // In case you need to restart.
            molTxtType = "pdb";

            if (url.slice(url.length - 3).toLowerCase() === "sdf") {
                molTxtType = "sdf";
            }

            const mdl = viewer.addModel(data, molTxtType, {"keepH": true});

            callBack(mdl);
        },

        /**
         * If there's an error...
         * @param  {*}       hdr
         * @param  {*}       status
         * @param  {string}  err
         */
        "error": (hdr: any, status: any, err: any) => {
            let msg = "<p>Could not load molecule: " + url + "</p>";
            msg += "<p><pre>" + err + "</pre></p>";
            msg += '<p>(<a href="' + window.location.href.split("?")[0] + '">Click to restart...</a>)</p>';
            OpenPopup.openModal("Error Loading Molecule", msg, false, false, true);
        },
    });
}

/**
 * Set the style on the 3DMoljs viewer.
 * @param  {Object<string,*>} sels  A selection object.
 * @param  {Object<string,*>} rep   A representation object.
 * @returns void
 */
export function setStyle(sels: any, rep: any): void {
    // If the selection looks like {"and":[{}, {...}]}, simplify it.
    if ((sels["and"] !== undefined) &&                // "and" is a key
        (Object.keys(sels).length === 1) &&           // it is the only key
        (JSON.stringify(sels["and"][0]) === "{}") &&  // it points to a list with {} as first item.
        (sels["and"].length === 2)) {                 // that list has only to elements

        sels = sels["and"][1];
    }

    // You need to make sure the selection isn't empty.
    let numAtoms = viewer.selectedAtoms(sels).length;
    if (numAtoms === 0) {
        // No atoms in selection.
        return;
    }

    viewer.setStyle(sels, rep);
    viewer.render();
}

/**
 * Add a surface to the 3DMoljs viewer.
 * @param  {Object<string,*>} colorScheme  A colorscheme object.
 * @param  {Object<string,*>} sels         A selection object.
 * @param  {Function}         callBack     A callback function.
 * @returns void
 */
export function addSurface(colorScheme: any, sels: any, callBack: any): void {
    // You need to make sure the selection isn't empty.
    let numAtoms = viewer.selectedAtoms(sels).length;
    if (numAtoms === 0) {
        // No atoms in selection.
        return;
    }

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
 * @param  {boolean}    updateData  Whether to update the underlying data with
 *                                  this visualization. True by default.
 * @param  {string}     repName     The representative name. Like "Surface".
 * @param  {Function=}  callBack    The callback function, with the new mesh
 *                                  as a parameter.
 * @returns void
 */
export function render(updateData: boolean, repName: string, callBack: any = () => { return; }): void {
    // Make sure there are no waiting menus up and running. Happens some
    // times.
    Vars.engine.hideLoadingUI();

    if (updateData) {
        // Load the data.
        loadVRMLFrom3DMol(() => {
            loadValsFromVRML(repName, () => {
                // Could modify coordinates before importing into babylon
                // scene, so comment out below. Changed my mind the kinds of
                // manipulations above should be performed on the mesh.
                // Babylon is going to have better functions for this than I
                // can come up with.
                const newMesh = importIntoBabylonScene();

                if (newMesh !== undefined) {
                    // It's undefined if, for example, trying to do cartoon on
                    // ligand.
                    PositionInScene.positionAll3DMolMeshInsideAnother(newMesh, Vars.scene.getMeshByName("protein_box"));
                }

                callBack(newMesh);  // Cloned so it won't change with new rep in future.

                // Clean up.
                modelData = [];
            });
        });
    }
}

/**
 * Loads the VRML string from the 3Dmol instance.
 * @param  {Function=}  callBack    The callback function.
 * @returns void
 */
function loadVRMLFrom3DMol(callBack: any): void {
    // Make the VRML string from that model.
    /** @type {string} */
    vrmlStr = viewer.exportVRML();
    callBack();
}

/**
 * Load in values like coordinates and colors from the VRML string.
 * @param  {string}    repName   The representative name. Like "Surface".
 * @param  {Function}  callBack  A callback function.
 * @returns void
 */
function loadValsFromVRML(repName: string, callBack: any): void {
    // Clear previous model data.
    modelData = [];

    if (typeof(Worker) !== "undefined") {
        vrmlParserWebWorker.onmessage = (event: any) => {
            // Msg back from web worker
            /** @type {Object<string,*>} */
            const resp = event.data;

            const chunk = resp["chunk"];

            /** @type {string} */
            const status = resp["status"];

            if (chunk !== undefined) {
                /** @type {number} */
                const modelIdx: number = chunk[0];

                /** @type {string} */
                const dataType = chunk[1];

                const vals = chunk[2];

                while (modelData.length <= modelIdx) {
                // if (modelData.length === modelIdx) {
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
            }

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
                    callBack();
                    break;
                default:
                    console.log("Error here!");
            }
        };

        // Send message to web worker.
        // debugger;
        vrmlParserWebWorker.postMessage({
            "cmd": "start",
            "data": vrmlStr,
            "removeExtraPts": (repName === "Stick"),
        });
    } else {
        // Sorry! No Web Worker support..
        OpenPopup.openModal(
            "Browser Error",
            `Your browser does not support web workers. Please use a more
            modern browser when running ProteinVR.`,
            false
        );
        throw new Error("Browser does not support web workers.");

        // Comment below if you ever want to try to make it work without web
        // workers...
        // modelData = VRMLParserWebWorker.loadValsFromVRML(vrmlStr);
        // callBack();
    }
}

/**
 * Concatonates a list of typed arrays.
 * @param  {*}        resultConstructor  The type of array. E.g., Uint8Array.
 * @param  {Array<*>} listOfArrays       A list of typed arrays to
 *                                       concatonate.
 * @returns {*} The typed array.
 */
function typedArrayConcat(resultConstructor: any, listOfArrays: any[]): any {
    // See http://2ality.com/2015/10/concatenating-typed-arrays.html
    let totalLength = 0;

    /** @type {number} */
    const listOfArraysLen = listOfArrays.length;
    for (let i = 0; i < listOfArraysLen; i++) {
        /** @type {Array<*>} */
        const arr = listOfArrays[i];
        totalLength += arr.length;
    }

    const result = new resultConstructor(totalLength);
    let offset = 0;
    for (let i = 0; i < listOfArraysLen; i++) {
        /** @type {Array<*>} */
        const arr = listOfArrays[i];
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
    // The material to add to all meshes.
    const mat = new BABYLON.StandardMaterial("Material", Vars.scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    mat.specularColor = new BABYLON.Color3(0, 0, 0);

    const meshes = [];

    /** @type {number} */
    const len = modelData.length;

    for (let modelIdx = 0; modelIdx < len; modelIdx++) {
        const modelDatum = modelData[modelIdx];

        // Calculate normals instead? It's not necessary. Doesn't chang over
        // 3dmoljs calculated normals.
        const norms: any[] = [];
        BABYLON.VertexData.ComputeNormals(
            modelDatum["coors"], modelDatum["trisIdxs"], norms,
        );

        // Compile all that into vertex data.
        const vertexData = new BABYLON.VertexData();
        vertexData["positions"] = modelDatum["coors"];  // In quotes because from webworker (external)
        vertexData["indices"] = modelDatum["trisIdxs"];
        vertexData["normals"] = norms;
        vertexData["colors"] = modelDatum["colors"];

        // Make the new mesh
        const babylonMeshTmp = new BABYLON.Mesh("mesh_3dmol_tmp" + modelIdx, Vars.scene);
        vertexData.applyToMesh(babylonMeshTmp);

        // Add a material.
        babylonMeshTmp.material = mat;
        // babylonMeshTmp.showBoundingBox = true;

        meshes.push(babylonMeshTmp);
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
        Load.setupMesh(babylonMesh, 123456789);
    }

    return babylonMesh;
}

/**
 * Rotate the molecular meshes.
 * @param  {string} axis    The axis. "x", "y", or "z".
 * @param  {number} amount  The amount. In radians, I think.
 * @returns void
 */
export function updateMolRotation(axis: string, amount: number): void {
    molRotation[axis] += amount;

    // Update URL too.
    UrlVars.setURL();
}

/**
 * Sets the molRotation object externally. Does not actually rotate anything.
 * @param  {number} x  Rotation about x axis.
 * @param  {number} y  Rotation about y axis.
 * @param  {number} z  Rotation about z axis.
 * @returns void
 */
export function setMolRotation(x: number, y: number, z: number): void {
    molRotation = new BABYLON.Vector3(x, y, z);
}
