import Core from "../Core/Core";
import CameraChar from "../CameraChar";

declare var BABYLON;

// Useful variables:
// Location of camera: CameraChar.camera.position


namespace BuiltInTriggerConditionals {
    export function distance(triggerMesh, cutoffDistance: number): boolean {

        // The distance trigger function.
        let func = function() {

            // First check if the player is within a certain distance of the target.
            let dist: number = BABYLON.Vector3.Distance(this.triggerMesh.position, CameraChar.camera.position);
            Core.debugMsg("Distance from camera to " + this.triggerMesh.name + ": " + dist.toString());

            if (dist < this.cutoffDistance) {
                Core.debugMsg("That distance is less than cutoff of " + this.cutoffDistance.toString());
                // They are close to the target.
                // Now check if the camera is looking at the target.
                let frustumPlanes = BABYLON.Frustum.GetPlanes(Core.scene.getTransformMatrix());
                if (triggerMesh.isInFrustum(frustumPlanes)) {
                    Core.debugMsg(this.triggerMesh.name + " is also visible to camera. So condition satisfied.");
                    return true;
                } else {
                    Core.debugMsg("But " + this.triggerMesh.name + " is not visible to camera.");
                    return false;
                }
            } else {
                Core.debugMsg("That distance is NOT less than cutoff of " + this.cutoffDistance.toString());
                // They are not, so return false.
                return false;
            }
        }.bind({
            triggerMesh: triggerMesh,
            cutoffDistance: cutoffDistance
        });

        return func;
    }
}

// Other ideas for conditionals:
// Game start.
// Game end.
// Keypress
// speech?

export default BuiltInTriggerConditionals;