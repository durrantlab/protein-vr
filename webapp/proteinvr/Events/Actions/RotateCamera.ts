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
    endRotation: any;   // vector object
    onStart?: any; // a function that runs before starting.
    onEnd?: any // a function that runs when done.
}

class MoveCamera extends parent {
    private er: any = null;
    constructor(params: DoInterface){
        super(params);
    }
    /**
     * This function will move the camera from its current rotation to the destination. the camera will be oriented in 
     * the direction indicated by the vector provided to the function.
     * @param direction :any The direction the camera should be facing when moved
     * @param startPoint :any The current location of camera
     * @param endPoint :any The location vector that the camera is to be moved to
     */
    public do(destination?: BABYLON.Vector3){
        // console.log("Move Camera action initiated!");

        // if (PVRGlobals.jumpRefractoryPeriod === true) {
        //     // If you're currently jumping, don't jump again.
        //     return;
        // }
       
        // if (destination) {
        //     // console.log("Destination: " + destination);
        //     this.ep = destination;
        //     // keep camera above ground
        //     this.ep.y += 0.5;    
        //     // console.log("Updated destination: " + this.ep);
        //     // console.log("For reference, sp = " + PVRGlobals.camera.rotation);
        // } else{
        this.er = this.parameters["endRotation"];
        // }

        // Run the onStart callback.
        if (this.parameters.onStart !== undefined) {
            this.parameters.onStart();
        }

        let startVec = PVRGlobals.camera.rotation.clone();
        let diffVec = this.er.subtract(startVec);

        Countdowns.addCountdown({
            name: "MoveCamera" + Math.random().toString(),
            countdownDurationMilliseconds: this.parameters["milliseconds"],
            countdownStartVal: 0.0,
            countdownEndVal: 1.0,
            afterCountdownAdvanced: function(val) {
                let newCameraRot = this.extraVars.startVec.add(
                    this.extraVars.diffVec.scale(val)
                );

                CameraChar.setRotation(newCameraRot);
            },
            doneCallback: function() {
                CameraChar.setRotation(this.extraVars.startVec.add(this.extraVars.diffVec));
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