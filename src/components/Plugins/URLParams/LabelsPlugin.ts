import { URLParamsParent } from "./URLParamsParent";
import { scene } from "../../Vars/Vars";
import { nonMolMeshesTransformNode } from '../../Mols/3DMol/PositionInScene';
import { geoCenter, showLoadMoleculeError } from "../../Mols/3DMol/VRML";
import { registerHook, HookTypes, IRunHooksParams } from '../Hooks/Hooks';
import { menuInf } from '../../UI/Menus/Menu3D/Menu3D';
import { axisRotation } from "../../UI/Menus/Menu3D/Rotations";
declare var BABYLON;

const LABEL_RATIO_HEIGHT_TO_WIDTH = 0.25;

export class LabelsPlugin extends URLParamsParent {
    protected getRelevantParams(allParams: Map<string, any>): any[][] {
        const paramNames = allParams.keys();
        let relevantParams: any[][] = [];
        for (let paramName of paramNames) {
            const regex = /^l[0-9]+?$/g;
            const found = paramName.match(regex);
            if (found !== null) {
                const paramVal = allParams.get(paramName);
                relevantParams.push([paramName, paramVal]);
            }
        }
        return relevantParams;
    }

    private getLabelInfo(lbl: string) {
        // Figure out font size. See
        // https://doc.babylonjs.com/divingDeeper/materials/using/dynamicTexture#fit-text-into-an-area
        // Get a temporary texture to write text on.
        let height = LABEL_RATIO_HEIGHT_TO_WIDTH * 512;
        let width = 512;

        let tmpTex = new BABYLON["GUI"]["AdvancedDynamicTexture"]("tmp", 512, height);

        let ctx = tmpTex.getContext();

        // Get the font size
        let size = 12;   // any value will work
        ctx.font = size.toString() + "px sans-serif";
        let textWidth = ctx.measureText(lbl).width;
        let ratio2 = textWidth/size;
        let fontSize = Math.floor(325 / ratio2);

        // Clear from memory.
        tmpTex.dispose();
        tmpTex = null;

        if (fontSize < 74) {
            // Fonts smaller than this look alright.
            return {
                width: width,
                height: height,
                fontSize: fontSize,
            }
        }

        // Prevent the font size from getting bigger than 74. Instead, adjust
        // the plane dimensions.
        fontSize = 74;  // 74 is biggest one that looks good

        width = lbl.length * 85;  // Guess based on length of string.

        // Below didn't work well, but leaving it here in case it helps in the future.
        // // Now that you've settled on the font size, figure out the dimensions
        // // of the text.
        // ctx.font = fontSize.toString() + "px sans-serif";
        // let measure = ctx["measureText"](lbl);
        // textWidth = measure["width"];
        // // let textHeight = measure["actualBoundingBoxAscent"] - measure["actualBoundingBoxDescent"];
        // // debugger;
        // width *= fontSize / textWidth;
        // width += 25;
        // // let texWidth = texHeight * textWidth / textHeight;
        // // let new_height_to_width = height / width;

        let toreturn = {
            width: width,
            height: height,
            fontSize: fontSize,
            // planeHeightToWidth: new_height_to_width
        }
        return toreturn;
    }

    protected actOnParam(paramName: string, paramVal: any): void {
        let params;
        try {
            params = JSON.parse(paramVal);
        } catch(e) {
            showLoadMoleculeError(null, -9999, "Is the molecule file properly formatted?", "");
            return;
        }
        let x = params["c"][0];
        let y = params["c"][1];
        let z = params["c"][2];
        let lbl = params["t"];

        // Below are optional parameters
        let s = params["s"] ? params["s"] : 1;
        let v = params["v"] ? params["v"] : false;
        // let noScale = params["ns"] ? params["ns"] : false;

        // You need to convert between PDB coordinate system and BAYLON coordinate system.
        let babylonVec = new BABYLON["Vector3"](z, y, x);

        let lblInfo = this.getLabelInfo(lbl);

        // See https://www.babylonjs-playground.com/#XCPP9Y#20 and
        // https://playground.babylonjs.com/#ZI9AK7#1 for inspiration.

        // Get the node where the plane will be located.
        let labelNode = new BABYLON["TransformNode"]("labelNode:" + lbl);
        labelNode["parent"] = nonMolMeshesTransformNode
        labelNode["position"] = babylonVec;  // .add(new BABYLON["Vector3"](0.8, 1.0, -0.2));

        // var plane = BABYLON["Mesh"]["CreatePlane"]("plane:" + lbl, 2);
        let plane = BABYLON["MeshBuilder"]["CreatePlane"]("plane", {width: lblInfo.width / 512, height: lblInfo.height / 512}, scene);

        plane["scaling"] = new BABYLON["Vector3"](1, 1, 1)["scale"](0.5)["scale"](s);
        plane["billboardMode"] = BABYLON["Mesh"]["BILLBOARDMODE_ALL"];
        plane["parent"] = labelNode;
        let origScalingToMaintain = plane["scaling"].clone();  // Add custom property so no scaling when rotating.

        if (v) {
            plane["renderingGroupId"] = 3;
        }

        // var advancedTexture = BABYLON["GUI"]["AdvancedDynamicTexture"]["CreateForMesh"](plane, 512, LABEL_RATIO_HEIGHT_TO_WIDTH * 512);
        var advancedTexture = BABYLON["GUI"]["AdvancedDynamicTexture"]["CreateForMesh"](plane, lblInfo.width, lblInfo.height);
        var rect1 = new BABYLON["GUI"]["Rectangle"]();
        rect1["width"] = 1;
        rect1["height"] = 1; //  "80px";
        rect1["cornerRadius"] = 200;
        rect1["color"] = "black";
        rect1["thickness"] = 4;
        rect1["background"] = "white";
        rect1["alpha"] = 0.8;
        advancedTexture["addControl"](rect1);
        rect1["linkWithMesh"](labelNode);

        var label = new BABYLON["GUI"]["TextBlock"]();
        label["text"] = lbl;

        // // Figure out font size. See
        // // https://doc.babylonjs.com/divingDeeper/materials/using/dynamicTexture#fit-text-into-an-area
        // var ctx = advancedTexture.getContext();
        // debugger;
        // var size = 12;   // any value will work
        // ctx.font = size + "px "
        // var textWidth = ctx.measureText(lbl).width;
        // var ratio2 = textWidth/size;
        // var font_size = Math.floor(325 / ratio2);
        label["fontSize"] = lblInfo.fontSize;  // 74 is biggest one that looks good

        rect1["addControl"](label);

        // Adjust for new center of geometry every time a new mesh is loaded.

        registerHook(HookTypes.ON_ADD_OR_REMOVE_MOL_MESH, () => {
            // Adjust node to compensate for new geo center.
            labelNode["position"] = babylonVec.subtract(geoCenter);
            axisRotation("REDRAW");
        });

        // Adjust zoom every time rotates so that it doesn't change.
        registerHook(HookTypes.ON_ROTATE, (params: IRunHooksParams) => {
            plane.scaling = new BABYLON.Vector3(
                origScalingToMaintain.x / params.scaling.x,
                origScalingToMaintain.y / params.scaling.y,
                origScalingToMaintain.z / params.scaling.z
            );
        });
    }
}
