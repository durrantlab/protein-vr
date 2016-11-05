import Timers from "../Timers";
import parent from "./ActionParent";

declare var BABYLON;
declare var jQuery;

interface DoInterface {
    mesh: any;
    milliseconds: number;
    startPosition: any;  // BABYLON.Vector3 objects
    endPosition: any;  // BABYLON.Vector3 objects
}

class MoveMesh extends parent {

    /**
     * A jQuery object, where the canvas where the scene is being rendered.
     */
    public canvasJQuery = undefined;

    constructor(params) { // : DoInterface) {
        super(params);
    }

    public do() {
        Timers.addTimer({
            name: "MoveMesh" + Math.random().toString(),
            durationInMiliseconds: this.parameters["milliseconds"],
            interpValStart: 0.0,
            interpValEnd: 1.0,
            tickCallback: function(val) {
                // Position object between endpoint and start point, based on
                // how far val is between 0.0 and 1.0.
                // https://doc.babylonjs.com/classes/2.4/Vector3
                // https://doc.babylonjs.com/tutorials/Position,_Rotation,_Scaling

            }.bind(this),
            doneCallback: function() {
                // Maybe set the mesh to exactly position endpoint
            }.bind(this)
        });
    }
}

export default MoveMesh;