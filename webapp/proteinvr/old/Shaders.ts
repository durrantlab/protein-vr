///<reference path="../../js/Babylonjs/dist/babylon.2.5.d.ts" />

import Shaders from "../Shader/Shader"

export class mySceneOptimizationCustomShaders extends BABYLON.SceneOptimization {
    public apply = (scene): boolean => {
        
        let shaderNames = Object.keys(Shaders.shadersLibrary);
        for (let i = 0; i < shaderNames.length; i++) {
            let shader = Shaders.shadersLibrary[shaderNames[i]];
            switch(this.priority) {
                case 3:
                    shader.optimizeRemoveAllButFirstColorTexture();
                    break;
                case 4:
                    shader.optimizeStopAnimation();
                    break;
                case 5:
                    shader.optimizeRemoveBakedShadows();
                    break;
                default:
                    alert("Error needs to be fixed here!")
            }
        }
        return true;
    };
}

export default mySceneOptimizationCustomShaders;