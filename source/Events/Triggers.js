define(["require", "exports", "./Timers", "../Core/Core", "../CameraChar"], function (require, exports, Timers_1, Core_1, CameraChar_1) {
    "use strict";
    var Triggers;
    (function (Triggers) {
        Triggers.triggers = [];
        // Combine timer and trigger interfaces
        //export interface AddTriggerInterface extends TriggerInterface, Timers.TimerInterface {}
        function addTrigger(conditionToSatisfyFunc, actionOnTriggerFunc) {
            // Create a new trigger object. It will be checked from within a
            // timer object.
            var trig = new Trigger(conditionToSatisfyFunc, actionOnTriggerFunc);
            // Create a timer that checks if the trigger should be fired every
            // so often, and fires it if necessary. Optional parameters on
            // triggerTimerParams need to be overwritten here to work with
            // Trigger.
            //params.extraVars = {
            // The trigger object must be associated with the timer, and visa versa.
            //    triggerObj: trig,
            //}
            /* params.doneCallback = function(extraVars) {
                // After the timer countdown, check the trigger.
                if (!(extraVars.triggerObj.check())) {
                    // So the condition isn't satisfied yet. Regardless of the
                    // user-specified value of autoRestart, you need to check
                    // again in a bit to see if the condition is satisfied.
                    extraVars.timerObj.timeRemaining = extraVars.timerObj.timeRemaining + extraVars.timerObj.parameters.intervalInMiliseconds;
                }
            }*/
            // Enable the timer.
            //Timers.addTimer(params)
        }
        Triggers.addTrigger = addTrigger;
        //export interface TriggerInterface {
        // Both functions don't accept parameters. Put any variables you
        // need to access as the third constructor parameter, which can be
        // accessed through this.vars from within these functions. This
        // alone refers to the Trigger object (which has this.check())
        //        conditionToSatisfy: any 
        // actionIfConditionSatisfied: any,
        //}
        var Trigger = (function () {
            function Trigger(conditionToSatisfyFunc, actionOnTriggerFunc) {
                this.actionOnTriggerFunc = function () { console.log("TRIGGERED!"); }; // the action to run when triggered. Overwrite this.
                // Set class variables (the function that define a trigger and say what to do if found.)
                this.conditionToSatisfyFunc = conditionToSatisfyFunc;
                if (actionOnTriggerFunc !== undefined) {
                    this.actionOnTriggerFunc = actionOnTriggerFunc;
                }
                // Now you need to register a timer to check for the trigger.
                this.checkingTimer = Timers_1.default.addTimer({
                    name: "trigger" + Math.floor(Math.random() * 100000).toString(),
                    DurationInMiliseconds: 500,
                    repeated: true,
                    tickCallback: function () {
                        if (this.triggerIfSatisfied()) {
                            this.checkingTimer.dispose();
                        }
                    }.bind(this)
                });
                // Set the extra vars
                // this.vars = extraVars;
            }
            Trigger.prototype.triggerIfSatisfied = function () {
                Core_1.default.debugMsg("Checking a trigger.");
                var conditionSatisfied = this.conditionToSatisfyFunc();
                if (conditionSatisfied) {
                    this.actionOnTriggerFunc();
                    Core_1.default.debugMsg("Trigger firing.");
                }
                return conditionSatisfied;
            };
            return Trigger;
        }());
        var BuiltInConditionals;
        (function (BuiltInConditionals) {
            function distance(triggerMesh, cutoffDistance) {
                // The distance trigger function.
                var func = function () {
                    // First check if the player is within a certain distance of the target.
                    var dist = BABYLON.Vector3.Distance(this.triggerMesh.position, CameraChar_1.default.camera.position);
                    Core_1.default.debugMsg("Distance from camera to " + this.triggerMesh.name + ": " + dist.toString());
                    if (dist < this.cutoffDistance) {
                        Core_1.default.debugMsg("That distance is less than cutoff of " + this.cutoffDistance.toString());
                        // They are close to the target.
                        // Now check if the camera is looking at the target.
                        var frustumPlanes = BABYLON.Frustum.GetPlanes(Core_1.default.scene.getTransformMatrix());
                        if (triggerMesh.isInFrustum(frustumPlanes)) {
                            Core_1.default.debugMsg(this.triggerMesh.name + " is also visible to camera. So condition satisfied.");
                            return true;
                        }
                        else {
                            Core_1.default.debugMsg("But " + this.triggerMesh.name + " is not visible to camera.");
                            return false;
                        }
                    }
                    else {
                        Core_1.default.debugMsg("That distance is NOT less than cutoff of " + this.cutoffDistance.toString());
                        // They are not, so return false.
                        return false;
                    }
                }.bind({
                    triggerMesh: triggerMesh,
                    cutoffDistance: cutoffDistance
                });
                return func;
            }
            BuiltInConditionals.distance = distance;
        })(BuiltInConditionals = Triggers.BuiltInConditionals || (Triggers.BuiltInConditionals = {}));
    })(Triggers || (Triggers = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Triggers;
});
