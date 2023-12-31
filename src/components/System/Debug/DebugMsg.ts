// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Functions to display messages in the VR world. To make debugging easier on
// devices like Oculus Go.

import { DynamicTexture, Mesh, StandardMaterial } from "@babylonjs/core";
import * as Vars from "../../Vars/Vars";

let msg = "";
let dynamicTexture: any;
const font = "bold 52px verdana";
let width = 0;
let alreadySetup = false;
let plane;

/**
 * Sets the msg global variable.
 * @param  {string} m  The new value.
 * @returns void
 */
export function setDebugMsg(m: string): void {
    msg = m;
}

/**
 * Sets up the debugging msg.
 * @returns void
 */
export function setup(): void {
    if (alreadySetup === true) {
        return;
    }
    alreadySetup = true;
    dynamicTexture = new DynamicTexture("DynamicTexture", 512, Vars.scene, true);
    dynamicTexture.hasAlpha = true;
    const name = "Menion";
    const ctx =  dynamicTexture.getContext();
    ctx.font= font;
    width = ctx.measureText(name).width;
    dynamicTexture.drawText(name, 256 - width/2, 52, font, "lightblue", ""); //write "red" into the last parameter to see the nameplate
    dynamicTexture.uScale = 1;
    dynamicTexture.vScale = 0.125;
    dynamicTexture.update(false);

    plane = Mesh.CreatePlane("nameplate", 10, Vars.scene, false);
    plane.rotation.x = Math.PI;
    plane.scaling.y = 0.125;
    plane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    const mat = new StandardMaterial("nameplateMat", Vars.scene);
    mat.diffuseTexture = dynamicTexture;
    mat.backFaceCulling = false;

    plane.material = mat;
    updateText();
}

/**
 * Updates the message text, using the value in msg.
 * @returns void
 */
function updateText(): void {
    dynamicTexture.update(true);
    dynamicTexture.getContext().clearRect(0, 0, dynamicTexture.getSize().width, dynamicTexture.getSize().height);
    dynamicTexture.drawText(msg, 256 - width / 2, 52, font, "lightblue", "");
    dynamicTexture.update(false);
    setTimeout(updateText, 100);
}
