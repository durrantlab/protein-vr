import parent from "./TriggerConditionalParent"; 

declare var BABYLON;

// Useful variables:
// Location of camera: CameraChar.camera.position

interface CheckInterface {
    triggerMesh: any;
    cutOffDistance: number;
}

class DistanceToMesh extends parent {

    constructor(params: CheckInterface) {
        super(params);
    }
    
    public check(): boolean {

        // First check if the player is within a certain distance of the target.
        let dist: number = this.distanceToCamera(this.parameters.triggerMesh.position);

        if (dist < this.parameters.cutOffDistance) {
            // They are close to the target.
            return this.meshVisibleToCamera(this.parameters.triggerMesh);

        } else {
            // It is not close to the camera, so return false.
            return false;
        }
    }
}

// Other ideas for conditionals:
// Game start.
// Game end.
// Keypress
// speech?

export default DistanceToMesh;