import parent from "./TriggerConditionalParent";

declare var BABYLON;

// Useful variables:
// Location of camera: CameraChar.camera.position

interface CheckInterface {
    triggerMesh: any;
    cutOffDistance: number;
}

/**
 * A class to see if the camera is within a certain distance of a mesh.
 */
class DistanceToMesh extends parent {

    /**
     * The class constructor. super() calls the parent class' constructor.
     * @param  {any}    params  Any required parameters. To make sure the
     *                          correct ones are supplied, use an interface.
     */
    constructor(params: CheckInterface) {
        super(params);
    }

    /**
     * Check if the conditions of this trigger are satisfied.
     * @param  {any}     params  General function parameters.
     * @return {boolean}         true if the conditions are satisfied, false
     *                           otherwise.
     */
    public check(): boolean {

        // First check if the player is within a certain distance of the
        // target.
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
