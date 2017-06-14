import * as Countdowns from "../Countdowns";
import * as Animations from "../../Core/Animations";
import parent from "./ActionParent";
import * as UserVars from "../../Settings/UserVars";

declare var BABYLON;
declare var PVRGlobals;

interface DoInterface {
    meshName: string;
    milliseconds: number;
    startTargetName: string;  // Note this can be "Base" too.
    endTargetName: string;  // Note this can be "Base" too.
    looping: boolean;
    easeInOut?: boolean;
}

class MorphMesh extends parent {
    /**
    A class for morphing a given mesh.
    */

    constructor(params: DoInterface) {
        /**
        The constructor. super(params) passes params to the parent class'
            constructor.

        :param DoInterface params: The parameters for this class. Use an
                           interface to make sure the correct 
                           parameters are always used.
        */
        
        super(params);
    }

    public do(): void {
        /**
        Perform the action: Fade out.
        */

        // Note: For complex geometries, this will likely cause problems.
        // See http://www.html5gamedevs.com/topic/25430-transparency-issues/

        if (UserVars.getParam("animations") !== UserVars.animations["Moving"]) {
            return;
        }

        let params: DoInterface = this.parameters;

        Animations.setToBase(params.meshName);

        let countdownParams: any = {
            name: "MorphMesh" + Math.random().toString(),
            countdownDurationMilliseconds: params.milliseconds, //milliseconds,
            countdownStartVal: 0.0,
            countdownEndVal: 1.0,
            afterCountdownAdvanced: function(val) {
                if (this.extraVars.easeInOut === true) {
                    val = -0.5 * (Math.cos(Math.PI * val) - 1);
                }

                // console.log(this, "MOO");
                //let params = this.extraVars.countdownObj.parameters;
                let meshName = this.extraVars.meshName;
                let startTargetName = this.extraVars.startTargetName;
                let endTargetName = this.extraVars.endTargetName;
                let runningForward = this.extraVars.runningForward;

                // Make sure the animations exist
                if ((startTargetName !== "Base") && (
                        (PVRGlobals.allMorphTargets[meshName] === undefined) ||
                        (PVRGlobals.allMorphTargets[meshName][startTargetName] === undefined)
                    )) {
                    console.log("No animation found: " + meshName + " : " + startTargetName);
                    return;
                }

                if ((endTargetName !== "Base") && (
                        (PVRGlobals.allMorphTargets[meshName] === undefined) ||
                        (PVRGlobals.allMorphTargets[meshName][endTargetName] === undefined)
                    )) {
                    console.log("No animation found: " + meshName + " : " + endTargetName);
                    return;
                }

                let endInfluence = 0.0;
                let startInfluence = 0.0;

                if (startTargetName === "Base") {
                    switch(runningForward) {
                        case true:
                            endInfluence = val;
                            break;
                        case false:
                            endInfluence = 1.0 - val;
                            break;
                    }
                } else if (endTargetName === "Base") {
                    switch(runningForward) {
                        case true:
                            startInfluence = 1.0 - val;
                            break;
                        case false:
                            startInfluence = val;
                            break;
                    }
                } else {
                    switch(runningForward) {
                        case true:
                            startInfluence = 1.0 - val;
                            endInfluence = val;
                            break;
                        case false:
                            startInfluence = val;
                            endInfluence = 1.0 - val;
                            break;
                    }                        
                }

                if (startInfluence > 1.0) {
                    startInfluence = 1.0;
                } else if (startInfluence < 0.0) {
                    startInfluence = 0.0;
                }

                if (endInfluence > 1.0) {
                    endInfluence = 1.0;
                } else if (endInfluence < 0.0) {
                    endInfluence = 0.0;
                }

                if (endTargetName !== "Base") {
                    PVRGlobals.allMorphTargets[meshName][endTargetName].influence = endInfluence;
                }

                if (startTargetName !== "Base") {
                    PVRGlobals.allMorphTargets[meshName][startTargetName].influence = startInfluence;
                }
            },
            extraVars: {
                runningForward: true,
                meshName: params.meshName,
                startTargetName: params.startTargetName,
                endTargetName: params.endTargetName,
                easeInOut: params.easeInOut
            }
        }

        if (params.looping === true) {
            countdownParams.autoRestartAfterCountdownDone = true
            countdownParams.doneCallback = function() {
                this.extraVars.runningForward = !this.extraVars.runningForward;
            }
            // params.countdownParams.doneCallback = function() {
            //     let countdownParams = this.params.countdownParams;

            //     countdownParams.name = "MorphMesh" + Math.random().toString();
            //     let tmp = countdownParams.countdownStartVal;
            //     countdownParams.countdownStartVal = countdownParams.countdownEndVal;
            //     countdownParams.countdownEndVal = tmp;
            //     console.log("looping");
            // }.bind({
            //     params: params
            // })
        }

        // ,
        //     doneCallback: function() {
        //         //this.material.alpha = 0;
        //         // this.customShader.alpha = 0;
        //         //this.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
        //     }.bind(params)

        Countdowns.addCountdown(countdownParams);
    }
}

export default MorphMesh;
