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
 * @param  {*}         babylonMeshJustAdded       The molecular mesh.
 * @param  {*}         otherContainerBabylonMesh  The box.
 * @param  {boolean=}  animate                    Whether to animate the mesh,
 *                                                to move it to the new
 *                                                position. Defaults to false.
 * @returns void
 */
export function positionAll3DMolMeshInsideAnother(babylonMeshJustAdded: any, otherContainerBabylonMesh: any, animate = false): void {
    // Note that this function doesn't update the rotation. It just animates
    // to that rotation. The new rotation is stored in VRML.molRotation, and
    // it is set from the axisRotation() function.

    // Get the visible meshes and info about them.
    const allVisInitialInfo = getVisibleMolMeshesAndInfo(babylonMeshJustAdded);
    const allVisMeshes = allVisInitialInfo.meshes;

    if (allVisMeshes.length === 0) {
        // No meshes to show, so abort effort.
        return;
    }

    // Reset scaling (1,1,1) and position (0,0,0). Rotation is set to
    // VRML.molRotation.
    resetMeshes(allVisMeshes);

    // Get the bounding box of the other (containing) mesh and it's dimensions
    // (protein_box).
    const containingBox = otherContainerBabylonMesh.getBoundingInfo().boundingBox;
    const containingBoxDimens = Object.keys(containingBox.maximumWorld).map(
        (k) => containingBox.maximumWorld[k] - containingBox.minimumWorld[k],
    );

    // Get information about the mesh with the maximum volume.
    const maxVolInfo = getMaxVolMeshInfo(allVisMeshes);

    // Scale all the meshes to fit in the containing box.
    scaleAllMeshesToFixInBox(containingBoxDimens, maxVolInfo.boxDimens, allVisMeshes);

    // Position all the meshes appropriate within countaining box.
    translateAllMeshes(containingBox, allVisMeshes, maxVolInfo);

    // Keep track of last rotation, to enable undo rotation. All the meshes
    // have the same rotation, so just pick first one.
    lastRotationBeforeAnimation = allVisInitialInfo.meshesInfo[0].rotation.clone();

    // Make sure all meshes are visible.
    let len = allVisMeshes.length;
    for (let i = 0; i < len; i++) {
        allVisMeshes[i].visibility = 1;
    }

    // Now do the animations, if not moving from origin (as is the case if the
    // style just changed).
    if (animate === true) {
        animateRotation(allVisInitialInfo, allVisMeshes);
    } else {
        // Not animating. You need to recalculate the shadows.
        Optimizations.updateEnvironmentShadows();
    }
}

function getVisibleMolMeshesAndInfo(babylonMeshJustAdded: any): any {
    // Get the meshes from the babylon scene.
    /** @type {Array<*>} */
    const allVisMolMeshes = getVisibleMolMeshes(babylonMeshJustAdded);

    // Save all information about each of the visible meshes, for later
    // animation.
    if (lastRotationVec === undefined) {
        // Never set before, so get it from the model.
        lastRotationVec = VRML.molRotation.clone();
    }
    const allVisMolMeshesInfo = allVisMolMeshes.map((m: any) => {
        return {
            // mesh: m,
            position: m.position.clone(),
            rotation: lastRotationVec.clone(),
            scaling: m.scaling.clone(),
        };
    });
    lastRotationVec = VRML.molRotation.clone();  // Update for next turn.

    return {
        meshes: allVisMolMeshes,
        meshesInfo: allVisMolMeshesInfo
    }
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

    // Render to update the meshes
    Vars.scene.render();  // Needed to get bounding box to recalculate.
}

function getMaxVolMeshInfo(allVisMeshes: any) {
    // Get the molecular model with the biggest volume.
    const allVisMolMeshesLen = allVisMeshes.length;
    let maxVol = 0.0;
    let maxVolBox;
    let maxVolBoxDimens: number[];
    let maxVolMesh;  // To store biggest mesh.
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMeshes[i];

        // Get the bounding box of this mesh.
        const maxVolBoxTmp = allVisMolMesh.getBoundingInfo().boundingBox;
        const maxVolBoxDimensTmp = Object.keys(maxVolBoxTmp.maximumWorld).map(
            (k) => maxVolBoxTmp.maximumWorld[k] - maxVolBoxTmp.minimumWorld[k],
        );
        const volume = maxVolBoxDimensTmp[0] * maxVolBoxDimensTmp[1] * maxVolBoxDimensTmp[2];

        if (volume > maxVol) {
            maxVol = volume;
            maxVolBox = maxVolBoxTmp;
            maxVolBoxDimens = maxVolBoxDimensTmp;
            maxVolMesh = allVisMolMesh;  // biggest mesh
        }
    }

    return {
        box: maxVolBox,
        boxDimens: maxVolBoxDimens,
        mesh: maxVolMesh
    }
}

