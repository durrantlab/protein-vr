// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

const ctx: Worker = self as any;

declare var WorkerGlobalScope: any;

/** @const {number} */
const DATA_CHUNK_SIZE = 10000000;

/** @type {Array<*>} */
let dataToSendBack: any[] = [];

const numRegex = new RegExp("(^|-| )[0-9\.]{1,8}", "g");
let geoCenter: any = undefined;

// Determine if we're in a webworker. See
// https://stackoverflow.com/questions/7931182/reliably-detect-if-the-script-is-executing-in-a-web-worker
let inWebWorker = false;
if (typeof WorkerGlobalScope !== "undefined" && ctx instanceof WorkerGlobalScope) {
    inWebWorker = true;
}

// Get the data from the main thread, if webworker.
if (inWebWorker) {
    ctx.onmessage = (e: any) => {
        /** @type {string} */
        let cmd = e.data["cmd"];

        const data = e.data["data"];

        /** @type {boolean} */
        const removeExtraPts = e.data["removeExtraPts"];

        if (cmd === "start") {
            // This will populate dataToSendBack
            loadValsFromVRML(data, removeExtraPts);
            cmd = "sendDataChunk";
        }

        if (cmd === "sendDataChunk") {
            const chunkToSend = dataToSendBack.shift();
            let status = (dataToSendBack.length === 0) ? "done" : "more";

            if (chunkToSend === undefined) {
                // This happens if there's no mesh (i.e., ribbon on pure
                // ligand).
                status = "done";
            }

            ctx.postMessage({
                "chunk": chunkToSend,
                "status": status,
                "geoCenter": geoCenter
            });
        }
    };
}

/**
 * Load in values like coordinates and colors from the VRML string.
 * @param  {string}    vrmlStr         The string containing the VRML data.
 * @param  {boolean=}  removeExtraPts  Whether to remove extra points at the
 *                                     origin. Sticks representation from
 *                                     3DMoljs unfortunately generates these.
 *                                     They make it hard to center sticks-only
 *                                     representations.
 * @returns Array<Object<string, Array<number>>>   The model data.
 */
export function loadValsFromVRML(vrmlStr: string, removeExtraPts = false): any[] {
    /** @type {Array<Object<string,*>>} */
    let modelData: any[] = [];

    // A given VRML file could have multiple IndexedFaceSets. Divide and
    // handle separately.
    const vrmlChunks = vrmlStr.split("geometry IndexedFaceSet {").splice(1);
    const vrmlChunksLen = vrmlChunks.length;
    for (let i = 0; i < vrmlChunksLen; i++) {
        const vrmlChunk = vrmlChunks[i];

        // Extract the coordinates from the vrml text
        let coors = strToCoors(betweenbookends("point [", "]", vrmlChunk));

        // Remove stray points (added to the origin) if necessary.
        if (removeExtraPts) {
            coors = removeStrayPoints(coors);
        }

        let trisIdxs = strToTris(betweenbookends("coordIndex [", "]", vrmlChunk));
        let colors = strToColors(betweenbookends("color [", "]", vrmlChunk));

        // TODO: Note that you're simplifying the mesh data on each chunck
        // separately. Different chunks could share vertexes. So further
        // compression is possible here, though it's complicated to implement.
        let data = simplifyMeshData(coors, trisIdxs, colors);

        // Make sure string keys for closure compiler, since web worker is
        // external.
        modelData.push({
            "coors": data[0],
            "trisIdxs": data[1],
            "colors": data[2],
        });
    }

    // Now that you've collected all the data, go back and translate all the
    // vertixes, so center the coordinates at the origin. Makes it easier to
    // pivot at geometric center.
    if (geoCenter === undefined) {
        geoCenter = getGeometricCenter(modelData);
    }
    modelData = translateBeforeBabylonImport(geoCenter, modelData);

    if (!inWebWorker) {
        // TODO: You should never get here. Webworkers required.
        return modelData;
    } else {
        // Now you need to chunk all the data. This is because you can only
        // transfer so much data back to the main thread at a time.
        dataToSendBack = [];
        const dataTypes = ["colors", "coors", "trisIdxs"];
        const dataTypesLen = dataTypes.length;

        /** @type {number} */
        const len = modelData.length;
        for (let modelIdx = 0; modelIdx < len; modelIdx++) {
            for (let i = 0; i < dataTypesLen; i++) {
                /** @type {string} */
                const dataType = dataTypes[i];
                const chunks = chunk(modelData[modelIdx][dataType]);
                const chunksLen = chunks.length;
                for (let i2 = 0; i2 < chunksLen; i2++) {
                    const chunk = chunks[i2];
                    dataToSendBack.push([modelIdx, dataType, chunk]);
                }
            }
        }
        return [];
    }
}

/**
 * Fixes 0,0,0 points from the coordinates. 3DMoljs unfortunately adds these
 * to stick representations.
 * @param  {*} pts The coordinates. Float32Array.
 * @returns * Float32Array
 */
