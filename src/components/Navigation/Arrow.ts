// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as Vars from "../Vars/Vars";
import * as Points from "../Navigation/Points";
import { Color3, SceneLoader, StandardMaterial, Vector3 } from "@babylonjs/core";

/**
 * Load the 3D arrow that points towards the protein.
 * @returns void
 */
export function loadArrow(): void {
    SceneLoader.ImportMeshAsync(null, "environs/arrow/", "arrow.babylon", Vars.scene).then(function (data) {
        // Do something with the meshes and skeletons
        // particleSystems are always null for glTF assets
        let arrowMesh = data.meshes[0];
        arrowMesh.scaling = new Vector3(0.2, 0.2, 0.2);
        var arrowMat = new StandardMaterial("arrowMat", Vars.scene);

        arrowMat.diffuseColor = new Color3(0.3, 0.35, 0.4);
        arrowMat.specularColor = new Color3(0, 0, 0);
        arrowMat.emissiveColor = new Color3(0.3, 0.35, 0.4);
        // arrowMat.ambientColor = new Color3(0.23, 0.98, 0.53);

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