function scaleAllMeshesToFixInBox(containingBoxDimens: any[], maxVolBoxDimens: any[], visMeshes: any[]): void {
    const allVisMolMeshesLen = visMeshes.length;

    // Get the scales
    const scales = containingBoxDimens.map((containingBoxDimen, i) =>
        containingBoxDimen / maxVolBoxDimens[i],
    );

    // Get the minimum of those scale
    const minScale = Math.min.apply(null, scales);
    const meshScaling = new BABYLON.Vector3(minScale, minScale, minScale);

    // Scale the meshes.
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = visMeshes[i];
        allVisMolMesh.scaling = meshScaling;
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.
}

function translateAllMeshes(containingBox: any, allVisMeshes: any, maxVolInfo: any): void {
    const allVisMolMeshesLen = allVisMeshes.length;

    // Translate the meshes.
    const meshTranslation = maxVolInfo.box.centerWorld.subtract(containingBox.centerWorld);
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMeshes[i];
        allVisMolMesh.position = allVisMolMesh.position.subtract(meshTranslation);
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Move the mesh up and down, too (lipid, for example).
    let deltaY = 0;
    if (Vars.sceneInfo.positionOnFloor) {
        deltaY = moveMolMeshesToGround(maxVolInfo.mesh, containingBox);
    }

    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMeshes[i];
        allVisMolMesh.position.y = allVisMolMesh.position.y - deltaY;
    }
}

/**
 * How much to move the mesh to position it on the ground.
 * @param  {*} biggestMolMesh  The biggest molecular mesh.
 * @param  {Object} containingBox  The box within which to position the mesh.
 * @returns number  How much to move along the Y axis.
 */
function moveMolMeshesToGround(biggestMolMesh: any, containingBox: any): number {
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
    const targetMinY = containingBox.minimumWorld.y;

    const deltaY = thisMinY - targetMinY - 0.1;
    cachedDeltaYs[key] = deltaY;
    return deltaY;
}

function animateRotation(allVisInitialInfo: any, allVisMeshes: any): void {
    let len = allVisInitialInfo.meshesInfo.length;
    for (let i = 0; i < len; i++) {
        const allVisInitialInf = allVisInitialInfo.meshesInfo[i];
        const mesh = allVisMeshes[i];
        const pos = mesh.position.clone();
        const sca = mesh.scaling.clone();
        const rot = mesh.rotation.clone();


        // TODO: The way it should be:
        // scene.getMeshByName("MeshFrom3DMol0.6281022775005658").rotate(BABYLON.Axis.X, 0.1, BABYLON.Space.WORLD);

        //                           name,   prop,         start_val,                    end_val
        const posX = makeBabylonAnim("posX", "position.x", allVisInitialInf.position.x, pos.x);
        const posY = makeBabylonAnim("posY", "position.y", allVisInitialInf.position.y, pos.y);
        const posZ = makeBabylonAnim("posZ", "position.z", allVisInitialInf.position.z, pos.z);

        const scaX = makeBabylonAnim("scaX", "scaling.x", allVisInitialInf.scaling.x, sca.x);
        const scaY = makeBabylonAnim("scaY", "scaling.y", allVisInitialInf.scaling.y, sca.y);
        const scaZ = makeBabylonAnim("scaZ", "scaling.z", allVisInitialInf.scaling.z, sca.z);

        const rotX = makeBabylonAnim("rotX", "rotation.x", allVisInitialInf.rotation.x, rot.x);
        const rotY = makeBabylonAnim("rotY", "rotation.y", allVisInitialInf.rotation.y, rot.y);
        const rotZ = makeBabylonAnim("rotZ", "rotation.z", allVisInitialInf.rotation.z, rot.z);

        mesh.animations = [posX, posY, posZ, scaX, scaY, scaZ, rotX, rotY, rotZ];

        const anim = Vars.scene.beginAnimation(mesh, 0, 15, false, 1, () => {
            // You need to recalculate the shadows.
            Optimizations.updateEnvironmentShadows();
        });
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
