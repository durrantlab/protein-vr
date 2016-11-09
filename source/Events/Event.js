define(["require", "exports", "./Timers", "../Core/Core"], function (require, exports, Timers_1, Core_1) {
    "use strict";
    /**
     * A class that defines an event (conditional trigger + action)
     */
    var Event = (function () {
        /**
         * The constructor.
         * @param  {any}    triggerConditionObj The trigger conditional object.
         * @param  {any}    actionOnTriggerObj  The action object.
         */
        function Event(triggerConditionObj, actionOnTriggerObj) {
            // Set class variables (the function that define a trigger and say
            // what to do if found.)
            this.triggerConditionObj = triggerConditionObj;
            this.actionOnTriggerObj = actionOnTriggerObj;
            // Now you need to register a timer to check for the trigger.
            this.timerThatChecksCondition = Timers_1.default.addTimer({
                name: "trigger" + Math.floor(Math.random() * 100000).toString(),
                durationInMiliseconds: 500,
                // if trigger satisfied.
                repeated: true,
                tickCallback: function () {
                    if (this.triggerIfSatisfied()) {
                        this.timerThatChecksCondition.dispose();
                    }
                }.bind(this)
            });
        }
        /**
         * Determines whether or not the associated condition has been satisfied.
         * @return {boolean} true if satisfied, false otherwise.
         */
        Event.prototype.triggerIfSatisfied = function () {
            Core_1.default.debugMsg("Checking a trigger.");
            var conditionSatisfied = this.triggerConditionObj.check();
            if (conditionSatisfied) {
                this.actionOnTriggerObj.do();
                Core_1.default.debugMsg("Trigger firing.");
            }
            return conditionSatisfied;
        };
        return Event;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Event;
});
