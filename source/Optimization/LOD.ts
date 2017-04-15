///<reference path="../../js/Babylonjs/dist/babylon.2.4.d.ts" />

import Core from "../Core/Core";

export class mySceneOptimizationLOD extends BABYLON.SceneOptimization {
    public apply = (scene): boolean => {
        switch (this.priority) {
            case 1:
                // adjust the LOD distances to be more agressive.
                adjustLODDistances(40, 60);  // change this num
                break;
            case 2:
                // adjust the LOD distances to be more agressive.
                adjustLODDistances(15, 30);  // change this num
                break;
            case 3:
                // adjust the LOD distances to be more agressive.
                adjustLODDistances(5, 15);  // change this num
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

function adjustLODDistances(dist1: number, dist2ForNull: number) { //, dist3ForNull: number) {
    for (let i = 0; i < Core.scene.meshes.length; i++) {
        let m = Core.scene.meshes[i];

        if (m.hasLODLevels === true) {
            // Get LOD distances
            let curLODDist1;
            let curLODDist2;

            if (m._LODLevels[1].mesh === null) {
                curLODDist1 = m._LODLevels[0].distance;
                curLODDist2 = m._LODLevels[1].distance;

                // nullMesh = m._LODLevels[0];
                // lodMesh = m._LODLevels[1];
            } else {
                curLODDist1 = m._LODLevels[1].distance;
                curLODDist2 = m._LODLevels[0].distance;
                // nullMesh = m._LODLevels[1];
                // lodMesh = m._LODLevels[0];                
            }

            // Get the meshes at those levels.
            let lodLevel1 = m.getLODLevelAtDistance(curLODDist1);
            let lodLevel2 = m.getLODLevelAtDistance(curLODDist2);
            // let lodMesh3 = m.getLODLevelAtDistance(CurLODDist3);

            // Remove those from the mesh
            m.removeLODLevel(lodLevel1);
            m.removeLODLevel(lodLevel2);

            // m.removeLODLevel(lodMesh3);

            // Add them back in, with new distances
            m.addLODLevel(dist1, lodLevel1);
            m.addLODLevel(dist2ForNull, lodLevel2);
            // m.addLODLevel(dist3ForNull, lodMesh3);
            console.log(m._LODLevels);
        }
    }
}

export default mySceneOptimizationLOD;