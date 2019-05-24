// An module to manage VRML data obtained from 3Dmol.js. Assumes the 3Dmol.js
// javascript file is already loaded.

import * as Vars from "../Vars";
import * as Optimizations from "../VR/Optimizations";
import * as CommonLoader from "./CommonLoader";

declare var BABYLON;
declare var jQuery;
declare var $3Dmol;

let coorsFlat;
let normsFlat;
let colorsFlat;
let trisIdxs;

let viewer;
let vrmlStr;

export let babylonMesh;

/**
 * Setup the ability to work with 3Dmol.js.
 * @returns void
 */
export function setup(): void {
    // Add a container for 3dmoljs.
    jQuery("body").append(`<div
        id="mol-container"
        class="mol-container"
        style="display:none;"></div>`);

    // Make the viewer object.
    let element = jQuery("#mol-container");
    let config = { backgroundColor: "white" };
    viewer = $3Dmol.createViewer( element, config );
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
            viewer.addModel( data, "pdb" );
            // setStyle();  // Use default style.
            // viewer.render();

            callBack();
        },
        "error": (hdr, status, err) => {
            console.error( "Failed to load PDB " + url + ": " + err );
        },
    });
}

/**
 * Sets the 3dmol.js style. Also generates a vrml string and values.
 * @param  {Object<*,*>=} atomSel     The 3Dmol.js atom selection.
 * @param  {Object<*,*>=} style       The 3dmol.js style.
 * @param  {boolean=}     updateData  Whether to update the underlying data
 *                                    with this visualization. True by
 *                                    default.
 * @returns void
 */
export function setStyle(atomSel: any = undefined, style: any = undefined, updateData: boolean = true): void {
    // set defaults.
    atomSel = (atomSel === undefined) ? {} : atomSel;
    style = (style === undefined) ? {"cartoon": {"color": "spectrum"}} : style;

    // Render the style
    viewer.setStyle(atomSel, style);
    viewer.render();

    if (updateData) {
        // Load the data.
        loadVRMLFrom3DMol();
        loadValsFromVRML();

        // Could modify coordinates before importing into babylon scene, so
        // comment out below. Changed my mind the kinds of manipulations above
        // should be performed on the mesh. Babylon is going to have better
        // functions for this than I can come up with.
        importIntoBabylonScene();
    }
}

/**
 * Loads the VRML string from the 3Dmol instance.
 * @returns void
 */
function loadVRMLFrom3DMol(): void {
    // Make the VRML string from that model.
    vrmlStr = viewer.exportVRML();
}

/**
 * Load in values like coordinates and colors from the VRML string.
 * @returns void
 */
function loadValsFromVRML(): void {
    // Get the coordinates.
    let coors = strToCoors(betweenbookends("point [", "]", vrmlStr));
    // HOW TO CONVERT TO BABYLON.JS's LEFT-HANDED COORDINATE SYSTEM???
    coors = coors.map((c) => {
        return rightHandedToLeftHanded(c[0], c[1], c[2]);
    });
    coorsFlat = flatten(coors);
    coorsFlat = removeNonNumeric(coorsFlat);

    // Center the coordinates at the origin. Makes it easier to pivot at
    // geometric center.
    translateBeforeBabylonImport(getGeometricCenter().map((s) => -s));

    // Get the normals
    let norms = strToCoors(betweenbookends("vector [", "]", vrmlStr));
    normsFlat = flatten(norms);
    normsFlat = removeNonNumeric(normsFlat);

    // Get the colors
    let colors = strToCoors(betweenbookends("color [", "]", vrmlStr));
    colors = colors.map((c) => [c[0], c[1], c[2], 1]);
    colorsFlat = flatten(colors);
    colorsFlat = removeNonNumeric(colorsFlat);

    // Get the indexes of the triangles
    let trisIdxStr = betweenbookends("coordIndex [", "]", vrmlStr);
    trisIdxs = trisIdxStr.split(",").map(
        (s) => parseInt(s, 10),
    ).filter(
        (s) => (s !== -1) && (!isNaN(s)) && (s !== undefined),
    );

    // Calculate normals instead? It's not necessary. Doesn't chang over
    // 3dmoljs calculated normals.
    // norms = [];
    // BABYLON.VertexData.ComputeNormals(coorsFlat, trisIdxs, norms);
}

/**
 * Creates a babylonjs object from the values and adds it to the babylonjs
 * scene.
 * @returns void
 */
