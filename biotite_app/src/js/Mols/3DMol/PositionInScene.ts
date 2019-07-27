import * as Optimizations from "../../Scene/Optimizations";
import * as Vars from "../../Vars";
import * as Visualize from "./Visualize";
import * as VRML from "./VRML";

declare var BABYLON;

export let lastRotationBeforeAnimation = new BABYLON.Vector3(0, 0, 0);
let lastRotationVec = undefined;
let cachedDeltaYs = {};

/**
 * Positions a given molecular mesh within a specified box.
 * @param  {*}         babylonMesh       The molecular mesh.
 * @param  {*}         otherBabylonMesh  The box.
 * @param  {boolean=}  animate           Whether to animate the mesh, to move
 *                                       it to the new position. Defaults to
 *                                       false.
 * @returns void
 */
export function positionAll3DMolMeshInsideAnother(babylonMesh: any, otherBabylonMesh: any, animate: boolean = false): void {
    /** @type {Array<*>} */
    let allVisMolMeshes = getVisibleMolMeshes(babylonMesh);

    // Save all information about each of the visible meshes, for later
    // animation.
    if (lastRotationVec === undefined) {
        lastRotationVec = VRML.molRotation.clone();
    }
    let allVisMolMeshesInfo = allVisMolMeshes.map((m) => {
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
    let targetBox = otherBabylonMesh.getBoundingInfo().boundingBox;
    let targetBoxDimens = Object.keys(targetBox.maximumWorld).map(
        (k) => targetBox.maximumWorld[k] - targetBox.minimumWorld[k],
    );

    // Get the molecular model with the biggest volume.
    let maxVol = 0.0;
    let thisBox;

    /** @type {Array<number>} */
    let thisBoxDimens;

    let thisMesh;  // biggest mesh
    /** @type {number} */
    let allVisMolMeshesLen = allVisMolMeshes.length;
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        let allVisMolMesh = allVisMolMeshes[i];
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
            thisMesh = allVisMolMesh;  // biggest mesh
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
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        let allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.scaling = meshScaling;
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Translate the meshes.
    let meshTranslation = thisBox.centerWorld.subtract(targetBox.centerWorld);
    for (let i = 0; i < allVisMolMeshesLen; i++) {
        let allVisMolMesh = allVisMolMeshes[i];
        allVisMolMesh.position = allVisMolMesh.position.subtract(meshTranslation);
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.

    if (true) {
        let deltaY = moveMolMeshesToGround(thisMesh, targetBox);

        for (let i = 0; i < allVisMolMeshesLen; i++) {
            let allVisMolMesh = allVisMolMeshes[i];
            allVisMolMesh.position.y = allVisMolMesh.position.y - deltaY;
            allVisMolMesh.visibility = 1;  // Hide while rotating.
        }
    }

    lastRotationBeforeAnimation = allVisMolMeshesInfo[0].rotation.clone();

    // Now do the animations, if not moving from origin (as is the case if the
    // style just changed).
    if (animate === true) {
        let len = allVisMolMeshesInfo.length;
        for (let i = 0; i < len; i++) {
            let allVisMolMeshInfo = allVisMolMeshesInfo[i];
            let mesh = allVisMolMeshInfo.mesh;
            let pos = mesh.position.clone();
            let sca = mesh.scaling.clone();
            let rot = mesh.rotation.clone();

            let posX = makeBabylonAnim("posX", "position.x", allVisMolMeshInfo.position.x, pos.x);
            let posY = makeBabylonAnim("posY", "position.y", allVisMolMeshInfo.position.y, pos.y);
            let posZ = makeBabylonAnim("posZ", "position.z", allVisMolMeshInfo.position.z, pos.z);

            let scaX = makeBabylonAnim("scaX", "scaling.x", allVisMolMeshInfo.scaling.x, sca.x);
            let scaY = makeBabylonAnim("scaY", "scaling.y", allVisMolMeshInfo.scaling.y, sca.y);
            let scaZ = makeBabylonAnim("scaZ", "scaling.z", allVisMolMeshInfo.scaling.z, sca.z);

            let rotX = makeBabylonAnim("rotX", "rotation.x", allVisMolMeshInfo.rotation.x, rot.x);
            let rotY = makeBabylonAnim("rotY", "rotation.y", allVisMolMeshInfo.rotation.y, rot.y);
            let rotZ = makeBabylonAnim("rotZ", "rotation.z", allVisMolMeshInfo.rotation.z, rot.z);

            mesh.animations = [posX, posY, posZ, scaX, scaY, scaZ, rotX, rotY, rotZ];

            let anim = Vars.scene.beginAnimation(mesh, 0, 15, false, 1, () => {
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
 * @param  {*} biggestMolMesh The biggest molecular mesh.
 * @param  {Object} targetBox      The box within which to position the mesh.
 * @returns number  How much to move along the Y axis.
 */
function moveMolMeshesToGround(biggestMolMesh: any, targetBox: any): number {
    // The above will position the molecular mesh within the target mesh,
    // centering the two bounding boxes. That would be good for positioning
    // proteins in a bilayer, for example. Now let's move the meshes so they
    // are actually on the ground (all other meshes).

    // Check and see if the deltaY has already been calculated.
    let PI = Math.PI;
    let key = biggestMolMesh.name + "-" +
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
    let verts = biggestMolMesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    let thisMinY = 1000000.0;
    let vertsLength = verts.length;
    let thisMeshWorldMatrix = biggestMolMesh.getWorldMatrix();
    let amntToSkipToGet1000Pts = Math.max(1, 3 * Math.floor(vertsLength / 3000));
    for (let i = 0; i < vertsLength; i = i + amntToSkipToGet1000Pts) {
        let vec = new BABYLON.Vector3(verts[i], verts[i + 1], verts[i + 2]);
        vec = BABYLON.Vector3.TransformCoordinates(vec, thisMeshWorldMatrix);
        if (vec.y < thisMinY) {
            thisMinY = vec.y;
        }
    }

    // The min z of the target box should be ok.
    let targetMinY = targetBox.minimumWorld.y;

    let deltaY = thisMinY - targetMinY - 0.1;
    cachedDeltaYs[key] = deltaY;
    return deltaY;
}

/**
 * Gets a list of all the babylonjs molecular meshes that are visible.
 * @param  {*} babylonMesh  The mesh that was just added.
 * @returns Array<*>  A list of all visible meshes.
 */
function getVisibleMolMeshes(babylonMesh: any): any[] {
    let allVisMolMeshes = [];
    let molMeshIds = Object.keys(Visualize.styleMeshes);
    let len = molMeshIds.length;
    for (let i = 0; i < len; i++) {
        let molMeshId = molMeshIds[i];
        let allVisMolMesh = Visualize.styleMeshes[molMeshId].mesh;
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
    let len = allVisMolMeshes.length;
    for (let i = 0; i < len; i++) {
        let allVisMolMesh = allVisMolMeshes[i];
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
    let anim = new BABYLON.Animation(
        name, prop, 60,
        BABYLON.Animation.ANIMATIONTYPE_FLOAT,
        BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE,
    );

    anim.setKeys([
        {frame: 0, value: startVal},
        {frame: 15, value: endVal},
    ]);

    return anim;
};
