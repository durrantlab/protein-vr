// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as Optimizations from "../../Scene/Optimizations";
import * as Vars from "../../Vars/Vars";
import * as VisStyles from "./VisStyles";
import * as VRML from "./VRML";
import * as StatusComponent from "../../UI/Vue/Components/StatusComponent";
// import * as Axes from "../../Scene/Axes";
import { HookTypes, runHooks } from '../../Plugins/Hooks/Hooks';
import { AbstractMesh, Animation, Quaternion, TransformNode, Vector3, VertexBuffer } from "@babylonjs/core";

export let lastRotationQuatBeforeAnimation = new Quaternion(0, 0, 0, 0);
let lastRotationQuat: Quaternion = undefined;
const cachedDeltaYs = {};

// If you parent non-mol meshes to this transform node, using angstrom
// coordinates, they will track the meshes as they rotate. Note that
// everything added to this should itself be a TransformNode. Parent actual
// meshes to that TransformNode.
export let nonMolMeshesTransformNode: TransformNode;

/**
 * Sets up the nonMolMeshesTransformNode variable.
 * @returns void
 */
export function setupPositioning(): void {
    nonMolMeshesTransformNode = new TransformNode("nonMolMeshesTransformNode");
}

/**
 * Positions a given molecular mesh within a specified box. The "entry point"
 * to the mesh positioning system.
 * @param  {*}         babylonMeshJustAdded       The molecular mesh.
 * @param  {*}         otherContainerBabylonMesh  The box.
 * @param  {boolean=}  animate                    Whether to animate the mesh,
 *                                                to move it to the new
 *                                                position. Defaults to false.
 * @returns void
 */
