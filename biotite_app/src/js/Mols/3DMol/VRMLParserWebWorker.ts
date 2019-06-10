import { groundPointBelowCamera } from "../../Navigation/Points";
import * as VRML from "./VRML";

declare var WorkerGlobalScope;
declare var postMessage;

const DATA_CHUNK_SIZE = 10000000;
let dataToSendBack = undefined;
let numRegex = new RegExp("(^|-| )[0-9\.]{1,8}", "g");
let geoCenter = undefined;

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

            // Make sure string keys for closure compiler, since web worker is
            // external.
            modelData.push({
                "colors": strToColors(betweenbookends("color [", "]", vrmlChunk)),
                "coors": strToCoors(betweenbookends("point [", "]", vrmlChunk)),
                "norms": strToCoors(betweenbookends("vector [", "]", vrmlChunk)),
                "trisIdxs": strToTris(betweenbookends("coordIndex [", "]", vrmlChunk)),
            });
        }
    }

    // Now that you've collected all the data, go back and translate all the
    // vertixes so Center the coordinates at the origin. Makes it easier to
    // pivot at geometric center.
    if (geoCenter === undefined) {
        geoCenter = getGeometricCenter(modelData);
    }
    modelData = translateBeforeBabylonImport(geoCenter, modelData);

    if (!inWebWorker) {
        return modelData;
    } else {
        // Now you need to chunk all the data. This is because you can only
        // transfer so much data back to the main thread at a time.
        dataToSendBack = [];
        let dataTypes = ["colors", "coors", "norms", "trisIdxs"];
        for (let modelIdx in modelData) {
            if (modelData.hasOwnProperty(modelIdx)) {
                for (let idx2 in dataTypes) {
                    if (dataTypes.hasOwnProperty(idx2)) {
                        let dataType = dataTypes[idx2];
                        let chunks = chunk(modelData[modelIdx][dataType]);
                        for (let chunkIdx in chunks) {
                            if (chunks.hasOwnProperty(chunkIdx)) {
                                let chunk = chunks[chunkIdx];
                                dataToSendBack.push([+modelIdx, dataType, chunk]);
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
 * Converts coordinats in string format to list of numbers. Ordered per a
 * left-handed coordinate system.
 * @param  {string} str The coordinates in string format.
 * @returns * The list (actually a Float32Array... not sure how to type this.)
 */
function strToCoors(str: string): any {
    // Convert coordinates in string form to arrays.
    let coorStrs = str.match(numRegex);
    let coorLen = coorStrs.length;
    let coors = new Float32Array(coorLen);

    for (let i = 0; i < coorLen; i = i + 3) {
        // Note the order here. To convert to left-handed coor system. Note
        // also you must use array with push because you don't know ahead of
        // time how many coordinates there will be.
        coors[i] = +coorStrs[i + 2];
        coors[i + 1] = +coorStrs[i + 1];
        coors[i + 2] = +coorStrs[i];
    }

    // Now convert it to a typed array, which is much faster.
    return coors;
};


/**
 * Converts normal vectors in string format to list of numbers.
 * @param  {string} str The normals in string format.
 * @returns * The list (actually a Float32Array... not sure how to type this.)
 */
function strToNorms(str: string): any {
    // Convert coordinates in string form to arrays.
    let normsStrs = str.match(numRegex);
    let normLen = normsStrs.length;
    let norms = new Float32Array(normLen);

    for (let i = 0; i < normLen; i = i + 3) {
        norms[i] = +normsStrs[i];
        norms[i + 1] = +normsStrs[i + 1];
        norms[i + 2] = +normsStrs[i + 2];
    }

    // Now convert it to a typed array, which is much faster.
    return norms;
};


/**
 * Converts colors in string format to list of numbers. Similar to
 * strToCoors(), but for colors.
 * @param  {string} str The colors in string format.
 * @returns * The list (actually a Float32Array... not sure how to type this.)
 */
function strToColors(str: string): any {
    // Convert coordinates in string form to arrays.
    let colorStrs = str.match(numRegex);
    let colorStrsLen = colorStrs.length;
    let colors = new Float32Array(4 * colorStrsLen / 3);
    let colorLen = colors.length;

    for (let i = 0; i < colorLen; i = i + 4) {
        let i2 = 3 * i / 4;
        colors[i] = +colorStrs[i2];
        colors[i + 1] = +colorStrs[i2 + 1];
        colors[i + 2] = +colorStrs[i2 + 2];
        colors[i + 3] = 1.0;
    }

    // Now convert it to a typed array, which is much faster.
    return colors;
};

/**
 * Converts coordIndex in string format to list of numbers. Similar to
 * strToCoors(), but for indexes.
 * @param  {string} str The indexes in string format.
 * @returns * The list (actually a Uint32Array... not sure how to type this.)
 */
function strToTris(str: string): any {
    // Convert coordinates in string form to arrays.
    let indexStrs = str.match(numRegex);
    let indexStrsLen = indexStrs.length;
    let indexLen = 3 * indexStrsLen / 4;
    let indexes = new Uint32Array(indexLen);

    for (let i = 0; i < indexLen; i = i + 3) {
        let i2 = 4 * i / 3;
        indexes[i] = +indexStrs[i2];
        indexes[i + 1] = +indexStrs[i2 + 1];
        indexes[i + 2] = +indexStrs[i2 + 2];
    }

    return indexes;
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
    let numModels = modelData.length;
    for (let modelIdx = 0; modelIdx < numModels; modelIdx++) {
        let coorsLen = modelData[modelIdx]["coors"].length;
        for (let coorIdx = 0; coorIdx < coorsLen; coorIdx = coorIdx + 3) {
            modelData[modelIdx]["coors"][coorIdx] = modelData[modelIdx]["coors"][coorIdx] - delta[0];
            modelData[modelIdx]["coors"][coorIdx + 1] = modelData[modelIdx]["coors"][coorIdx + 1] - delta[1];
            modelData[modelIdx]["coors"][coorIdx + 2] = modelData[modelIdx]["coors"][coorIdx + 2] - delta[2];
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
 * @returns * The x, y, z of the geometric center. Float32Array.
 */
function getGeometricCenter(modelData: VRML.IVRMLModel[]): any {
    // No coordinates... it's an empty mesh.
    if (modelData.length === 0) {
        return new Float32Array([0.0, 0.0, 0.0]);
    }

    let coorCountAllModels = modelData.map((m) => m["coors"].length).reduce((a: number, b: number) => a + b);
    if (coorCountAllModels === 0) {
        // No coordinates... it's an empty mesh.
        return new Float32Array([0.0, 0.0, 0.0]);
    }

    let xTotal = 0;
    let yTotal = 0;
    let zTotal = 0;
    let numModels = modelData.length;

    for (let modelIdx = 0; modelIdx < numModels; modelIdx++) {
        let modelDatum = modelData[modelIdx];
        let coors = modelDatum["coors"];
        let coorsLen = coors.length;
        for (let coorIdx = 0; coorIdx < coorsLen; coorIdx = coorIdx + 3) {
            xTotal = xTotal + coors[coorIdx];
            yTotal = yTotal + coors[coorIdx + 1];
            zTotal = zTotal + coors[coorIdx + 2];
        }
    }

    let numCoors = coorCountAllModels / 3.0;
    xTotal = xTotal / numCoors;
    yTotal = yTotal / numCoors;
    zTotal = zTotal / numCoors;

    return new Float32Array([xTotal, yTotal, zTotal]);
}
