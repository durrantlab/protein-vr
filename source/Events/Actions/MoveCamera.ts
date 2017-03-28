import Timers from "../Timers";

import parent from "./ActionParent";
import CameraChar from "../../CameraChar";


declare var BABYLON;
declare var jQuery;

interface DoInterface{
    camera: any; //camera object
    milliseconds: number;
   // direction: any;  // vector object
    startPoint: any; // vector object
    endPoint: any;   // vector object
}

class MoveCamera extends parent {

    constructor(params: DoInterface){
        super(params);
    }
    /**
     * This function will move the camera from its current position to the destination. the camera will be oriented in 
     * the direction indicated by the vector provided to the function.
     * @param camera :any The camera to be moved
     * @param direction :any The direction the camera should be facing when moved
     * @param startPoint :any The current location of camera
     * @param endPoint :any The location vector that the camera is to be moved to
     */
    public do(){
        console.log("Move Camera action initiated!");
        Timers.addTimer({
            name: "MoveCamera" + Math.random().toString(),
            durationInMiliseconds: this.parameters["milliseconds"],
            interpValStart: 0.0,
            interpValEnd: 1.0,
            tickCallback: function(val){
                let camera = this.parameters["camera"];
                let sp = CameraChar.camera.position;
                let ep = this.parameters['endPoint'];

                camera.position.x = sp.x + ((ep.x-sp.x) * val);
                camera.position.y = sp.y + ((ep.y-sp.y) * val);
                camera.position.z = sp.z + ((ep.z-sp.z) * val);
                camera.direction = this.parameters["direction"];
            }.bind(this),
            doneCallback: function() {
                this.parameters["camera"].position = this.parameters["endPoint"];
                // this.camera.position = this.parameters["direction"];
            }.bind(this)
        });

    }
}

export default MoveCamera;