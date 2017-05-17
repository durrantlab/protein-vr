///<reference path="../../js/Babylonjs/dist/babylon.2.5.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Settings/UserVars"], function (require, exports, UserVars) {
    "use strict";
    exports.LODLevelOptions = [
        [40, 60],
        [15, 30],
        [5, 15]
    ];
    var mySceneOptimizationLOD = (function (_super) {
        __extends(mySceneOptimizationLOD, _super);
        function mySceneOptimizationLOD() {
            var _this = this;
            _super.apply(this, arguments);
            this.apply = function (scene) {
                switch (_this.priority) {
                    case 1:
                        // adjust the LOD distances to be more agressive.
                        adjustLODDistances(exports.LODLevelOptions[0]); // change this num
                        break;
                    case 2:
                        // adjust the LOD distances to be more agressive.
                        adjustLODDistances(exports.LODLevelOptions[1]); // change this num
                        break;
                    case 3:
                        // adjust the LOD distances to be more agressive.
                        adjustLODDistances(exports.LODLevelOptions[2]); // change this num
                        break;
                    default:
                        alert("Error in LOD code! Priority with unknown value!");
                }
                return true;
            };
        }
        return mySceneOptimizationLOD;
    }(BABYLON.SceneOptimization));
    exports.mySceneOptimizationLOD = mySceneOptimizationLOD;
    function isMeshEligibleForLOD(m) {
        if (m.subMeshes === undefined) {
            console.log("Can't autoLOD", m.name, "because it has no verticies.");
            return false;
        }
        else if (m.name.indexOf("Decimated") !== -1) {
            console.log("Will not alter", m.name, "(contains word \"Decimated\")");
            return false;
        }
        else if (m.subMeshes[0].verticesCount < 5000) {
            console.log("mesh ", m.name, "has fewer than 5000 verticies. Not worth simplifying");
            return false;
        }
        else {
            return true;
        }
    }
    function adjustLODDistances(dists) {
        // Make sure that it's never better than the user-specified resolution.
        var bestLODDistsAllowed = exports.LODLevelOptions[UserVars.getParam("objects")];
        if (bestLODDistsAllowed[0] < dists[0]) {
            dists = bestLODDistsAllowed;
        }
        var dist1 = dists[0];
        var dist2ForNull = dists[1];
        for (var i = 0; i < PVRGlobals.scene.meshes.length; i++) {
            var m = PVRGlobals.scene.meshes[i];
            if (m.hasLODLevels === true) {
                // Get LOD distances
                var curLODDist1 = void 0;
                var curLODDist2 = void 0;
                if (m._LODLevels[1].mesh === null) {
                    curLODDist1 = m._LODLevels[0].distance;
                    curLODDist2 = m._LODLevels[1].distance;
                }
                else {
                    curLODDist1 = m._LODLevels[1].distance;
                    curLODDist2 = m._LODLevels[0].distance;
                }
                // Get the meshes at those levels.
                var lodLevel1 = m.getLODLevelAtDistance(curLODDist1);
                var lodLevel2 = m.getLODLevelAtDistance(curLODDist2);
                // let lodMesh3 = m.getLODLevelAtDistance(CurLODDist3);
                // Remove those from the mesh
                m.removeLODLevel(lodLevel1);
                m.removeLODLevel(lodLevel2);
                // m.removeLODLevel(lodMesh3);
                // Add them back in, with new distances
                m.addLODLevel(dist1, lodLevel1);
                m.addLODLevel(dist2ForNull, lodLevel2);
            }
        }
    }
    exports.adjustLODDistances = adjustLODDistances;
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = mySceneOptimizationLOD;
});
