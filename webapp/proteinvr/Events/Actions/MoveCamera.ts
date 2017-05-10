import * as Countdowns from "../Countdowns";

import parent from "./ActionParent";
import * as CameraChar from "../../CameraChar";


declare var BABYLON;
declare var PVRGlobals;
var jQuery = PVRGlobals.jQuery;

interface DoInterface{
    camera: any; //camera object
    milliseconds: number;
   // direction: any;  // vector object
    // startPoint: any; // vector object
    endPoint: any;   // vector object
}

class MoveCamera extends parent {
    private ep: any = null;
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
    public do(destination?: BABYLON.Vector3){
        console.log("Move Camera action initiated!");
       
        if(destination){
            console.log("Destination: " + destination);
            this.ep = destination;
            // keep camera above ground
            this.ep.y += 0.5;    
            console.log("Updated destination: " + this.ep);
            console.log("For reference, sp = " + this.parameters["camera"].position);
        } else{
            this.ep = this.parameters["endPoint"];
        }
        Countdowns.addCountdown({
            name: "MoveCamera" + Math.random().toString(),
            countdownDurationMilliseconds: this.parameters["milliseconds"],
            countdownStartVal: 0.0,
            countdownEndVal: 1.0,
            afterCountdownAdvanced: function(val){
                let camera = this.parameters["camera"];
                let sp = camera.position;
                // this.ep = this.parameters["endPoint"];
                
                console.log("Beginning movement in countdown");
                console.log("Val: " + val);
                camera.position.x = sp.x + ((this.ep.x-sp.x) * val);
                console.log("y coord before calc: " + camera.position.y);
                console.log("sp.y: " + sp.y);
                console.log("ep.y: " + this.ep.y);
                console.log("y calculation:");
                console.log("this.ep.y - sp.y = " + (this.ep.y-sp.y));
                console.log("That * val = " + (this.ep.y-sp.y)*val);
                camera.position.y = sp.y + ((this.ep.y-sp.y) * val);
                camera.position.z = sp.z + ((this.ep.z-sp.z) * val);
                console.log("Ending this iteration");
                console.log("Y coordinate: " + camera.position.y);
                // camera.direction = this.parameters["direction"];
            }.bind(this),
            doneCallback: function() {
                console.log("Position before callback function: " + this.parameters["camera"].position);
                this.parameters["camera"].position = this.ep;
                console.log("Position after callback: " + this.parameters["camera"].position);
                // this.camera.position = this.parameters["direction"];
            }.bind(this)
        });

    }

    public setEndPoint(ep: any) {
        this.parameters['endPoint'] = ep;
    }
}

export default MoveCamera;