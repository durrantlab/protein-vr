declare var BABYLON;
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
    let distance = BABYLON.Vector3.Distance(vstart, vend);
    let cylinder = BABYLON.Mesh.CreateCylinder(
        "cylinder",
        distance,
        isArrowHead ? (reverseArrowHead ? 0.0 : 0.3) : 0.1,
        isArrowHead ? (reverseArrowHead ? 0.3 : 0.0) : 0.1,
        16,
        Vars.scene,
        true
    );
    cylinder.position = vstart.add(vend).scale(0.5);

    let v1 = vend.subtract(vstart);
    v1.normalize();

    let v2 = new BABYLON.Vector3(0, 1, 0);
    let axis = BABYLON.Vector3.Cross(v1, v2);
    axis.normalize();
    let angle = BABYLON.Vector3.Dot(v1, v2);

    cylinder.rotationQuaternion = BABYLON.Quaternion.RotationAxis(axis, Math.PI / 2 + angle);

    let mat = new BABYLON.StandardMaterial("mat", Vars.scene)
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
    axesMesh = new BABYLON.TransformNode("axes");

    // Get the protein box for positioning
    let proteinMesh = Vars.scene.getMeshByName("protein_box");
    const containingBox = proteinMesh.getBoundingInfo().boundingBox;
    // const containingBoxDimens = Object.keys(containingBox.maximumWorld).map(
    //     (k) => containingBox.maximumWorld[k] - containingBox.minimumWorld[k],
    // );
    const containingBoxDimens = [
        containingBox.maximumWorld["x"] - containingBox.minimumWorld["x"],
        containingBox.maximumWorld["y"] - containingBox.minimumWorld["y"],
        containingBox.maximumWorld["z"] - containingBox.minimumWorld["z"]
    ]

    let maxDim = Math.max(...containingBoxDimens);

    let size = 0.5 * maxDim;

    drawBarBetweenPoints(
        new BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(size, 0, 0),
        new BABYLON.Color3(1, 0, 0),
    );

    drawBarBetweenPoints(
        new BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, size, 0),
        new BABYLON.Color3(0, 1, 0),
        false, true
    );

    drawBarBetweenPoints(
        new BABYLON.Vector3.Zero(),
        new BABYLON.Vector3(0, 0, size),
        new BABYLON.Color3(0, 0, 1),
    );

    axesMesh.position = containingBox.centerWorld;

    axesMesh.setEnabled(false);
}