export function removeStrayPoints(pts: any): any {
    /** @type {number} */
    const firstX = pts[0];

    /** @type {number} */
    const firstY = pts[1];

    /** @type {number} */
    const firstZ = pts[2];

    /** @type {number} */
    const coorsLen = pts.length;

    for (let coorIdx = 0; coorIdx < coorsLen; coorIdx = coorIdx + 3) {
        const idx2 = coorIdx + 1;
        const idx3 = coorIdx + 2;
        if ((pts[coorIdx] === 0) && (pts[idx2] === 0) && (pts[idx3] === 0)) {
            pts[coorIdx] = firstX;
            pts[idx2] = firstY;
            pts[idx3] = firstZ;
        }
    }

    return pts;
}

/**
 * Divides an array into an array of arrays.
 * @param  {Array<*>} arr  The original array.
 * @returns {Array<Array<*>>}  The array of arrays.
 */
function chunk(arr: any[]): any[] {
    // See https://stackoverflow.com/questions/8495687/split-array-into-chunks
    const chunks = [];
    let i = 0;
    const n = arr.length;

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
    const coorStrs = str.match(numRegex);

    if (coorStrs === null) {
        // Sometimes there are no matches, e.g., 2HU4 surface.
        return new Float32Array(0);
    }

    const coorLen = coorStrs.length;
    const coors = new Float32Array(coorLen);

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
}

/**
 * Converts colors in string format to list of numbers. Similar to
 * strToCoors(), but for colors.
 * @param  {string} str The colors in string format.
 * @returns * The list (actually a Float32Array... not sure how to type this.)
 */
function strToColors(str: string): any {
    // Convert coordinates in string form to arrays.
    const colorStrs = str.match(numRegex);

    if (colorStrs === null) {
        // Sometimes there are no matches, e.g., 2HU4 surface.
        return new Float32Array(0);
    }

    const colorStrsLen = colorStrs.length;
    const colors = new Float32Array(4 * colorStrsLen / 3);
    const colorLen = colors.length;

    for (let i = 0; i < colorLen; i = i + 4) {
        const i2 = 3 * i / 4;
        colors[i] = +colorStrs[i2];
        colors[i + 1] = +colorStrs[i2 + 1];
        colors[i + 2] = +colorStrs[i2 + 2];
        colors[i + 3] = 1.0;
    }

    // Now convert it to a typed array, which is much faster.
    return colors;
}

/**
 * Converts coordIndex in string format to list of numbers. Similar to
 * strToCoors(), but for indexes.
 * @param  {string} str  The indexes in string format.
 * @returns * The list (actually a Uint32Array... not sure how to type this.)
 */
function strToTris(str: string): any {
    // Convert coordinates in string form to arrays.
    const indexStrs = str.match(numRegex);

    if (indexStrs === null) {
        // Sometimes there are no matches, e.g., 2HU4 surface.
        return new Float32Array(0);
    }

    const indexStrsLen = indexStrs.length;
    const indexLen = 3 * indexStrsLen / 4;
    const indexes = new Uint32Array(indexLen);

    for (let i = 0; i < indexLen; i = i + 3) {
        const i2 = 4 * i / 3;
        indexes[i] = +indexStrs[i2];
        indexes[i + 1] = +indexStrs[i2 + 1];
        indexes[i + 2] = +indexStrs[i2 + 2];
    }

    return indexes;
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
    if (strArr.length <= 1) {  // In case empty.
        return "";
    }
    strArr = strArr[1].split(bookend2, 2);
    const strBetween = strArr[0];

    return strBetween;
}

/**
 * Translate the coordinates before babylon import.
 * @param  {Array<number>}                         delta      The x, y, z to
 *                                                            translate.
 * @param  {Array<Object<string, Array<number>>>}  modelData  Information
 *                                                            about
 *                                                            coordinates,
 *                                                            colors, etc.
 * @returns Array<Object<string, Array<number>>>   Like model Data, but with
 *                                                 the coordinates translated.
 */
