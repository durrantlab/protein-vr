// This module includes functions to manage which meshes in the scene are
// pickable.

import * as CommonCamera from "../Cameras/CommonCamera";
import * as Vars from "../Vars";
import * as Navigation from "./Navigation";
import * as Optimizations from "./Optimizations";

declare var BABYLON;

let pickableMeshes = [];
let pickableButtons = [];
let pickableMolecules = [];

// A sphere placed around the camera to aid navigation.
export let padNavSphereAroundCamera;

export const enum PickableCategory {
    // Note: const enum needed for closure-compiler compatibility.
    None = 1,
    Ground = 2,
    Button = 3,
    Molecule = 4,
    padNavSphereAroundCamera = 5,
}

/**
 * Sets the currently picked mesh.
 * @param  {*} mesh The mesh.
 */
export function setCurPickedMesh(mesh: any) { curPickedMesh = mesh; }
export let curPickedMesh;

/**
 * Sets up the pickables.
 * @returns void
 */
export function setup(): void {
    pickableMeshes.push(Vars.vrVars.groundMesh);
}

/**
 * Adds a mesh to the list of pickable buttons.
 * @param  {*} mesh The mesh.
 * @returns void
 */
export function addPickableButton(mesh: any): void {
    pickableMeshes.push(mesh);
    pickableButtons.push(mesh);
    Optimizations.optimizeMeshPicking(mesh);
    makeMeshMouseClickable({
        mesh,
        callBack: () => {
            // Here click the button rather than acting on the stare point
            // (default).
            mesh.clickFunc();
        },
    });
}

/**
 * Adds a mesh to the list of pickable molecule meshes.
 * @param  {*} mesh The mesh.
 * @returns void
 */
export function addPickableMolecule(mesh: any): void {
    pickableMeshes.push(mesh);
    pickableMolecules.push(mesh);
    Optimizations.optimizeMeshPicking(mesh);
    makeMeshMouseClickable({mesh});
}

/**
 * Determines if a given mesh is pickable.
 * @param  {*} mesh The mesh.
 * @returns boolean True if it is pickable. False otherwise.
 */
export function checkIfMeshPickable(mesh: any): boolean {
    // Floor is always pickable, even if not visible.
    if (mesh.id === Vars.vrVars.groundMesh.id) { return true; }

    // If not visible, then not pickable. Note that something could be
    // entirely transparent (visibility is 0), but it will still intercept the
    // stare point. This is by design.
    if (!mesh.isVisible) { return false; }
    // if (mesh.visibility === 0) { return false; }

    // Otherwise, pick only if in the list.
    return pickableMeshes.indexOf(mesh) !== -1;
}

/**
 * Get the category of the currently selected mesh.
 * @returns *
 */
export function getCategoryOfCurMesh(): PickableCategory {
    if (curPickedMesh === undefined) {
        return PickableCategory.None;
    } else if (curPickedMesh === Vars.vrVars.groundMesh) {
        return PickableCategory.Ground;
    } else if (pickableButtons.indexOf(curPickedMesh) !== -1) {
        return PickableCategory.Button;
    } else if (pickableMolecules.indexOf(curPickedMesh) !== -1) {
        return PickableCategory.Molecule;
    } else if (curPickedMesh === padNavSphereAroundCamera) {
        return PickableCategory.padNavSphereAroundCamera;
    } else {
        return PickableCategory.None;
    }
}

interface IMakeMeshClickableParams {
    mesh: any;
    callBack?: any;
    scene?: any;
}

/**
 * Make it so a given mesh can be clicked with the mouse.
 * @param  {Object<string,*>} params The parameters. See interface above.
 * @returns void
 */
export function makeMeshMouseClickable(params: IMakeMeshClickableParams): void {
    if (params.callBack === undefined) {
        params.callBack = Navigation.actOnStareTrigger;
    }

    if (params.scene === undefined) {
        params.scene = Vars.scene;
    }

    if (params.mesh === undefined) {
        return;
    }

    params.mesh.actionManager = new BABYLON.ActionManager(params.scene);
    params.mesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            () => {
                // If it's in VR mode, there are no mouse clicks. This is
                // important to prevent a double click with controllers.
                if (Vars.vrVars.navMode !== Navigation.NavMode.NoVR) {
                    // TODO: What about phones? Still clickable? May need to
                    // modify above.
                    return;
                }

                params.callBack();
            },
        ),
    );
}

/**
 * Places a cube around the canmera so you can navegate even when not pointing
 * at a molecule or anything. Good for pad-based navigation, but not
 * teleportation.
 * @returns void
 */
export function makePadNavigationSphereAroundCamera(): void {
    padNavSphereAroundCamera = BABYLON.Mesh.CreateSphere(
        "padNavSphereAroundCamera",
        4, Vars.MAX_TELEPORT_DIST - 1.0, Vars.scene,
    );
    padNavSphereAroundCamera.flipFaces(true);

    let mat = new BABYLON.StandardMaterial("padNavSphereAroundCameraMat", Vars.scene);
    mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
    mat.specularColor = new BABYLON.Color3(0, 0, 0);
    mat.opacityTexture = null;
    padNavSphereAroundCamera.material = mat;

    padNavSphereAroundCamera.visibility = 0.0;  // It's an invisible sphere.

    // Doing it this way so follows camera even if camera changes.
    Vars.scene.registerBeforeRender(() => {
        padNavSphereAroundCamera.position = CommonCamera.getCameraPosition();
    });

    // It needs to be pickable
    pickableMeshes.push(padNavSphereAroundCamera);

    // Pretend like it's a molecule. Teleportation will be disabled elsewhere.
    // addPickableMolecule(padNavSphereAroundCamera);
}
