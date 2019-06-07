import { groundPointBelowCamera } from "../../Navigation/Points";
import * as VRML from "./VRML";

declare var WorkerGlobalScope;
declare var postMessage;

const DATA_CHUNK_SIZE = 100000;
let dataToSendBack = undefined;

const CONCAT_LIMIT = 60000;

// Determine if we're in a webworker. See
// https://stackoverflow.com/questions/7931182/reliably-detect-if-the-script-is-executing-in-a-web-worker
let inWebWorker = false;
if (typeof WorkerGlobalScope !== "undefined" && self instanceof WorkerGlobalScope) {
    inWebWorker = true;
}

// Get the data from the main thread, if webworker.
if (inWebWorker) {
    self.onmessage = (e) => {
        let cmd = e.data["cmd"];
        let data = e.data["data"];

        if (cmd === "start") {
            // This will populate dataToSendBack
            loadValsFromVRML(data);
            cmd = "sendDataChunk";
        }

        if (cmd === "sendDataChunk") {
            let chunkToSend = dataToSendBack.shift();
            let status = (dataToSendBack.length === 0) ? "done" : "more";
            postMessage({
                "chunk": chunkToSend,
                "status": status,
            });
        }
    };
}

/**
 * Load in values like coordinates and colors from the VRML string.
 * @param  {string} vrmlStr  The string containing the VRML data.
 * @returns Array<Object<string, Array<number>>>   The model data.
 */
export function loadValsFromVRML(vrmlStr: string): VRML.IVRMLModel[] {
    let modelData: VRML.IVRMLModel[] = [];

    // A given VRML file could have multiple IndexedFaceSets. Divide and
    // handle separately.
    let vrmlChunks = vrmlStr.split("geometry IndexedFaceSet {").splice(1);

    for (let idx in vrmlChunks) {
        if (vrmlChunks.hasOwnProperty(idx)) {
            let vrmlChunk = vrmlChunks[idx];
            let modelDatum: VRML.IVRMLModel = {
                colorsFlat: undefined,
                coorsFlat: undefined,
                normsFlat: undefined,
                trisIdxs: undefined,
            };

            // Get the coordinates.
            let coors = strToCoors(betweenbookends("point [", "]", vrmlChunk));
            // HOW TO CONVERT TO BABYLON.JS's LEFT-HANDED COORDINATE SYSTEM???
            coors = coors.map((c) => {
                return rightHandedToLeftHanded(c[0], c[1], c[2]);
            });
            modelDatum.coorsFlat = flatten(coors);
            modelDatum.coorsFlat = removeNonNumeric(modelDatum.coorsFlat);

            // Get the normals
            let norms = strToCoors(betweenbookends("vector [", "]", vrmlChunk));
            norms = norms.map((c) => {
                return rightHandedToLeftHanded(c[0], c[1], c[2]);
            });
            modelDatum.normsFlat = flatten(norms);
            modelDatum.normsFlat = removeNonNumeric(modelDatum.normsFlat);

            // Get the colors
            let colors = strToCoors(betweenbookends("color [", "]", vrmlChunk));
            colors = colors.map((c) => [c[0], c[1], c[2], 1]);
            modelDatum.colorsFlat = flatten(colors);
            modelDatum.colorsFlat = removeNonNumeric(modelDatum.colorsFlat);

            // Get the indexes of the triangles
            let trisIdxStr = betweenbookends("coordIndex [", "]", vrmlChunk);
            modelDatum.trisIdxs = trisIdxStr.split(",").map(
                (s) => parseInt(s, 10),
            ).filter(
                (s) => (s !== -1) && (!isNaN(s)) && (s !== undefined),
            );

            // Make sure string keys for closure compiler, since web worker is
            // external.
            modelData.push({
                "colorsFlat": modelDatum.colorsFlat,
                "coorsFlat": modelDatum.coorsFlat,
                "normsFlat": modelDatum.normsFlat,
                "trisIdxs": modelDatum.trisIdxs,
            });
        }
    }

    // Now that you've collected all the data, go back and translate all the
    // vertixes so Center the coordinates at the origin. Makes it easier to
    // pivot at geometric center.
    modelData = translateBeforeBabylonImport(
        getGeometricCenter(modelData).map((s) => -s), modelData,
    );

    if (!inWebWorker) {
        return modelData;
    } else {
        // Now you need to chunk all the data. This is because you can only
        // transfer so much data back to the main thread at a time.
        dataToSendBack = [];
        let dataTypes = ["colorsFlat", "coorsFlat", "normsFlat", "trisIdxs"];
        for (let modelIdx in modelData) {
            if (modelData.hasOwnProperty(modelIdx)) {
                for (let idx2 in dataTypes) {
                    if (dataTypes.hasOwnProperty(idx2)) {
                        let dataType = dataTypes[idx2];
                        let chunks = chunk(modelData[modelIdx][dataType]);
                        for (let chunkIdx in chunks) {
                            if (chunks.hasOwnProperty(chunkIdx)) {
                                let chunk = chunks[chunkIdx];
                                dataToSendBack.push([parseInt(modelIdx, 10), dataType, chunk]);
                            }
                        }
                    }
                }
            }
        }
        return [];
    }
}