export function positionAll3DMolMeshInsideAnother(babylonMeshJustAdded: any, otherContainerBabylonMesh: any, animate = false): void {
    // Somtimes babylonMeshJustAdded is undefined by design
    // if ((babylonMeshJustAdded === undefined) || (babylonMeshJustAdded === null)) {
    //     // Sometimes gets passed a non-mesh.
    //     return;
    // }

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
    // const containingBoxDimens = Object.keys(containingBox.maximumWorld).map(
    //     (k) => containingBox.maximumWorld[k] - containingBox.minimumWorld[k],
    // );

    const containingBoxDimens = [
        containingBox.maximumWorld.x - containingBox.minimumWorld.x,
        containingBox.maximumWorld.y - containingBox.minimumWorld.y,
        containingBox.maximumWorld.z - containingBox.minimumWorld.z
    ]

    // Get information about the mesh with the maximum volume.
    const maxVolInfo = getMaxVolMeshInfo(allVisMeshes);

    // Scale all the meshes to fit in the containing box.
    scaleAllMeshesToFixInBox(containingBoxDimens, maxVolInfo.boxDimens, allVisMeshes);

    // Position all the meshes appropriate within countaining box.
    translateAllMeshes(containingBox, allVisMeshes, maxVolInfo);

    // Keep track of last rotation, to enable undo rotation. All the meshes
    // have the same rotation, so just pick first one.
    lastRotationQuatBeforeAnimation = allVisInitialInfo.meshesInfo[0].rotationQuaternion.clone();

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

/**
 * Bet information about all the visible meshes.
 * @param  {*} babylonMeshJustAdded  The mesh just added, which might not
 *                                   otherwise show up in the list.
 * @returns *  An object with the data. { meshes: allVisMolMeshes, meshesInfo:
 *             allVisMolMeshesInfo }

 */
function getVisibleMolMeshesAndInfo(babylonMeshJustAdded: AbstractMesh): any {
    // Get the meshes from the babylon scene.
    /** @type {Array<*>} */
    const allVisMolMeshes = getVisibleMolMeshes(babylonMeshJustAdded);

    // Save all information about each of the visible meshes, for later
    // animation.
    if (lastRotationQuat === undefined) {
        // Never set before, so get it from the model.
        lastRotationQuat = VRML.molRotationQuat.clone();
    }
    const allVisMolMeshesInfo = allVisMolMeshes.map((m: any) => {
        return {
            // mesh: m,
            position: m.position.clone(),
            rotationQuaternion: lastRotationQuat.clone(),
            scaling: m.scaling.clone(),
        };
    });
    lastRotationQuat = VRML.molRotationQuat.clone();  // Update for next turn.

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
function getVisibleMolMeshes(babylonMesh: AbstractMesh): AbstractMesh[] {
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
function resetMeshes(allVisMolMeshes: AbstractMesh[]): void {
    // Reset the scaling, position, and rotation of all the visible molecular
    // meshes.
    const len = allVisMolMeshes.length;
    for (let i = 0; i < len; i++) {
        const allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.animations = [];

        if (allVisMolMesh.isVisible === true) {
            // Make sure allVisMolMesh is not scaled or positioned. But
            // note that rotations are preserved.
            allVisMolMesh.scaling = new Vector3(1, 1, 1);
            allVisMolMesh.position = new Vector3(0, 0, 0);
            allVisMolMesh.rotationQuaternion = VRML.molRotationQuat;
            allVisMolMesh.visibility = 0;  // Hide while rotating.
        }
    }

    // Also position nonMolMeshesTransformNode
    nonMolMeshesTransformNode.scaling = new Vector3(1, 1, 1);
    nonMolMeshesTransformNode.position = new Vector3(0, 0, 0);
    nonMolMeshesTransformNode.rotationQuaternion = VRML.molRotationQuat;
    // nonMolMeshesTransformNode.visibility = 0;  // Hide while rotating.

    // Render to update the meshes
    Vars.scene.render();  // Needed to get bounding box to recalculate.
}

/**
 * Get information about the mesh with the maximum volume.
 * @param  {*} allVisMeshes  Info about all the meshes.
 * @returns *  The information about the max-volume mesh. { box: maxVolBox,
 *             boxDimens: maxVolBoxDimens, mesh: maxVolMesh }
 */
function getMaxVolMeshInfo(allVisMeshes: AbstractMesh[]): any {
    // Get the molecular model with the biggest volume.
    const allVisMolMeshesLen = allVisMeshes.length;
    let maxVol = 0.0;
    let maxVolBox;
    let maxVolBoxDimens: number[];
    let maxVolMesh;  // To store biggest mesh.
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMeshes[i];
        const maxVolBoxTmp = allVisMolMesh.getBoundingInfo().boundingBox;
        // const maxVolBoxDimensTmp = Object.keys(maxVolBoxTmp.maximumWorld).map(
        //     (k) => maxVolBoxTmp.maximumWorld[k] - maxVolBoxTmp.minimumWorld[k],
        // );
        const maxVolBoxDimensTmp = [
            maxVolBoxTmp.maximumWorld.x - maxVolBoxTmp.minimumWorld.x,
            maxVolBoxTmp.maximumWorld.y - maxVolBoxTmp.minimumWorld.y,
            maxVolBoxTmp.maximumWorld.z - maxVolBoxTmp.minimumWorld.z
        ]
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
        boxDimens: maxVolBoxDimens,  // ? maxVolBoxDimens : [0, 0, 0],
        mesh: maxVolMesh
    }
}

/**
 * Scale all the meshes to fit inside a box.
 * @param  {*[]} containingBoxDimens  The dimensions of the containing box.
 * @param  {*[]} maxVolBoxDimens      The dimensions of the object with the
 *                                    maximum volume.
 * @param  {*[]} visMeshes            A list of all the visible meshes.
 * @returns void
 */
function scaleAllMeshesToFixInBox(
    containingBoxDimens: any[], maxVolBoxDimens: any[],
    visMeshes: AbstractMesh[]
): void {
    const allVisMolMeshesLen = visMeshes.length;

    // Get the scales
    const scales = containingBoxDimens.map((containingBoxDimen, i) =>
        containingBoxDimen / maxVolBoxDimens[i],
    );

    // Get the minimum of those scale
    const minScale = Math.min.apply(null, scales);
    const meshScaling = new Vector3(minScale, minScale, minScale);

    // Scale the meshes.
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = visMeshes[i];
        allVisMolMesh.scaling = meshScaling;
    }

    // Don't forget nonMolMeshesTransformNode
    nonMolMeshesTransformNode.scaling = meshScaling;

    Vars.scene.render();  // Needed to get bounding box to recalculate.
}

/**
 * Move all the meshes. For example, when embedding in a lipid bilayer.
 * @param  {*} containingBox    Info about the box that contains all the
 *                              meshes.
 * @param  {*[]} allVisMeshes   All the meshes.
 * @param  {*} maxVolInfo       Information about the mesh with the largest
 *                              volume.
 * @returns void
 */
function translateAllMeshes(containingBox: any, allVisMeshes: AbstractMesh[], maxVolInfo: any): void {
    const allVisMolMeshesLen = allVisMeshes.length;

    // Translate the meshes.
    const meshTranslation = maxVolInfo.box.centerWorld.subtract(containingBox.centerWorld);
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        const allVisMolMesh = allVisMeshes[i];
        allVisMolMesh.position = allVisMolMesh.position.subtract(meshTranslation);
    }

    // Also nonMolMeshesTransformNode
    nonMolMeshesTransformNode.position = nonMolMeshesTransformNode.position.subtract(meshTranslation);

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

    // Also nonMolMeshesTransformNode
    nonMolMeshesTransformNode.position.y = nonMolMeshesTransformNode.position.y - deltaY;
}

