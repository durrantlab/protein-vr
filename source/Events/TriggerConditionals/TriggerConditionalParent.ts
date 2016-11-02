import CameraChar from "../../CameraChar";
import Core from "../../Core/Core";

declare var BABYLON;

/**
 * All TriggerConditional class inherit this one.
 */
abstract class TriggerConditionalParent {
    // Check if the condition is satisfied.

    /**
     * Check if the conditions of this trigger are satisfied.
     * @param  {any}     params  General function parameters.
     * @return {boolean}         true if the conditions are satisfied, false
     *                           otherwise.
     */
    public abstract check(params: any): boolean;

    // Class variable to store creation parameters.
    public parameters: any;

    /**
     * The class constructor
     * @param  {any}    params  Parameters that govern the behavior of this
     *                          conditional trigger.
     */
    constructor(params: any) {
        // Constructor sets the creation parameters.
        this.parameters = params;
    }

    // Helpful functions and variables.

    /**
     * Get the current location of the scene camera. A convenience function.
     * @return {BABYLON.Vector3}   The location of the camera.
     */
    public get cameraPos(): any {
        return CameraChar.camera.position;
    }

    /**
     * The distance from a 3D point to the camera.
     * @param  {BABYLON.Vector3} vec3 The 3D point
     * @return {number}               The distance.
     */
    public distanceToCamera(vec3: any): number {
        return BABYLON.Vector3.Distance(vec3, this.cameraPos);
    }

    /**
     * Determine whether or not a mesh is visible to the camera.
     * @param  {any}     mesh The mesh ini question.
     * @return {boolean}      true if it is visible, false otherwise.
     */
    public meshVisibleToCamera(mesh: any): boolean {
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
