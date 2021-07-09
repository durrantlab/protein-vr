// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.


import * as PositionInScene from "../../../Mols/3DMol/PositionInScene";
import * as VRML from "../../../Mols/3DMol/VRML";
import * as Vars from "../../../Vars/Vars";
import * as Lecturer from "../../../WebRTC/Lecturer";

/**
 * Builds a submenu object describing how the models and be rotated.
 * @returns Object  The submenu objct.
 */
export function buildRotationsSubMenu(): any {
    return {
        "Undo Rotate": () => {
            undoRotate();
        },
        "+X Axis": () => {
            axisRotation("x");
        },
        "-X Axis": () => {
            axisRotation("x", -1);
        },
        "+Y Axis": () => {
            axisRotation("y");
        },
        "-Y Axis": () => {
            axisRotation("y", -1);
        },
        "+Z Axis": () => {
            axisRotation("z");
        },
        "-Z Axis": () => {
            axisRotation("z", -1);
        },
    };
}

/**
 * Rotates the molecule about a given axis.
 * @param  {string} axis           The axis to rotate about.
 * @param  {number} [direction=1]  Direction to rotate (1 or -1). Defaults to
 *                                 1.
 * @returns void
 */
export function axisRotation(axis: string, direction: number = 1): void {
    let amt = direction * 15.0 * Math.PI / 180.0;

    if (axis === "REDRAW") {
        // Just to trigger redraw (helps position labels, for example).
        amt = 0;
        axis = "X";
    }

    VRML.updateMolRotation(axis, amt);
    let protBox = Vars.scene.getMeshByName("protein_box");
    PositionInScene.positionAll3DMolMeshInsideAnother(
        undefined, protBox, true
    );

    if (Lecturer.isLecturerBroadcasting) {
        // Let the student know about this change...
        Lecturer.sendUpdateMolRotCommand(axis);
    }
}

/**
 * Undo a previous rotation.
 * @returns void
 */
export function undoRotate(): void {
    const quat = PositionInScene.lastRotationQuatBeforeAnimation;
    VRML.setMolRotationQuat(quat);
    let protBox = Vars.scene.getMeshByName("protein_box");
    PositionInScene.positionAll3DMolMeshInsideAnother(
        undefined, protBox, true
    );

    if (Lecturer.isLecturerBroadcasting) {
        // Let the student know about this change...
        Lecturer.sendUndoRotCommand();
    }
}
