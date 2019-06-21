import * as PositionInScene from "../../Mols/3DMol/PositionInScene";
import * as VRML from "../../Mols/3DMol/VRML";
import * as Vars from "../../Vars";

/**
 * Builds a submenu object describing how the models and be rotated.
 * @returns Object The submenu objct.
 */
export function buildRotationsSubMenu(): any {
    let amt = 15.0 * Math.PI / 180.0;
    return {
        "X Axis": () => {
            VRML.updateMolRotation("x", amt);
            PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));
        },
        "Y Axis": () => {
            VRML.updateMolRotation("y", amt);
            PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));
        },
        "Z Axis": () => {
            VRML.updateMolRotation("z", amt);
            PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));
        },
        // "-X Axis": () => {
        //     VRML.updateMolRotation("x", -amt);
        //     PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));
        // },
        // "-Y Axis": () => {
        //     VRML.updateMolRotation("y", -amt);
        //     PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));
        // },
        // "-Z Axis": () => {
        //     VRML.updateMolRotation("z", -amt);
        //     PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));
        // },
    };
}
