define(["require", "exports"], function (require, exports) {
    "use strict";
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
        Object.defineProperty(TriggerConditionalParent.prototype, "cameraPos", {
            get: function () {
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
            },
            enumerable: true,
            configurable: true
        });
        TriggerConditionalParent.prototype.distanceToCamera = function (vec3) {
            /**
            The distance from a 3D point to the camera.
    
            :param BABYLON.Vector3 vec3: The 3D point
    
            :returns: The distance.
            :rtype: :any:`number`
            */
            return BABYLON.Vector3.Distance(vec3, this.cameraPos);
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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = TriggerConditionalParent;
});
