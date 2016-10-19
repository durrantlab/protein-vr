// An event is a trigger plus an action.

import Timers from "./Timers";
import Core from "../Core/Core";
import CameraChar from "../CameraChar";

declare var BABYLON;

class Event {
    // public parameters: TriggerInterface;
    //public vars = {};
    public triggerConditionFunc: any; // a function that returns true or false.
    public actionOnTriggerFunc = function() { console.log("TRIGGERED!"); } // the action to run when triggered. Overwrite this.
    public checkingTimer: Timers.Timer;

    public constructor(triggerConditionFunc: any, actionOnTriggerFunc: any) {
        // Set class variables (the function that define a trigger and say what to do if found.)
        this.triggerConditionFunc = triggerConditionFunc;
        if (actionOnTriggerFunc !== undefined) {
            this.actionOnTriggerFunc = actionOnTriggerFunc;
        }

        // Now you need to register a timer to check for the trigger.
        this.checkingTimer = Timers.addTimer({
            name: "trigger" + Math.floor(Math.random() * 100000).toString(),
            durationInMiliseconds: 500,  // Check every half a second to see if trigger satisfied.
            repeated: true,  // Keep checking until satisfied.
            tickCallback: function() {
                if (this.triggerIfSatisfied()) {
                    this.checkingTimer.dispose();
                }
            }.bind(this)
        });
    }

    public triggerIfSatisfied() {
        Core.debugMsg("Checking a trigger.");
        let conditionSatisfied: boolean = this.triggerConditionFunc(); 
        if (conditionSatisfied) {
            this.actionOnTriggerFunc();
            Core.debugMsg("Trigger firing.");
        }

        return conditionSatisfied;
    }
}

export default Event;