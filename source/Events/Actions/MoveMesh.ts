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

    public canvasJQuery = undefined;

    constructor(params) { // : DoInterface) {
        super(params);
    }

    public do() {

        //let params = this.parameters;
  
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
                
                let ep = this.parameters("endPosition");
                let sp = this.parameters("startPosition");
                let mesh = this.parameters("mesh");
                mesh.position.x = sp.x + ((ep.x - sp.x) * val);
                mesh.position.y = sp.y + ((ep.y - sp.y) * val);
                mesh.position.z = sp.z + ((ep.z = sp.Z) * val);
            
        }.bind(this),
            doneCallback: function() {
                // Maybe set the mesh to exactly position endpoint
                this.parameters["mesh"].position = this.parameters["endPosition"];
            }.bind(this)
        });
    }
}

export default MoveMesh;