///<reference path="../../js/Babylonjs/dist/babylon.2.4.d.ts" />

import Core from "../Core/Core";

export class mySceneOptimizationLOD extends BABYLON.SceneOptimization {
    public apply = (scene): boolean => {
        switch (this.priority) {
            case 1:
                // adjust the LOD distances to be more agressive.
                adjustLODDistances(15, 40, 60);  // change this num
                break;
            case 2:
                // adjust the LOD distances to be more agressive.
                adjustLODDistances(5, 20, 30);  // change this num
                break;
            case 3:
                // adjust the LOD distances to be more agressive.
                adjustLODDistances(0.1, 10, 15);  // change this num
                break;
            default:
                alert("Error in LOD code! Priority with unknown value!");                
        }

        return true;
    };
}

function isMeshEligibleForLOD(m): boolean {
    if (m.subMeshes === undefined) {
        console.log("Can't autoLOD", m.name, "because it has no verticies.");
        return false;
    } else if (m.name.indexOf("Decimated") !== -1) {
        console.log("Will not alter", m.name, "(contains word \"Decimated\")");
        return false;
    } else if (m.subMeshes[0].verticesCount < 5000) {
        console.log("mesh ", m.name, "has fewer than 5000 verticies. Not worth simplifying");
        return false;
    } else {
        return true;
    }
}

export function autoLODMeshes() {
    for (let i = 0; i < Core.scene.meshes.length; i++) {
        let m = Core.scene.meshes[i];

        if (isMeshEligibleForLOD(m)) {
            // So it needs to be simplified
            // Only actually do it if it's never been done before.
            if (m["simplified"] === true) {
                console.log("Mesh", m.name, "already simplified.");
            } else {
                // So you need to decimate and add LOD
                console.log("simplifying mesh", m.name)

                // Max num veticies should be 5000
                let numVerticies = m.subMeshes[0].verticesCount;
                let ratio = 5000 / numVerticies;
                if (ratio > 1) {
                    ratio = 1;
                }
                
                // Enable auto LOD. In the future, the only
                // thing you'll adjust will be the distances.
                let settings = [
                    { quality: ratio, distance: 1000, optimizeMesh: true },
                    { quality: 0.4 * ratio, distance: 1001, optimizeMesh: true },
                    // { quality: 0.25 * ratio, distance: 40, optimizeMesh: true }
                ]

                m.addLODLevel(1002, null);


                m.simplify(settings, true, BABYLON.SimplificationType.QUADRATIC, function() {
                    // this is the mesh. This callback is for
                    this["simplified"] = true;
                    // every submesh, though. So everything
                    // here set multiple times (make sure
                    // okay)
                    //this.setRenderingGroupId(m, m.renderingGroupId);
                }.bind(m));
            }
        }
    }
}

export function autoLODDone() {
    // LOD is done async, so this tells you if it's done.
    for (let i = 0; i < Core.scene.meshes.length; i++) {
        let m = Core.scene.meshes[i];

        if (isMeshEligibleForLOD(m)) {
            // So it needs to be simplified
            if (m["simplified"] !== true) {
                // But it hasn't been simplified yet, so not done.
                return false;
            }
        }
    }

    // Everything checks out. autoLOD must be done.
    return true;

}

function adjustLODDistances(dist1: number, dist2: number, dist3ForNull: number) {
    for (let i = 0; i < Core.scene.meshes.length; i++) {
        let m = Core.scene.meshes[i];

        if (m.hasLODLevels === true) {
            // Get the current LOD levels
            let CurLODDist1 = m._LODLevels[0].distance;
            let CurLODDist2 = m._LODLevels[1].distance;
            let CurLODDist3 = m._LODLevels[2].distance;

            // Get the meshes at those levels.
            let lodMesh1 = m.getLODLevelAtDistance(CurLODDist1);
            let lodMesh2 = m.getLODLevelAtDistance(CurLODDist2);
            let lodMesh3 = m.getLODLevelAtDistance(CurLODDist3);

            // Remove those from the mesh
            m.removeLODLevel(lodMesh1);
            m.removeLODLevel(lodMesh2);
            m.removeLODLevel(lodMesh3);

            // Add them back in, with new distances
            m.addLODLevel(dist1, lodMesh1);
            m.addLODLevel(dist2, lodMesh2);
            m.addLODLevel(dist3ForNull, lodMesh3);
        }
    }
}

export default mySceneOptimizationLOD;