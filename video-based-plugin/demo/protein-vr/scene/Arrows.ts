import * as Globals from "../config/Globals";
import { RenderingGroups } from "../config/Globals";
import { getMeshThatContainsStr } from "./Setup";

var _arrowMeshes = [];

export function setup() {
    let BABYLON = Globals.get("BABYLON");
    let scene = Globals.get("scene");

    // Get the arrow mesh
    let arrowMesh = getMeshThatContainsStr("ProteinVR_Arrow", scene);

    // Clone it and put it in an array.
    _arrowMeshes = [arrowMesh];
    for (let i = 1; i < Globals.get("numNeighboringCameraPosForNavigation"); i++) {
        _arrowMeshes.push(arrowMesh.clone("ProteinVR_Arrow_clone" + i.toString()));
    }
    
    // Update all arrows
    for (let i=0; i<_arrowMeshes.length; i++) {
        let thisArrowMesh = _arrowMeshes[i];
        
        // Make it's material.
        let mat = new BABYLON.StandardMaterial("arrowMat" + i.toString(), scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        mat.specularColor = new BABYLON.Color3(0, 0, 0);
        mat.emissiveColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        mat.diffuseTexture = null;
        mat.emissiveTexture = null;; // videoTexture;
        thisArrowMesh.material = mat;
    
        // Additional settings
        thisArrowMesh.renderingGroupId = RenderingGroups.VisibleObjects;
        thisArrowMesh.isPickable = false;
        thisArrowMesh.scaling = new BABYLON.Vector3(0.5, 0.5, 0.5);
        thisArrowMesh.backFaceCulling = false;

        // Make it a ghost arrow.
        thisArrowMesh.visibility = 1.0;  // ghost arrow.        
    }
}

export function fadeDownAll(val) {
    // fade all arrows that are visible down.
    for (let i=0; i<_arrowMeshes.length; i++) {
        let arrow = _arrowMeshes[i];
        if (arrow.visibility > 0) {
            arrow.visibility = val;
        }
    }
}

export function update(cameraPoints) {
    let scene = Globals.get("scene");

    // All arrows are initially hidden
    for (let i=0; i<_arrowMeshes.length; i++) {
        _arrowMeshes[i].visibility = 0.0;
    }

    // Get the camera position
    let cameraPos = scene.activeCamera.position;

    // Go through each of the cameraPoints and position an arrow there.
    for (let i=0; i<cameraPoints.length(); i++) {
        let arrowToUse = _arrowMeshes[i];
        arrowToUse.visibility = 1.0;

        let neighboringCameraPointPosition = cameraPoints.get(i).position;
        let vec = neighboringCameraPointPosition.subtract(cameraPos).normalize().scale(4.0);
        arrowToUse.position = cameraPos.add(vec);
        arrowToUse.position.y = arrowToUse.position.y - 1.0;
        arrowToUse.lookAt(
            cameraPos.add(vec.scale(8.0))
        );
    }
}