declare var BABYLON;

import CameraChar from "../../CameraChar";
import Core from "../../Core/Core";

abstract class TriggerConditionalParent {
    // Check if the condition is satisfied.
    public abstract check(params: any): boolean;

    // Class variable to store creation parameters.
    public parameters: any;

    // Constructor sets the creation parameters.
    constructor(params: any) {
        this.parameters = params;
    }

    // Helpful functions and variables.
    public get cameraPos(): any {
        return CameraChar.camera.position;
    }

    public distanceToCamera(vec3) : number {
        return BABYLON.Vector3.Distance(vec3, this.cameraPos);
    }

    public meshVisibleToCamera(mesh: any): boolean {
        // Check if the object is even visible.
        // if (mesh.isVisible === false) {
        //     return false;
        // }

        // Now check if the camera is looking at the target.
        let frustumPlanes = BABYLON.Frustum.GetPlanes(Core.scene.getTransformMatrix());
        if (mesh.isInFrustum(frustumPlanes)) {
            return true;
        } else {
            return false;
        }

        // You might also check through picking if it's visible or behind
        // other meshes...
    }
}

export default TriggerConditionalParent;