/**
 * How much to move the mesh to position it on the ground.
 * @param  {*} biggestMolMesh  The biggest molecular mesh.
 * @param  {Object} containingBox  The box within which to position the mesh.
 * @returns number  How much to move along the Y axis.
 */
function moveMolMeshesToGround(biggestMolMesh: AbstractMesh, containingBox: any): number {
    if ((biggestMolMesh === undefined) || (biggestMolMesh === null)) {
        // Sometimes gets passed a non-mesh.
        return;
    }

    // The above will position the molecular mesh within the target mesh,
    // centering the two bounding boxes. That would be good for positioning
    // proteins in a bilayer, for example. Now let's move the meshes so they
    // are actually on the ground (all other meshes).

    // Check and see if the deltaY has already been calculated. Make sure this
    // key is unique. I've run into problems in the past...
    const PI = Math.PI;
    const key: string = biggestMolMesh.name + "-" +
              (biggestMolMesh.rotationQuaternion.x % PI).toFixed(3) + "-" +
              (biggestMolMesh.rotationQuaternion.y % PI).toFixed(3) + "-" +
              (biggestMolMesh.rotationQuaternion.z % PI).toFixed(3) + "-" +
              (biggestMolMesh.rotationQuaternion.w % PI).toFixed(3) + "-" +
              biggestMolMesh.position.x.toFixed(3) + "-" +
              biggestMolMesh.position.y.toFixed(3) + "-" +
              biggestMolMesh.position.z.toFixed(3)
    if (cachedDeltaYs[key] !== undefined) {
        return cachedDeltaYs[key];
    }

    // Unfortunately, BABYLONjs rotates bounding boxes with the mesh. So the
    // minimum z per the bounding box doesn't correspond to EXACTLY the
    // minimum z of any vertex. Let's loop through the biggest mesh and find
    // its lowest vertex, because positioning over the ground needs to be more
    // exact.
    const verts = biggestMolMesh.getVerticesData(VertexBuffer.PositionKind);
    let thisMinY = 1000000.0;
    const vertsLength = verts.length;
    const thisMeshWorldMatrix = biggestMolMesh.getWorldMatrix();

    const amntToSkipToGet1000Pts = Math.max(1, 3 * Math.floor(vertsLength / 3000));
    for (let i = 0; i < vertsLength; i = i + amntToSkipToGet1000Pts) {
        let vec = new Vector3(verts[i], verts[i + 1], verts[i + 2]);
        vec = Vector3.TransformCoordinates(vec, thisMeshWorldMatrix);
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

/**
 * Animate the meshes to their new location/rotations.
 * @param  {*} allVisInitialInfo  Information about the mesh visibility as it
 *                                existed before any changes.
 * @param  {*[]} allVisMeshes     List of all visible meshes.
 * @returns void
 */
function animateRotation(allVisInitialInfo: any, allVisMeshes: AbstractMesh[]): void {
    let len = allVisInitialInfo.meshesInfo.length;
    let pos, sca, rot;
    for (let i = 0; i < len; i++) {
        // NOTE: I believe these values are always the same for all meshes.
        const allVisInitialInf = allVisInitialInfo.meshesInfo[i];

        const mesh = allVisMeshes[i];
        pos = mesh.position.clone();
        sca = mesh.scaling.clone();
        rot = mesh.rotationQuaternion.clone();

        // TODO: The way it should be:
        // scene.getMeshByName("MeshFrom3DMol0.6281022775005658").rotate(Axis.X, 0.1, Space.WORLD);

        animateRotationOnSingleMesh(
            mesh, allVisInitialInf.position, allVisInitialInf.scaling, allVisInitialInf.rotationQuaternion,
            pos, sca, rot
        );

        // setTimeout(() => {
        //     // Here instead of in end animation above because I like it to
        //     // delay a bit.
        //     Axes.axesMesh.setEnabled(false);
        // }, 1000);
    }

    let allVisInitialInf = allVisInitialInfo.meshesInfo[0];

    // if (nonMolMeshesTransformNode.rotationQuaternion === null) {
    //     // Below will set rotationQuaternion if it doesn't exist.
    //     nonMolMeshesTransformNode.rotationQuaternion = new Quaternion.Identity();
    // }

    animateRotationOnSingleMesh(
        nonMolMeshesTransformNode,
        allVisInitialInf.position, allVisInitialInf.scaling, allVisInitialInf.rotationQuaternion,
        pos, sca, rot
    );

    runHooks(HookTypes.ON_ROTATE, {position: pos, scaling: sca, rotation: rot});
}

/**
 * Animates a mesh.
 * @param  {*}  mesh      The mesh to animate.
 * @param  {*}  startPos  The starting position of the mesh.
 * @param  {*}  startSca  The starting scale of the mesh.
 * @param  {*}  startRot  The starting rotation of the mesh.
 * @param  {*}  endPos    The ending position of the mesh.
 * @param  {*}  endSca    The ending scale of the mesh.
 * @param  {*}  endRot    The ending rotation of the mesh.
 */
function animateRotationOnSingleMesh(
    mesh: TransformNode,
    startPos: Vector3, startSca: Vector3, startRot: Quaternion,
    endPos: Vector3, endSca: Vector3, endRot: Quaternion
): void {
    //                           name,   prop,         start_val,  end_val
    const posX = makeBabylonAnim("posX", "position.x", startPos.x, endPos.x);
    const posY = makeBabylonAnim("posY", "position.y", startPos.y, endPos.y);
    const posZ = makeBabylonAnim("posZ", "position.z", startPos.z, endPos.z);

    const scaX = makeBabylonAnim("scaX", "scaling.x", startSca.x, endSca.x);
    const scaY = makeBabylonAnim("scaY", "scaling.y", startSca.y, endSca.y);
    const scaZ = makeBabylonAnim("scaZ", "scaling.z", startSca.z, endSca.z);

    const rotX = makeBabylonAnim("rotX", "rotationQuaternion.x", startRot.x, endRot.x);
    const rotY = makeBabylonAnim("rotY", "rotationQuaternion.y", startRot.y, endRot.y);
    const rotZ = makeBabylonAnim("rotZ", "rotationQuaternion.z", startRot.z, endRot.z);
    const rotW = makeBabylonAnim("rotW", "rotationQuaternion.w", startRot.w, endRot.w);

    mesh.animations = [posX, posY, posZ, scaX, scaY, scaZ];
    mesh.animations.push(...[rotX, rotY, rotZ, rotW]);

    // Axes.axesMesh.setEnabled(true);

    const anim = Vars.scene.beginAnimation(mesh, 0, 15, false, 1, () => {
        // You need to recalculate the shadows.
        Optimizations.updateEnvironmentShadows();
        StatusComponent.setStatus("Rotate done: " + startRot.toString());
    });
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
    const anim = new Animation(
        name, prop, 60,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE,
    );

    anim.setKeys([
        {frame: 0, value: startVal},
        {frame: 15, value: endVal},
    ]);

    return anim;
}
