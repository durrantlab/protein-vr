// Functions from loading molecules in GLTF format into the scene.

import * as VRVoiceCommands from "../Navigation/VoiceCommands";
import * as LoadingScreens from "../UI/LoadingScreens";
import * as Vars from "../Vars";
import * as CommonLoader from "./CommonLoader";

declare var BABYLON;

/**
 * Load in the extra molecule meshes.
 * @param  {Object<string,*>} sceneInfoData The data from scene_info.json.
 * @returns void
 */
export function setup(sceneInfoData: any): void {
    let assetsManager = new BABYLON.AssetsManager(Vars.scene);

    for (let idx in sceneInfoData["objIDs"]) {
        if (sceneInfoData["objIDs"].hasOwnProperty(idx)) {
            let objID = sceneInfoData["objIDs"][idx];
            let meshTask = assetsManager.addMeshTask(objID, "", "./", objID + ".gltf");
            meshTask.onSuccess = (task) => {
                // Get the meshes.
                for (let uniqStrID in task.loadedMeshes) {
                    if (task.loadedMeshes.hasOwnProperty(uniqStrID)) {
                        let uniqIntID = parseInt(uniqStrID, 10);
                        let mesh = task.loadedMeshes[uniqIntID];

                        CommonLoader.setupMesh(
                            mesh, objID, sceneInfoData["shadowQuality"], uniqIntID,
                        );
                    }
                }
            };
        }
    }

    assetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
        let msg = "Loading molecular meshes... " + remainingCount + " of " + totalCount + " remaining.";
        LoadingScreens.babylonJSLoadingMsg(msg);
    };

    assetsManager.onFinish = (tasks) => {
        CommonLoader.afterLoading(sceneInfoData);
    };

    // console.log(Vars.scene.getWaitingItemsCount());
    assetsManager.load();
}
