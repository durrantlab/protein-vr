// Copyright 2019 Jacob D. Durrant

// Functions to display messages in the VR world. To make debugging easier on
// devices like Oculus Go.

import * as Vars from "../Vars/Vars";

declare var BABYLON: any;

let msg = "";
let dynamicTexture: any;
const font = "bold 52px verdana";
let width = 0;
let alreadySetup = false;
let plane;

export function setMsg(m: string): void {
    msg = m;
}

export function setup(): void {
    if (alreadySetup === true) {
        return;
    }
    alreadySetup = true;
    dynamicTexture = new BABYLON.DynamicTexture("DynamicTexture", 512, Vars.scene, true);
    dynamicTexture.hasAlpha = true;
    const name = "Menion";
    const ctx =  dynamicTexture.getContext();
    ctx.font= font;
    width = ctx.measureText(name).width;
    dynamicTexture.drawText(name, 256 - width/2, 52, font, "lightblue", ""); //write "red" into the last parameter to see the nameplate
    dynamicTexture.uScale = 1;
    dynamicTexture.vScale = 0.125;
    dynamicTexture.update(false);

    plane = BABYLON.Mesh.CreatePlane("nameplate", 10, Vars.scene, false);
    plane.rotation.x = Math.PI;
    plane.scaling.y = 0.125;
    plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
    const mat = new BABYLON.StandardMaterial("nameplateMat", Vars.scene);
    mat.diffuseTexture = dynamicTexture;
    mat.backFaceCulling = false;

    plane.material = mat;
    updateText();
}

function updateText() {
    dynamicTexture.update(true);
    dynamicTexture.getContext().clearRect(0, 0, dynamicTexture.getSize().width, dynamicTexture.getSize().height);
    dynamicTexture.drawText(msg, 256 - width / 2, 52, font, "lightblue", "");
    dynamicTexture.update(false);
    setTimeout(updateText, 100);
}
