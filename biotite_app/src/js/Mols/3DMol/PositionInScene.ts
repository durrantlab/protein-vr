import * as Optimizations from "../../Scene/Optimizations";
import * as Vars from "../../Vars";
import * as Visualize from "./Visualize";
import * as VRML from "./VRML";

declare var BABYLON;

let lastRot = undefined;

/**
 * Positions a given molecular mesh within a specified box.
 * @param  {*} babylonMesh       The molecular mesh.
 * @param  {*} otherBabylonMesh  The box.
 * @returns void
 */
export function positionAll3DMolMeshInsideAnother(babylonMesh: any, otherBabylonMesh: any): void {
    let allVisMolMeshes = getVisibleMolMeshes(babylonMesh);

    // Save all information about each of the visible meshes, for later
    // animation.
    if (lastRot === undefined) {
        lastRot = VRML.molRotation.clone();
    }
    let allVisMolMeshesInfo = allVisMolMeshes.map((m) => {
        return {
            mesh: m,
            position: m.position.clone(),
            rotation: lastRot.clone(),
            scaling: m.scaling.clone(),
        };
    });
    lastRot = VRML.molRotation.clone();

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
    let thisBoxDimens;
    for (let allVisMolMesh of allVisMolMeshes) {
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
    for (let allVisMolMesh of allVisMolMeshes) {
        allVisMolMesh.scaling = meshScaling;
    }

    Vars.scene.render();  // Needed to get bounding box to recalculate.

    // Translate the meshes.
    let meshTranslation = thisBox.centerWorld.subtract(targetBox.centerWorld);
    for (let allVisMolMesh of allVisMolMeshes) {
        allVisMolMesh.position = allVisMolMesh.position.subtract(meshTranslation);
    }

    // The above will position the molecular mesh within the target mesh,
    // centering the two bounding boxes. That would be good for positioning
    // proteins in a bilayer, for example. Now let's move the meshes so they
    // are actually on the ground (all other meshes).
    // Vars.scene.render();  // Needed to get bounding box to recalculate.
    let deltaY = 0.5 * (
                    (targetBox.maximumWorld.y - targetBox.minimumWorld.y) -
                    (thisBox.maximumWorld.y - thisBox.minimumWorld.y)
                );
    for (let allVisMolMesh of allVisMolMeshes) {
        allVisMolMesh.position.y = allVisMolMesh.position.y - deltaY;
        allVisMolMesh.visibility = 1;  // Hide while rotating.
    }

    // Now do the animations.
    for (let allVisMolMeshInfo of allVisMolMeshesInfo) {
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
}

/**
 * Gets a list of all the babylonjs molecular meshes that are visible.
 * @param  {*} babylonMesh  The mesh that was just added.
 * @returns Array<*>  A list of all visible meshes.
 */
function getVisibleMolMeshes(babylonMesh: any): any[] {
    let allVisMolMeshes = [];
    for (let molMeshId in Visualize.styleMeshes) {
        if (Visualize.styleMeshes.hasOwnProperty(molMeshId)) {
            let allVisMolMesh = Visualize.styleMeshes[molMeshId].mesh;

            if (allVisMolMesh.isVisible === true) {
                allVisMolMeshes.push(allVisMolMesh);
            }
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
    for (let allVisMolMesh of allVisMolMeshes) {
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
