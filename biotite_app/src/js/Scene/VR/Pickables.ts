// This module includes functions to manage which meshes in the scene are
// pickable.

import * as Vars from "./Vars";

let pickableMeshes = [];
let pickableButtons = [];
let pickableMolecules = [];

export enum PickableCategory {
    None, Ground, Button, Molecule,
}

export let curPickedMesh;
export function setCurPickedMesh(mesh) {
    curPickedMesh = mesh;
}

export function setup() {
    pickableMeshes.push(Vars.vars.groundMesh);
}

export function addPickableButton(mesh) {
    pickableMeshes.push(mesh);
    pickableButtons.push(mesh);
}

export function addPickableMolecule(mesh) {
    pickableMeshes.push(mesh);
    pickableMolecules.push(mesh);
}

export function checkIfMeshPickable(mesh) {
    return pickableMeshes.indexOf(mesh) !== -1;
}

export function getCategoryOfCurMesh(): PickableCategory {
    if (curPickedMesh === undefined) {
        return PickableCategory.None;
    } else if (curPickedMesh === Vars.vars.groundMesh) {
        return PickableCategory.Ground;
    } else if (pickableButtons.indexOf(curPickedMesh) !== -1) {
        return PickableCategory.Button;
    } else if (pickableMolecules.indexOf(curPickedMesh) !== -1) {
        return PickableCategory.Molecule;
    } else {
        return PickableCategory.None;
    }
}
