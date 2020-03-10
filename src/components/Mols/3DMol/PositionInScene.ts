// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

import * as Optimizations from "../../Scene/Optimizations";
import * as Vars from "../../Vars/Vars";
import * as VisStyles from "./VisStyles";
import * as VRML from "./VRML";

declare var BABYLON: any;

export let lastRotationBeforeAnimation = new BABYLON.Vector3(0, 0, 0);
let lastRotationVec: any = undefined;
const cachedDeltaYs = {};

/**
 * Positions a given molecular mesh within a specified box.
 * @param  {*}         babylonMesh       The molecular mesh.
 * @param  {*}         otherBabylonMesh  The box.
 * @param  {boolean=}  animate           Whether to animate the mesh, to move
 *                                       it to the new position. Defaults to
 *                                       false.
 * @returns void
 */
export function positionAll3DMolMeshInsideAnother(babylonMesh: any, otherBabylonMesh: any, animate = false): void {
    /** @type {Array<*>} */
    const allVisMolMeshes = getVisibleMolMeshes(babylonMesh);

    // Save all information about each of the visible meshes, for later
    // animation.
    if (lastRotationVec === undefined) {
        lastRotationVec = VRML.molRotation.clone();
    }
    const allVisMolMeshesInfo = allVisMolMeshes.map((m: any) => {
        return {
            mesh: m,
            position: m.position.clone(),
            rotation: lastRotationVec.clone(),
            scaling: m.scaling.clone(),
        };
    });
    lastRotationVec = VRML.molRotation.clone();

    if (allVisMolMeshes.length === 0) {
        // No meshes to show.
        return;
    }

    resetMeshes(allVisMolMeshes);

    // Render to update the meshes
    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Get the bounding box of the other mesh and it's dimensions
    // (protein_box).
    const targetBox = otherBabylonMesh.getBoundingInfo().boundingBox;
    const targetBoxDimens = Object.keys(targetBox.maximumWorld).map(
        (k) => targetBox.maximumWorld[k] - targetBox.minimumWorld[k],
    );

    // Get the molecular model with the biggest volume.
    let maxVol = 0.0;
    let thisBox;

    /** @type {Array<number>} */
    let thisBoxDimens: number[];

    let thisMesh;  // biggest mesh

    /** @type {number} */
    const allVisMolMeshesLen = allVisMolMeshes.length;
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMolMeshes[i];

        // Get the bounding box of this mesh.
        const thisBoxTmp = allVisMolMesh.getBoundingInfo().boundingBox;
        const thisBoxDimensTmp = Object.keys(thisBoxTmp.maximumWorld).map(
            (k) => thisBoxTmp.maximumWorld[k] - thisBoxTmp.minimumWorld[k],
        );
        const volume = thisBoxDimensTmp[0] * thisBoxDimensTmp[1] * thisBoxDimensTmp[2];

        if (volume > maxVol) {
            maxVol = volume;
            thisBox = thisBoxTmp;
            thisBoxDimens = thisBoxDimensTmp;
            thisMesh = allVisMolMesh;  // biggest mesh
        }
    }

    // Get the scales
    const scales = targetBoxDimens.map((targetBoxDimen, i) =>
        targetBoxDimen / thisBoxDimens[i],
    );

    // Get the minimum scale
    const minScale = Math.min.apply(null, scales);
    const meshScaling = new BABYLON.Vector3(minScale, minScale, minScale);

    // Scale the meshes.
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.scaling = meshScaling;
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Translate the meshes.
    const meshTranslation = thisBox.centerWorld.subtract(targetBox.centerWorld);
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.position = allVisMolMesh.position.subtract(meshTranslation);
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.

    let deltaY = 0;
    if (Vars.sceneInfo.positionOnFloor) {
        deltaY = moveMolMeshesToGround(thisMesh, targetBox);
    }

    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.position.y = allVisMolMesh.position.y - deltaY;
        allVisMolMesh.visibility = 1;  // Hide while rotating.
    }

    lastRotationBeforeAnimation = allVisMolMeshesInfo[0].rotation.clone();

    // Now do the animations, if not moving from origin (as is the case if the
    // style just changed).
    if (animate === true) {
        const len = allVisMolMeshesInfo.length;
        for (let i = 0; i < len; i++) {
            const allVisMolMeshInfo = allVisMolMeshesInfo[i];
            const mesh = allVisMolMeshInfo.mesh;
            const pos = mesh.position.clone();
            const sca = mesh.scaling.clone();
            const rot = mesh.rotation.clone();

            const posX = makeBabylonAnim("posX", "position.x", allVisMolMeshInfo.position.x, pos.x);
            const posY = makeBabylonAnim("posY", "position.y", allVisMolMeshInfo.position.y, pos.y);
            const posZ = makeBabylonAnim("posZ", "position.z", allVisMolMeshInfo.position.z, pos.z);

            const scaX = makeBabylonAnim("scaX", "scaling.x", allVisMolMeshInfo.scaling.x, sca.x);
            const scaY = makeBabylonAnim("scaY", "scaling.y", allVisMolMeshInfo.scaling.y, sca.y);
            const scaZ = makeBabylonAnim("scaZ", "scaling.z", allVisMolMeshInfo.scaling.z, sca.z);

            const rotX = makeBabylonAnim("rotX", "rotation.x", allVisMolMeshInfo.rotation.x, rot.x);
            const rotY = makeBabylonAnim("rotY", "rotation.y", allVisMolMeshInfo.rotation.y, rot.y);
            const rotZ = makeBabylonAnim("rotZ", "rotation.z", allVisMolMeshInfo.rotation.z, rot.z);

            mesh.animations = [posX, posY, posZ, scaX, scaY, scaZ, rotX, rotY, rotZ];

            const anim = Vars.scene.beginAnimation(mesh, 0, 15, false, 1, () => {
                // You need to recalculate the shadows.
                Optimizations.updateEnvironmentShadows();
            });
        }
    } else {
        // Not animating. You need to recalculate the shadows.
        Optimizations.updateEnvironmentShadows();
    }
}

