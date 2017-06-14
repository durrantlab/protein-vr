define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var TriggerConditionalParent = (function () {
        function TriggerConditionalParent(params) {
            /**
            The class constructor
    
            :param any params: Parameters that govern the behavior of this
                       conditional trigger.
            */
            // Constructor sets the creation parameters.
            this.parameters = params;
        }
        TriggerConditionalParent.prototype.distanceToCamera = function (vec3) {
            /**
            The distance from a 3D point to the camera.
    
            :param BABYLON.Vector3 vec3: The 3D point
    
            :returns: The distance.
            :rtype: :any:`number`
            */
            return BABYLON.Vector3.Distance(vec3, PVRGlobals.camera.position);
        };
        TriggerConditionalParent.prototype.meshVisibleToCamera = function (mesh) {
            /**
            Determine whether or not a mesh is visible to the camera.
    
            :param any mesh: The mesh ini question.
    
            :returns: true if it is visible, false otherwise.
            :rtype: :any:`bool`
            */
            // Now check if the camera is looking at the target.
            var frustumPlanes = BABYLON.Frustum.GetPlanes(PVRGlobals.scene.getTransformMatrix());
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
    exports.default = TriggerConditionalParent;
});
