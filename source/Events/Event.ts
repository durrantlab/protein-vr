import Timers from "./Timers";
import Core from "../Core/Core";
import CameraChar from "../CameraChar";

declare var BABYLON;
declare var jQuery;

class Event {
    /**
    A class that defines an event (conditional trigger + action)
    */

    // public parameters: TriggerInterface;

    /**
    The conditional trigger associated with this Event. 
    */
    public triggerConditionObj: any; // a function that returns true or false.
    
    /**
    The action associated with this event.
    */
    public actionOnTriggerObj: any; // the action to run when triggered.
                                    // Overwrite this.
    
    /**
    The timer that checks whether or not the conditional is satisfied.
    */
    public timerThatChecksCondition: Timers.Timer;

    public constructor(triggerConditionObj: any, actionOnTriggerObj?: any, async?: boolean, $?: any) {
        /**
        The constructor.

        :param any triggerConditionObj: The trigger conditional object.
        :param any actionOnTriggerObj:  The action object.
        */

        // Set class variables (the function that define a trigger and say
        // what to do if found.)
        this.triggerConditionObj = triggerConditionObj;
        if(actionOnTriggerObj) {
            this.actionOnTriggerObj = actionOnTriggerObj;
        
            if(async){
                let eventType :any = this.triggerConditionObj.asyncSetup();
                this.execAsync(eventType);
            }
            
            else{
                // Now you need to register a timer to check for the trigger.
                this.timerThatChecksCondition = Timers.addTimer({
                    name: "trigger" + Math.floor(Math.random() * 100000).toString(),
                    durationInMiliseconds: 500,  // Check every half a second to see
                                                // if trigger satisfied.
                    repeated: true,  // Keep checking until satisfied.
                    tickCallback: function() {
                        if (this.triggerIfSatisfied()) {
                            this.timerThatChecksCondition.dispose();
                        }
                    }.bind(this)
                });
            }
        }
    }

    public triggerIfSatisfied(): boolean {
        /**
        Determines whether or not the associated condition has been satisfied.

        :returns: true if satisfied, false otherwise.
        
        :rtype: :any:`bool`
        */

        Core.debugMsg("Checking a trigger.");
        let conditionSatisfied: boolean = this.triggerConditionObj.check();
        if (conditionSatisfied) {
            this.actionOnTriggerObj.do();
            Core.debugMsg("Trigger firing.");
        }

        return conditionSatisfied;
    }

    //execute async functions here
    public execAsync(eventMetaData: any) :void{
        let action = this.actionOnTriggerObj;
        let target = eventMetaData["target"];
        let eventTrigger = eventMetaData["event"];
        jQuery(target).ready( function(event){
            console.log("action triggered");         
            setTimeout(function(){
                console.log("delay complete");
                action.do();
            }, 3000);          
        });
    }
}

export default Event;
