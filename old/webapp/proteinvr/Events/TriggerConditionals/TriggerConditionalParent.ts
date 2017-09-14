import * as CameraChar from "../../CameraChar";
import * as Core from "../../Core/Core";

declare var BABYLON;
declare var PVRGlobals;

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
    public abstract checkIfTriggered(params: any): boolean;

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

    public distanceToCamera(vec3: any): number {
        /**
        The distance from a 3D point to the camera.

        :param BABYLON.Vector3 vec3: The 3D point

        :returns: The distance.
        :rtype: :any:`number`
        */

        return BABYLON.Vector3.Distance(vec3, PVRGlobals.camera.position);
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
