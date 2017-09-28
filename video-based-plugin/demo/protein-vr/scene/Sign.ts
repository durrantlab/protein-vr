import * as Globals from "../config/Globals";
import { RenderingGroups } from "../config/Globals";

export function setupAllSigns() {
    // Get the sign data
    let signData = Globals.get("signData");

    // Go through each one
    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");
    for (let i = 0; i < signData.length; i++) {
        // Get variables
        let sd = signData[i];
        let pos = sd["location"];
        pos = new BABYLON.Vector3(pos[0], pos[2], pos[1]); // note y and z reversed
        let text = sd["text"];
        // text = "This is a test dude. This is a test dude. This is a test dude. This is a test dude. This is a test dude. This is a test dude. "

        // Add plane
        let plane = BABYLON.Mesh.CreatePlane("signPlane" + i.toString(), 2.0, scene);  // size of plane hardcoded?
        plane.position = pos;
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;
        plane.renderingGroupId = RenderingGroups.VisibleObjects;
        
        // Make the texture with the text on it.
        let textureResolution = 1024;
        let fontSize = 80;
        let margin = 40;
        var planeTexture = new BABYLON.DynamicTexture("dynamicTexture" + i.toString(), textureResolution, scene, true);  // resolution hardcoded
        let textureContext = planeTexture.getContext();
        textureContext.font = `bold ${fontSize}px Arial`;
        textureContext.save();
        // textureContext.clearColor = new BABYLON.Color3(1.0, 1.0, 1.0);
        textureContext.fillStyle = "white";
        _wrapText(textureContext, text, margin, textureResolution, fontSize, textureResolution);
        textureContext.restore();
        planeTexture.update();

        // Make plane material
        let dynamicMaterial = new BABYLON.StandardMaterial('dynamicMaterial' + i.toString(), scene);
        dynamicMaterial.diffuseColor = new BABYLON.Color3(1.0, 1.0, 1.0);;
        dynamicMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
        dynamicMaterial.emissiveTexture = planeTexture;
        // dynamicMaterial.opacityTexture = planeTexture;
        dynamicMaterial.backFaceCulling = false;
        plane.material = dynamicMaterial;
    
    }
}

function _getLineData(line, context) {
    // Remove terminal and inital spaces
    line = line.replace(/\t/g, " ");
    line = line.replace(/ $/g, "");
    line = line.replace(/^ /g, "");

    // Get width
    let lineWidth = context.measureText(line).width;

    return {
        line: line,
        width: lineWidth
    }

}

function _wrapText(context, text, margin, maxWidth, lineHeight, textureResolution) {
    // Adapted from http://www.html5gamedevs.com/topic/8958-dynamic-texure-drawtext-attributes-get-text-to-wrap/
    // Set some variables
    let line = '';
    let words = text.split(' ');
    let align = "CENTER";
    
    // Get the lines
    let lines = [];
    let lineWidths = [];
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let testLineInf = _getLineData(testLine, context);
        if (testLineInf.width > maxWidth - 2 * margin && n > 0) {
            let lineInf = _getLineData(line, context);
            lines.push(lineInf.line);
            lineWidths.push(lineInf.width);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    let lineInf = _getLineData(line, context);
    lines.push(lineInf.line);
    lineWidths.push(lineInf.width);
    
    // Now draw those lines.
    let y = margin + lineHeight;
    if (align === "CENTER") {
        y = 0.5 * (textureResolution - (lines.length - 1) * lineHeight);
    }

    for (let n = 0; n < lines.length; n++) {
        let line = lines[n];
        let x = margin;
        if (align === "CENTER") {
            x = 0.5 * (textureResolution - lineWidths[n]);
        }
        context.fillText(line, x, y);
        y += lineHeight;
    }
}

interface MakeSignInterface {
    location: any,
    text: string
}

function makeSign(params: MakeSignInterface) {

}