/**
 * Divides an array into an array of arrays.
 * @param  {Array<*>} arr  The original array.
 * @returns {Array<Array<*>>}  The array of arrays.
 */
function chunk(arr: any[]): any[] {
    // See https://stackoverflow.com/questions/8495687/split-array-into-chunks
    let chunks = [];
    let i = 0;
    let n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += DATA_CHUNK_SIZE));
    }

    return chunks;
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
        return s.split(" ").map((s2) => parseFloat(s2));
    });
};

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
    if (strArr.length <= 1) {  // In case empty.
        return "";
    }
    strArr = strArr[1].split(bookend2, 2);
    let strBetween = strArr[0];
    return strBetween;
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

/**
 * Takes a list of lists of numbers and flattens it.
 * @param  {Array<Array<number>>} arr The array to flatten.
 * @returns Array<number> The flattened array.
 */
function flatten(arr: number[][]): number[] {
    // Works for both big and small arrays, and its fast.
    // let flattend = [];
    // for (let t = 0; t < arr.length; t = t + CONCAT_LIMIT) {
    //     let chunk = arr.slice(t, t + CONCAT_LIMIT);
    //     flattend = flattend.concat.apply([], chunk);
    // }
    // // console.log(flattend);
    // // for some reason this gives; a; different; answer; than; the; below; when; protein; all; sticks. Why ? ;
    // return flattend;

    // let flatten = [];
    // for (let t = 0; t < arr.length; t = t + CONCAT_LIMIT) {
    //     let chunk = arr.slice(t, t + CONCAT_LIMIT);
    //     flatten.push.apply(flatten, chunk);
    // }
    // return flatten;

    if (arr.length <= CONCAT_LIMIT) {
        // This method is about 10 times faster.
        return [].concat.apply([], arr);
    } else {
        console.log("large array");
        // This is three times slower, but it can handle larger data. Very unfortunate.
        let flattend = [];
        for (let i in arr) {
            if (arr.hasOwnProperty(i)) {
                let a = arr[i];
                // No concat because it copies to new variable...
                for (let i2 in a) {
                    if (a.hasOwnProperty(i2)) {
                        flattend.push(a[i2]);
                    }
                }
                // flattend.concat(a);  // much faster.
            }
        }
        return flattend;
    }
}

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
 * @param  {Array<number>}                         delta      The x, y, z to
 *                                                            translate.
 * @param  {Array<Object<string, Array<number>>>}  modelData  Information
 *                                                            about
 *                                                            coordinates,
 *                                                            norms, colors,
 *                                                            etc.
 * @returns Array<Object<string, Array<number>>>   Like model Data, but with
 *                                                 the coordinates translated.
 */
function translateBeforeBabylonImport(delta: number[], modelData: VRML.IVRMLModel[]): VRML.IVRMLModel[] {
    for (let modelIdx in modelData) {
        if (modelData.hasOwnProperty(modelIdx)) {
            modelData[modelIdx]["coorsFlat"] = modelData[modelIdx]["coorsFlat"].map(
                (v, idx) => v + delta[idx % 3],
            );
        }
    }

    return modelData;
}

/**
 * Calculate the geometric center of the coordinates.
 * @param  {Array<Object<string, Array<number>>>}  modelData  Information
 *                                                            about
 *                                                            coordinates,
 *                                                            norms, colors,
 *                                                            etc.
 * @returns Array<number> The x, y, z of the geometric center.
 */
function getGeometricCenter(modelData: VRML.IVRMLModel[]): number[] {
    // No coordinates... it's an empty mesh.
    if (modelData.length === 0) {
        return [0.0, 0.0, 0.0];
    }

    let coorCount = modelData.map((m) => m["coorsFlat"].length).reduce((a: number, b: number) => a + b);
    if (coorCount === 0) {
        // No coordinates... it's an empty mesh.
        return [0.0, 0.0, 0.0];
    }

    let xTotal = 0;
    let yTotal = 0;
    let zTotal = 0;

    for (let modelIdx in modelData) {
        if (modelData.hasOwnProperty(modelIdx)) {
            let modelDatum = modelData[modelIdx];

            // if (modelDatum["coorsFlat"].length > 0) {
            xTotal += modelDatum["coorsFlat"].map((v, idx) => (idx % 3 === 0) ? v : 0).reduce((a, c) => a + c);
            yTotal += modelDatum["coorsFlat"].map((v, idx) => (idx % 3 === 1) ? v : 0).reduce((a, c) => a + c);
            zTotal += modelDatum["coorsFlat"].map((v, idx) => (idx % 3 === 2) ? v : 0).reduce((a, c) => a + c);
            // }
        }
    }

    let numCoors = coorCount / 3.0;
    xTotal = xTotal / numCoors;
    yTotal = yTotal / numCoors;
    zTotal = zTotal / numCoors;

    return [xTotal, yTotal, zTotal];
}
