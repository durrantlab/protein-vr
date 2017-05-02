import * as CameraChar from "../../CameraChar";
import * as Core from "../../Core/Core";

declare var BABYLON;

abstract class TriggerConditionalParent {
    /**
    All TriggerConditional class inherit this one.
    */

    /**
    Check if the conditions of this trigger are satisfied.

    :param any params: General function parameters.

    :returns: true if the conditions are satisfied, false otherwise.
    :rtype: :any:`bool`
    */
    public abstract check(params: any): boolean;

    /**
    Class variable to store parameters.
    */
    public parameters: any;

    constructor(params: any) {
        /**
        The class constructor

        :param any params: Parameters that govern the behavior of this
                   conditional trigger.
        */

        // Constructor sets the creation parameters.
        this.parameters = params;
    }

    public get cameraPos(): any {
        /**
        Get the current location of the scene camera. A convenience function.

        :returns: The location of the camera.
        :rtype: :any:`BABYLON.Vector3`
        */

        // if (PVRGlobals.camera !== undefined) {
        return PVRGlobals.camera.position;
        // } else {
            // Not loaded yet?
            // return new BABYLON.Vector3(0,0,0);
        // }
    }

    public distanceToCamera(vec3: any): number {
        /**
        The distance from a 3D point to the camera.

        :param BABYLON.Vector3 vec3: The 3D point

        :returns: The distance.
        :rtype: :any:`number`
        */

        return BABYLON.Vector3.Distance(vec3, this.cameraPos);
    }

    public meshVisibleToCamera(mesh: any): boolean {
        /**
        Determine whether or not a mesh is visible to the camera.

        :param any mesh: The mesh ini question.

        :returns: true if it is visible, false otherwise.
        :rtype: :any:`bool`
        */

        // Now check if the camera is looking at the target.
        let frustumPlanes = BABYLON.Frustum.GetPlanes(PVRGlobals.scene.getTransformMatrix());
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
