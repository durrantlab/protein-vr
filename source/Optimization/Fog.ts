///<reference path="../../js/Babylonjs/dist/babylon.2.4.d.ts" />

import Core from "../Core/Core";
import Environment from "../Environment";

export class mySceneOptimizationFog extends BABYLON.SceneOptimization {
    public apply = (scene): boolean => {
        
        switch (this.priority) {
            case 5:
                // Fog far away
                Environment.setFog(0.05);

                // No need to render things beyond the fog.
                Core.scene.activeCamera.maxZ = 30;  // nothing visible beyond 30 anyway.

                break;
            case 6:
                // Not so far away.
                Environment.setFog(0.5);

                Core.scene.activeCamera.maxZ = 15;
                break;
            default:
                alert("Error with fog priority value!");
        }

        return true;
    };
}

function allObjsReceiveFog() {

}

export default mySceneOptimizationFog;