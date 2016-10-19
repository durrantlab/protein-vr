define(["require", "exports", "../Core/Core", "../CameraChar"], function (require, exports, Core_1, CameraChar_1) {
    "use strict";
    var BuiltInTriggerConditionals;
    (function (BuiltInTriggerConditionals) {
        function distance(triggerMesh, cutoffDistance) {
            // The distance trigger function.
            var func = function () {
                // First check if the player is within a certain distance of the target.
                var dist = BABYLON.Vector3.Distance(this.triggerMesh.position, CameraChar_1.default.camera.position);
                Core_1.default.debugMsg("Distance from camera to " + this.triggerMesh.name + ": " + dist.toString());
                if (dist < this.cutoffDistance) {
                    Core_1.default.debugMsg("That distance is less than cutoff of " + this.cutoffDistance.toString());
                    // They are close to the target.
                    // Now check if the camera is looking at the target.
                    var frustumPlanes = BABYLON.Frustum.GetPlanes(Core_1.default.scene.getTransformMatrix());
                    if (triggerMesh.isInFrustum(frustumPlanes)) {
                        Core_1.default.debugMsg(this.triggerMesh.name + " is also visible to camera. So condition satisfied.");
                        return true;
                    }
                    else {
                        Core_1.default.debugMsg("But " + this.triggerMesh.name + " is not visible to camera.");
                        return false;
                    }
                }
                else {
                    Core_1.default.debugMsg("That distance is NOT less than cutoff of " + this.cutoffDistance.toString());
                    // They are not, so return false.
                    return false;
                }
            }.bind({
                triggerMesh: triggerMesh,
                cutoffDistance: cutoffDistance
            });
            return func;
        }
        BuiltInTriggerConditionals.distance = distance;
    })(BuiltInTriggerConditionals || (BuiltInTriggerConditionals = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BuiltInTriggerConditionals;
});
