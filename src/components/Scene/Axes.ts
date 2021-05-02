// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import { Color3, Mesh, Quaternion, StandardMaterial, TransformNode, Vector3 } from "@babylonjs/core";
import * as Vars from "../Vars/Vars";

// Get an empty node to serve as parent for the axes.
export var axesMesh;

/**
 * Draws a line (cylinder) between two points.
 * @param  {*} vstart                       Starting point.
 * @param  {*} vend                         Ending point.
 * @param  {*} color                        Color.
 * @param  {bool} [isArrowHead=false]       Whether this is drawing an
 *                                          arrowhead.
 * @param  {bool} [reverseArrowHead=false]  Whether the direction of the
 *                                          arrowhead should be reversed.
 * @returns void
 */
function drawBarBetweenPoints(vstart: any, vend: any, color: any, isArrowHead = false, reverseArrowHead = false): void {
    // Adapted from https://www.babylonjs-playground.com/#1RWE59#12
    let distance = Vector3.Distance(vstart, vend);
    let cylinder = Mesh.CreateCylinder(
        "cylinder",
        distance,
        isArrowHead ? (reverseArrowHead ? 0.0 : 0.3) : 0.1,
        isArrowHead ? (reverseArrowHead ? 0.3 : 0.0) : 0.1,
        16,
        Vars.scene,
        // true
    );
    cylinder.position = vstart.add(vend).scale(0.5);

    let v1 = vend.subtract(vstart);
    v1.normalize();

    let v2 = new Vector3(0, 1, 0);
    let axis = Vector3.Cross(v1, v2);
    axis.normalize();
    let angle = Vector3.Dot(v1, v2);

    cylinder.rotationQuaternion = Quaternion.RotationAxis(axis, Math.PI / 2 + angle);

    let mat = new StandardMaterial("mat", Vars.scene)
    mat.specularColor = color;
    mat.diffuseColor = color;
    cylinder.material = mat;

    cylinder.parent = axesMesh;

    if (!isArrowHead) {
        drawBarBetweenPoints(vend, vend.add(v1.scale(0.25)), color, true, reverseArrowHead);
    }
}

/**
 * Show global axes so the molecule rotations make more sense.
 * @returns void
 */
export function showAxes(): void {
    axesMesh = new TransformNode("axes");

    // Get the protein box for positioning
    let proteinMesh = Vars.scene.getMeshByName("protein_box");
    const containingBox = proteinMesh.getBoundingInfo().boundingBox;
    // const containingBoxDimens = Object.keys(containingBox.maximumWorld).map(
    //     (k) => containingBox.maximumWorld[k] - containingBox.minimumWorld[k],
    // );
    const containingBoxDimens = [
        containingBox.maximumWorld.x - containingBox.minimumWorld.x,
        containingBox.maximumWorld.y - containingBox.minimumWorld.y,
        containingBox.maximumWorld.z - containingBox.minimumWorld.z
    ]

    let maxDim = Math.max(...containingBoxDimens);

    let size = 0.5 * maxDim;

    drawBarBetweenPoints(
        Vector3.Zero(),
        new Vector3(size, 0, 0),
        new Color3(1, 0, 0),
    );

    drawBarBetweenPoints(
        Vector3.Zero(),
        new Vector3(0, size, 0),
        new Color3(0, 1, 0),
        false, true
    );

    drawBarBetweenPoints(
        Vector3.Zero(),
        new Vector3(0, 0, size),
        new Color3(0, 0, 1),
    );

    axesMesh.position = containingBox.centerWorld;

    axesMesh.setEnabled(false);
}
