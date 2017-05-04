import * as Countdowns from "./Countdowns";
import * as Core from "../Core/Core";
import * as CameraChar from "../CameraChar";

declare var BABYLON;
declare var PVRGlobals;
var jQuery = PVRGlobals.jQuery;

class Event {
    /**
    A class that defines an event (conditional trigger + action)
    */

    /**
    The conditional trigger associated with this Event. 
    */
    public triggerToCheck: any; // a function that returns true or false.
    
    /**
    The action associated with this event.
    */
    public actionIfTriggered: any; // the action to run when triggered.
                                    // Overwrite this.
    
    /**
    The countdown that checks whether or not the conditional is satisfied.
    */
    public countdownThatChecksCondition: Countdowns.Countdown;

    public constructor(triggerToCheck: any, actionIfTriggered: any, async?: boolean, $?: any) {
        /**
        The constructor.

        :param any triggerToCheck: The trigger conditional object.

        :param any actionIfTriggered:  The action object.
        :param boolean async: Whether or not to 
        */

        // Set class variables (the function that define a trigger and say
        // what to do if found.)
        this.triggerToCheck = triggerToCheck;
        this.actionIfTriggered = actionIfTriggered;
    
        // There are two kinds of trigger...action relationships.
        if (async) {
            let eventType: any = this.triggerToCheck.asyncSetup();
            this.execAsync(eventType);
        } else {
            // Now you need to register a countdown to check for the trigger.
            this.countdownThatChecksCondition = Countdowns.addCountdown({
                name: "trigger" + Math.floor(Math.random() * 100000).toString(),
                countdownDurationMilliseconds: 500,  // Check every half a second to see
                                            // if trigger satisfied.
                autoRestartAfterCountdownDone: true,  // Keep checking until satisfied.
                afterCountdownAdvanced: function() {
                    // Check if trigger satisfied.
                    let conditionSatisfied: boolean = this.triggerToCheck.checkIfTriggered();
                    if (conditionSatisfied) {
                        // Do the associated action
                        this.actionIfTriggered.do();
                        
                        // It is, you just did the associated action, so
                        // dispose of the countdown so it doesn't keep
                        // restarting.
                        this.countdownThatChecksCondition.dispose();
                        
                        // Core.debugMsg("Trigger firing.");
                    }
                }.bind(this)
            });
        }
    }

    public execAsync(eventMetaData: any) :void{
    /**
     * Executes async functions for trigger conditionals.
     * 
     * :param any eventMetaData: An object containing metadata about the event listener to be created. 
     * */
        let action = this.actionIfTriggered;
        let target = eventMetaData["target"];
        let eventTrigger = eventMetaData["event"];
        jQuery(target).ready( function(event){
            // console.log("action triggered");         
            setTimeout(function(){
                // console.log("delay complete");
                action.do();
            }, 3000);          
        });
    }
}

export default Event;