export function importIntoBabylonScene(): void {
    // Compile all that into vertex data.
    let vertexData = new BABYLON.VertexData();
    vertexData["positions"] = coorsFlat;
    vertexData["indices"] = trisIdxs;
    vertexData["normals"] = normsFlat;
    vertexData["colors"] = colorsFlat;

    // Make a mesh
    babylonMesh = new BABYLON.Mesh("MeshFrom3DMol", Vars.scene);
    vertexData.applyToMesh(babylonMesh);

    // Add a material.
    let mat = new BABYLON.StandardMaterial("Material", Vars.scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.emissiveColor = new BABYLON.Color3(0, 0, 0);
    mat.specularColor = new BABYLON.Color3(0, 0, 0);
    mat.sideOrientation = BABYLON.Mesh.FRONTSIDE;
    // mat.sideOrientation = BABYLON.Mesh.BACKSIDE;
    babylonMesh.material = mat;

    // Work here
    CommonLoader.setupMesh(
        babylonMesh, "MeshFrom3DMol", "Skip", 123456789,
    );
}

export function positionMeshInsideAnother(otherBabylonMesh: any): void {
    // Make sure babylonMesh is not scaled or positioned. But note that
    // rotations are preserved.
    babylonMesh.scaling = new BABYLON.Vector3(1, 1, 1);
    babylonMesh.position = new BABYLON.Vector3(0, 0, 0);

    // Render to update the meshes
    Vars.scene.render();  // Needed to get bounding box to recalculate.

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

    // Scale the mesh by that amount.
    babylonMesh.scaling = new BABYLON.Vector3(minScale, minScale, minScale);
    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Move the mesh into the target.
    let delta = thisBox.centerWorld.subtract(targetBox.centerWorld);
    babylonMesh.position = babylonMesh.position.subtract(delta);

    // You need to recalculate the shadows.
    Optimizations.updateEnvironmentShadows();
}

/**
 * Scale a model before importing it into babylon.
 * @param  {number} scaleFactor The scaling factor.
 * @returns void
 */
// export function scaleBeforeBabylonImport(scaleFactor: number): void {
//     coorsFlat = coorsFlat.map((v) => v * scaleFactor);
// }
// export function rotateBeforeBabylonImport(delta: number[]): void {}

/**
 * Removes undefined and NaN values from a list of numbers.
 * @param  {Array<number>} arr The original list.
 * @returns numbers            A new list, with undefined and NaN removed.
 */
function removeNonNumeric(arr: number[]): number[] {
    return arr.filter(
        (s) => (!isNaN(s)) && (s !== undefined),
    );
}

/**
 * Translate the coordinates before babylon import.
 * @param  {Array<number>} delta  The x, y, z to translate.
 * @returns void
 */
function translateBeforeBabylonImport(delta: number[]): void {
    coorsFlat = coorsFlat.map((v, idx) => v + delta[idx % 3]);
}

/**
 * Calculate the geometric center of the coordinates.
 * @returns Array<number> The x, y, z of the geometric center.
 */
function getGeometricCenter(): number[] {
    let x = coorsFlat.map((v, idx) => (idx % 3 === 0) ? v : 0).reduce((a, c) => a + c);
    let y = coorsFlat.map((v, idx) => (idx % 3 === 1) ? v : 0).reduce((a, c) => a + c);
    let z = coorsFlat.map((v, idx) => (idx % 3 === 2) ? v : 0).reduce((a, c) => a + c);

    let numCoors = coorsFlat.length / 3.0;
    x = x / numCoors;
    y = y / numCoors;
    z = z / numCoors;

    return [x, y, z];
}

/**
 * Gets the text betwen two strings.
 * @param  {string} bookend1 The first string.
 * @param  {string} bookend2 The second string.
 * @param  {string} str      The entire text to consider.
 * @returns string           The portion of str between bookend1 and bookend2.
 */
function betweenbookends(bookend1: string, bookend2: string, str: string): string {
    // Find the text between two bookends.
    let strArr = str.split(bookend1, 2);
    strArr = strArr[1].split(bookend2, 2);
    let strBetween = strArr[0];
    return strBetween;
}

/**
 * Converts coordinats in string format to list of lists of numbers.
 * @param  {string} str The coordinates in string format.
 * @returns Array<Array<number>> The list of lists.
 */
function strToCoors(str: string): number[][] {
    // Convert coordinates in string form to arrays.
    return str.split(",").map((s) => {
        s = s.replace(/\n/g, "").replace(/^ +/gm, "");
        return s.split(" ").map((s) => parseFloat(s));
    });
}

/**
 * Takes a list of lists of numbers and flattens it.
 * @param  {Array<Array<number>>} arr The array to flatten.
 * @returns Array<number> The flattened array.
 */
function flatten(arr: number[][]): number[] {
    return [].concat.apply([], arr);
}

/**
 * Converts a right-handed coordinate to a left-handed coordinate.
 * @param  {number} x The x coordinate of the right-handed coordinate.
 * @param  {number} y The y coordinate of the right-handed coordinate.
 * @param  {number} z The z coordinate of the right-handed coordinate.
 * @returns Array<number> An array containing the x, y, z coordinates using a
 *                        left-handed coordinate system.
 */
function rightHandedToLeftHanded(x, y, z): number[] {
    // Not 100% sure this works, but I think it might...

    // return [x, y, z];
    // return [y, x, z];
    return [z, y, x];  // This one
    // return [x, z, y];
}
