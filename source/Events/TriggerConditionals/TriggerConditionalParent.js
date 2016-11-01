define(["require", "exports", "../../CameraChar", "../../Core/Core"], function (require, exports, CameraChar_1, Core_1) {
    "use strict";
    var TriggerConditionalParent = (function () {
        // Constructor sets the creation parameters.
        function TriggerConditionalParent(params) {
            this.parameters = params;
        }
        Object.defineProperty(TriggerConditionalParent.prototype, "cameraPos", {
            // Helpful functions and variables.
            get: function () {
                return CameraChar_1.default.camera.position;
            },
            enumerable: true,
            configurable: true
        });
        TriggerConditionalParent.prototype.distanceToCamera = function (vec3) {
            return BABYLON.Vector3.Distance(vec3, this.cameraPos);
        };
        TriggerConditionalParent.prototype.meshVisibleToCamera = function (mesh) {
            // Check if the object is even visible.
            // if (mesh.isVisible === false) {
            //     return false;
            // }
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