/**
 * How much to move the mesh to position it on the ground.
 * @param  {*} biggestMolMesh  The biggest molecular mesh.
 * @param  {Object} targetBox  The box within which to position the mesh.
 * @returns number  How much to move along the Y axis.
 */
function moveMolMeshesToGround(biggestMolMesh: any, targetBox: any): number {
    // The above will position the molecular mesh within the target mesh,
    // centering the two bounding boxes. That would be good for positioning
    // proteins in a bilayer, for example. Now let's move the meshes so they
    // are actually on the ground (all other meshes).

    // Check and see if the deltaY has already been calculated.
    const PI = Math.PI;
    const key: string = biggestMolMesh.name + "-" +
              (biggestMolMesh.rotation.x % PI).toFixed(3) + "-" +
              (biggestMolMesh.rotation.y % PI).toFixed(3) + "-" +
              (biggestMolMesh.rotation.z % PI).toFixed(3);
    if (cachedDeltaYs[key] !== undefined) {
        return cachedDeltaYs[key];
    }

    // Unfortunately, BABYLONjs rotates bounding boxes with the mesh. So the
    // minimum z per the bounding box doesn't correspond to EXACTLY the
    // minimum z of any vertex. Let's loop through the biggest mesh and find
    // its lowest vertex, because positioning over the ground needs to be more
    // exact.
    const verts = biggestMolMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    let thisMinY = 1000000.0;
    const vertsLength = verts.length;
    const thisMeshWorldMatrix = biggestMolMesh.getWorldMatrix();
    const amntToSkipToGet1000Pts = Math.max(1, 3 * Math.floor(vertsLength / 3000));
    for (let i = 0; i < vertsLength; i = i + amntToSkipToGet1000Pts) {
        let vec = new BABYLON.Vector3(verts[i], verts[i + 1], verts[i + 2]);
        vec = BABYLON.Vector3.TransformCoordinates(vec, thisMeshWorldMatrix);
        if (vec.y < thisMinY) {
            thisMinY = vec.y;
        }
    }

    // The min z of the target box should be ok.
    const targetMinY = targetBox.minimumWorld.y;

    const deltaY = thisMinY - targetMinY - 0.1;
    cachedDeltaYs[key] = deltaY;
    return deltaY;
}

/**
 * Gets a list of all the babylonjs molecular meshes that are visible.
 * @param  {*} babylonMesh  The mesh that was just added.
 * @returns Array<*>  A list of all visible meshes.
 */
function getVisibleMolMeshes(babylonMesh: any): any[] {
    const allVisMolMeshes = [];
    const molMeshIds = Object.keys(VisStyles.styleMeshes);
    const len = molMeshIds.length;
    for (let i = 0; i < len; i++) {
        const molMeshId = molMeshIds[i];
        const allVisMolMesh = VisStyles.styleMeshes[molMeshId].mesh;
        if (allVisMolMesh.isVisible === true) {
            allVisMolMeshes.push(allVisMolMesh);
        }
    }

    // Add the current one (just added).
    if (babylonMesh !== undefined) {
        allVisMolMeshes.push(babylonMesh);
    }

    return allVisMolMeshes;
}

/**
 * Resets things like the location and rotation of all visible meshes.
 * @param  {Object<*>} allVisMolMeshes  All the visible meshes.
 * @returns void
 */
function resetMeshes(allVisMolMeshes: any[]): void {
    // Reset the scaling, position, and rotation of all the visible molecular
    // meshes.
    const len = allVisMolMeshes.length;
    for (let i = 0; i < len; i++) {
        const allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.animations = [];

        if (allVisMolMesh.isVisible === true) {
            // Make sure allVisMolMesh is not scaled or positioned. But
            // note that rotations are preserved.
            allVisMolMesh.scaling = new BABYLON.Vector3(1, 1, 1);
            allVisMolMesh.position = new BABYLON.Vector3(0, 0, 0);
            allVisMolMesh.rotation = VRML.molRotation;
            allVisMolMesh.visibility = 0;  // Hide while rotating.
        }
    }
}

/**
 * Make a babylonjs animation. I found myself doing this a lot, so figured I'd
 * make a function.
 * @param  {string} name      The animation name.
 * @param  {string} prop      The property to animate.
 * @param  {number} startVal  The starting value.
 * @param  {number} endVal    The ending value.
 */
function makeBabylonAnim(name: string, prop: string, startVal: number, endVal: number) {
    const anim = new BABYLON.Animation(
        name, prop, 60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    );

    anim.setKeys([
        {frame: 0, value: startVal},
        {frame: 15, value: endVal},
    ]);

    return anim;
}
