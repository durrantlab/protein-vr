import CameraChar from "../../CameraChar";
import Core from "../../Core/Core";

declare var BABYLON;

abstract class TriggerConditionalParent {
    /**
     * All TriggerConditional class inherit this one.
     */

    // Check if the condition is satisfied.

    /**
     * Check if the conditions of this trigger are satisfied.
     * @param  {any}     params  General function parameters.
     * @return {boolean}         true if the conditions are satisfied, false
     *                           otherwise.
     */
    public abstract check(params: any): boolean;

    /**
     * Class variable to store parameters.
     */
    public parameters: any;

    constructor(params: any) {
        /**
         * The class constructor
         * @param  {any}    params  Parameters that govern the behavior of this
         *                          conditional trigger.
         */

        // Constructor sets the creation parameters.
        this.parameters = params;
    }

    // Helpful functions and variables.

    public get cameraPos(): any {
        /**
         * Get the current location of the scene camera. A convenience function.
         * @return {BABYLON.Vector3}   The location of the camera.
         */

        return CameraChar.camera.position;
    }

    public distanceToCamera(vec3: any): number {
        /**
         * The distance from a 3D point to the camera.
         * @param  {BABYLON.Vector3} vec3 The 3D point
         * @return {number}               The distance.
         */

        return BABYLON.Vector3.Distance(vec3, this.cameraPos);
    }

    public meshVisibleToCamera(mesh: any): boolean {
        /**
         * Determine whether or not a mesh is visible to the camera.
         * @param  {any}     mesh The mesh ini question.
         * @return {boolean}      true if it is visible, false otherwise.
         */

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
