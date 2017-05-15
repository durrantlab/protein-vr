import * as Countdowns from "../Countdowns";

import parent from "./ActionParent";
import * as CameraChar from "../../CameraChar";


declare var BABYLON;
declare var PVRGlobals;
var jQuery = PVRGlobals.jQuery;

interface DoInterface{
    milliseconds: number;
   // direction: any;  // vector object
    // startPoint: any; // vector object
    endPoint: any;   // vector object
    onStart?: any; // a function that runs before starting.
    onEnd?: any // a function that runs when done.
}

class MoveCamera extends parent {
    private ep: any = null;
    constructor(params: DoInterface){
        super(params);
    }
    /**
     * This function will move the camera from its current position to the destination. the camera will be oriented in 
     * the direction indicated by the vector provided to the function.
     * @param direction :any The direction the camera should be facing when moved
     * @param startPoint :any The current location of camera
     * @param endPoint :any The location vector that the camera is to be moved to
     */
    public do(destination?: BABYLON.Vector3){
        // console.log("Move Camera action initiated!");

        if (PVRGlobals.jumpRefractoryPeriod === true) {
            // If you're currently jumping, don't jump again.
            return;
        }
       
        if (destination) {
            // console.log("Destination: " + destination);
            this.ep = destination;
            // keep camera above ground
            this.ep.y += 0.5;    
            // console.log("Updated destination: " + this.ep);
            // console.log("For reference, sp = " + PVRGlobals.camera.position);
        } else{
            this.ep = this.parameters["endPoint"];
        }

        // Run the onStart callback.
        if (this.parameters.onStart !== undefined) {
            this.parameters.onStart();
        }

        let startVec = PVRGlobals.camera.position.clone();
        let diffVec = this.ep.subtract(startVec);

        Countdowns.addCountdown({
            name: "MoveCamera" + Math.random().toString(),
            countdownDurationMilliseconds: this.parameters["milliseconds"],
            countdownStartVal: 0.0,
            countdownEndVal: 1.0,
            afterCountdownAdvanced: function(val) {
                let newCameraPos = this.extraVars.startVec.add(
                    this.extraVars.diffVec.scale(val)
                );

                CameraChar.setPosition(newCameraPos);

                // console.log(this.extraVars.startVec, this.extraVars.diffVec, newCameraPos, val);

                // console.log(this.extraVars.startVec, this.extraVars.ep, newCameraPos, val, "MOO");

                // let sp = camera.position;
                // this.ep = this.parameters["endPoint"];
                
                // console.log("Beginning movement in countdown");
                // console.log("Val: " + val);
                // camera.position.x = sp.x + ((this.ep.x-sp.x) * val);
                // console.log("y coord before calc: " + camera.position.y);
                // console.log("sp.y: " + sp.y);
                // console.log("ep.y: " + this.ep.y);
                // console.log("y calculation:");
                // console.log("this.ep.y - sp.y = " + (this.ep.y-sp.y));
                // console.log("That * val = " + (this.ep.y-sp.y)*val);
                // camera.position.y = sp.y + ((this.ep.y-sp.y) * val);
                // camera.position.z = sp.z + ((this.ep.z-sp.z) * val);
                // console.log("Ending this iteration");
                // console.log("Y coordinate: " + camera.position.y);
                // camera.direction = this.parameters["direction"];
            }, //.bind(this),
            doneCallback: function() {
                // console.log("Position before callback function: " +  PVRGlobals.camera.position);
                CameraChar.setPosition(this.extraVars.startVec.add(this.extraVars.diffVec));
                // console.log("Position after callback: " +  PVRGlobals.camera.position);
                // this.camera.position = this.parameters["direction"];

                if (this.extraVars.onEnd !== undefined) {
                    this.extraVars.onEnd();
                }
            },
            extraVars: {
                onEnd: this.parameters.onEnd,
                diffVec: diffVec,
                startVec: startVec,
                // ep: this.ep  // just for debugging
            }
        });

    }
}

export default MoveCamera;