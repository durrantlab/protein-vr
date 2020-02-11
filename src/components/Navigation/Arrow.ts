import * as Vars from "../Vars/Vars";
// import * as CommonCamera from "../Cameras/CommonCamera";
import * as Points from "../Navigation/Points";

declare var BABYLON;

// let arrowMesh: any;

export function loadArrow() {
    BABYLON.SceneLoader.ImportMeshAsync(null, "environs/arrow/", "arrow.babylon", Vars.scene).then(function (data) {
        // do something with the meshes and skeletons
        // particleSystems are always null for glTF assets
        let arrowMesh = data.meshes[0];
        arrowMesh.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
        var arrowMat = new BABYLON.StandardMaterial("arrowMat", Vars.scene);

        arrowMat.diffuseColor = new BABYLON.Color3(0.3, 0.35, 0.4);
        arrowMat.specularColor = new BABYLON.Color3(0, 0, 0);
        arrowMat.emissiveColor = new BABYLON.Color3(0.3, 0.35, 0.4);
        // arrowMat.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);

        arrowMesh.material = arrowMat;
        // arrowMesh.visibility = 0.75;

        let proteinBox = null;

        Vars.scene.registerBeforeRender(() => {
            if (proteinBox === null) {
                proteinBox = Vars.scene.getMeshByName("protein_box");
                if (proteinBox === null) {
                    // Not ready yet.
                    return;
                }
            }

            // Arrow beneith camera
            arrowMesh.position = Points.groundPointBelowCamera;

            // Pointing at center of protein box.
            arrowMesh.lookAt(proteinBox.position);
        });
    });
}

// export function updateArrowPosition() {
//     // let pos = CommonCamera.getCameraPosition();
//     // pos.y = 0;
//     // arrowMesh.position = pos;

// }
