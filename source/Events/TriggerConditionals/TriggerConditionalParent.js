define(["require", "exports", "../../CameraChar", "../../Core/Core"], function (require, exports, CameraChar_1, Core_1) {
    "use strict";
    /**
     * All TriggerConditional class inherit this one.
     */
    var TriggerConditionalParent = (function () {
        /**
         * The class constructor
         * @param  {any}    params  Parameters that govern the behavior of this
         *                          conditional trigger.
         */
        function TriggerConditionalParent(params) {
            // Constructor sets the creation parameters.
            this.parameters = params;
        }
        Object.defineProperty(TriggerConditionalParent.prototype, "cameraPos", {
            // Helpful functions and variables.
            /**
             * Get the current location of the scene camera. A convenience function.
             * @return {BABYLON.Vector3}   The location of the camera.
             */
            get: function () {
                return CameraChar_1.default.camera.position;
            },
            enumerable: true,
            configurable: true
        });
        /**
         * The distance from a 3D point to the camera.
         * @param  {BABYLON.Vector3} vec3 The 3D point
         * @return {number}               The distance.
         */
        TriggerConditionalParent.prototype.distanceToCamera = function (vec3) {
            return BABYLON.Vector3.Distance(vec3, this.cameraPos);
        };
        /**
         * Determine whether or not a mesh is visible to the camera.
         * @param  {any}     mesh The mesh ini question.
         * @return {boolean}      true if it is visible, false otherwise.
         */
        TriggerConditionalParent.prototype.meshVisibleToCamera = function (mesh) {
            // Now check if the camera is looking at the target.
            var frustumPlanes = BABYLON.Frustum.GetPlanes(Core_1.default.scene.getTransformMatrix());
            if (mesh.isInFrustum(frustumPlanes)) {
                return true;
            }
            else {
                return false;
            }
            // You might also check through picking if it's visible or behind
            // other meshes...
        };
        return TriggerConditionalParent;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TriggerConditionalParent;
});