function translateBeforeBabylonImport(delta: number[], modelData: any[]): any[] {
    const numModels = modelData.length;
    for (let modelIdx = 0; modelIdx < numModels; modelIdx++) {
        /** @type {number} */
        const coorsLen = modelData[modelIdx]["coors"].length;
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
 *                                                            colors, etc.
 * @returns * The x, y, z of the geometric center. Float32Array.
 */
function getGeometricCenter(modelData: any[]): any {
    // No coordinates... it's an empty mesh.
    if (modelData.length === 0) {
        return new Float32Array([0.0, 0.0, 0.0]);
    }

    /** @type {number} */
    const coorCountAllModels = modelData.map((m) => m["coors"].length).reduce((a: number, b: number) => a + b);
    if (coorCountAllModels === 0) {
        // No coordinates... it's an empty mesh.
        return new Float32Array([0.0, 0.0, 0.0]);
    }

    let xTotal = 0;
    let yTotal = 0;
    let zTotal = 0;
    const numModels = modelData.length;

    for (let modelIdx = 0; modelIdx < numModels; modelIdx++) {
        const modelDatum = modelData[modelIdx];
        const coors = modelDatum["coors"];
        /** @type {number} */
        const coorsLen = coors.length;
        for (let coorIdx = 0; coorIdx < coorsLen; coorIdx = coorIdx + 3) {
            xTotal = xTotal + coors[coorIdx];
            yTotal = yTotal + coors[coorIdx + 1];
            zTotal = zTotal + coors[coorIdx + 2];
        }
    }

    const numCoors = coorCountAllModels / 3.0;
    xTotal = xTotal / numCoors;
    yTotal = yTotal / numCoors;
    zTotal = zTotal / numCoors;

    return new Float32Array([xTotal, yTotal, zTotal]);
}

function simplifyMeshData(coors, trisIdxs, colors) {
    // coors is in triplets. So num points = count / 3.

    // colors is in quadruplets. So num points = count / 4. one-to-one with
    // coors.

    // trisIdxs is list of indexes (triplets). The number of triangles can
    // vary, not necessarily a function of number of coordinates.

    // More points will be identified as the same if this is bigger.
    const coorReso = 0.01;  // Angstroms
    const colorReso = 0.01;  // always between 0 and 1

    const l = coors.length / 3;
    let x, y, z, i, coorIdx1, coorIdx2, coorIdx3, t, hsh, newIdx, r, g, b, a: number;
    let colIdx1, colIdx2, colIdx3, colIdx4: number;
    let oldToNewIdx = new Map();
    let hshToNewIdx = new Map();
    let curNewIdx = 0;
    let newCoors = new Float32Array(coors.length);
    let newColors = new Float32Array(colors.length);
    let vertSeen;

    // let pts = "";

    // let ptsRemoved = 0;

    for (i = 0; i < l; i++) {
        coorIdx1 = 3 * i;
        coorIdx2 = coorIdx1 + 1;
        coorIdx3 = coorIdx1 + 2;

        x = coors[coorIdx1];
        y = coors[coorIdx2];
        z = coors[coorIdx3];

        // t = 4 * curNewIdx;
        colIdx1 = 4 * i;
        colIdx2 = colIdx1 + 1;
        colIdx3 = colIdx1 + 2;
        colIdx4 = colIdx1 + 3;

        // 0 to 1
        r = colors[colIdx1];
        g = colors[colIdx2];
        b = colors[colIdx3];
        // a = colors[colIdx4];

        hsh = Math.round(
            r * 10000000000 +
            g * 100000000 +
            b * 1000000 +
            x * 10000 +
            y * 100 +
            z
        );

        vertSeen = hshToNewIdx.has(hsh);
        // vertSeen = false;  // for debugging. No merge by distance.
        if (vertSeen === true) {
            // It might have seen it, but the hash isn't unique, so additional
            // checking needed.
            newIdx = hshToNewIdx.get(hsh);

            // Check coors match
            coorIdx2 = 3 * newIdx;
            vertSeen = (Math.abs(x - newCoors[coorIdx2]) < coorReso) &&
                       (Math.abs(y - newCoors[coorIdx2 + 1]) < coorReso) &&
                       (Math.abs(z - newCoors[coorIdx2 + 2]) < coorReso);

            // If necessary, check color match too.
            if (vertSeen === true) {
                // If here, coordinates match. Check colors...
                colIdx2 = 4 * newIdx;
                vertSeen = (Math.abs(r - newColors[colIdx2]) < colorReso) &&
                           (Math.abs(g - newColors[colIdx2 + 1]) < colorReso) &&
                           (Math.abs(b - newColors[colIdx2 + 2]) < colorReso);
            }
        }

        if (vertSeen) {
            // The coordinate/color has been seen before.
            // newIdx = hshToNewIdx.get(hsh);
            oldToNewIdx.set(i, newIdx);
        } else {
            // The coordinate/color has not been seen before.
            oldToNewIdx.set(i, curNewIdx);
            hshToNewIdx.set(hsh, curNewIdx);

            t = 3 * curNewIdx;
            newCoors[t] = x;
            newCoors[t + 1] = y;
            newCoors[t + 2] = z;

            // pts += x.toString() + "\t" + y.toString() + "\t" + z.toString() + "\n";

            // if ((Math.abs(x - 7.368) < 0.01) &&
            //     (Math.abs(y - 3.175) < 0.01) &&
            //     (Math.abs(z - 0.034) < 0.01)
            // ) {
            //     debugger;
            // }

            t = 4 * curNewIdx;
            newColors[t] = r;
            newColors[t + 1] = g;
            newColors[t + 2] = b;
            newColors[t + 3] = 1;  // a;  // alpha always 1

            curNewIdx++;
        }
    }

    newCoors = newCoors.slice(0, 3 * curNewIdx);
    newColors = newColors.slice(0, 4 * curNewIdx);
    trisIdxs = trisIdxs.map(v => oldToNewIdx.get(v));

    console.log("Duplicate vertices merged: " + (l - curNewIdx).toString() + " of " + l.toString());

    return [newCoors, trisIdxs, newColors];
}
