define(["require", "exports", "./Countdowns"], function (require, exports, Countdowns) {
    "use strict";
    var jQuery = PVRGlobals.jQuery;
    var Event = (function () {
        function Event(triggerToCheck, actionIfTriggered, async) {
            /**
            The constructor.
    
            :param any triggerToCheck: The trigger conditional object.
    
            :param any actionIfTriggered:  The action object.
            :param boolean async: Whether or not to
            */
            // Set class variables (the function that define a trigger and say
            // what to do if found.)
            this.triggerToCheck = triggerToCheck;
            if (!async) {
                this.actionIfTriggered = actionIfTriggered;
                // Now you need to register a countdown to check for the trigger.
                this.countdownThatChecksCondition = Countdowns.addCountdown({
                    name: "trigger" + Math.floor(Math.random() * 100000).toString(),
                    countdownDurationMilliseconds: 500,
                    // if trigger satisfied.
                    autoRestartAfterCountdownDone: true,
                    afterCountdownAdvanced: function () {
                        // Check if trigger satisfied.
                        var conditionSatisfied = this.triggerToCheck.checkIfTriggered();
                        if (conditionSatisfied) {
                            // Do the associated action
                            this.actionIfTriggered.do();
                            // It is, you just did the associated action, so
                            // dispose of the countdown so it doesn't keep
                            // restarting.
                            this.countdownThatChecksCondition.dispose();
                        }
                    }.bind(this)
                });
            }
        }
        return Event;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Event;
});
