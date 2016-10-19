define(["require", "exports", "./Timers", "./Core/Core", "./CameraChar"], function (require, exports, Timers_1, Core_1, CameraChar_1) {
    "use strict";
    var Triggers;
    (function (Triggers) {
        Triggers.triggers = [];
        function addTrigger(params) {
            // Create a new trigger object. It will be checked from within a
            // timer object.
            var trig = new Trigger(params);
            // Create a timer that checks if the trigger should be fired every
            // so often, and fires it if necessary. Optional parameters on
            // triggerTimerParams need to be overwritten here to work with
            // Trigger.
            params.extraVars = {
                // The trigger object must be associated with the timer, and visa versa.
                triggerObj: trig,
            };
            params.doneCallback = function (extraVars) {
                // After the timer countdown, check the trigger.
                if (!(extraVars.triggerObj.check())) {
                    // So the condition isn't satisfied yet. Regardless of the
                    // user-specified value of autoRestart, you need to check
                    // again in a bit to see if the condition is satisfied.
                    extraVars.timerObj.timeRemaining = extraVars.timerObj.timeRemaining + extraVars.timerObj.parameters.intervalInMiliseconds;
                }
            };
            // Enable the timer.
            Timers_1.default.addTimer(params);
        }
        Triggers.addTrigger = addTrigger;
        var Trigger = (function () {
            //public vars = {};
            function Trigger(params) {
                // Set class variables
                this.parameters = params;
                // Set the extra vars
                // this.vars = extraVars;
            }
            Trigger.prototype.check = function () {
                Core_1.default.debugMsg("Checking a trigger.");
                var conditionSatisfied = this.parameters.conditionToSatisfy();
                if (conditionSatisfied) {
                    this.parameters.actionIfConditionSatisfied();
                    Core_1.default.debugMsg("Trigger firing.");
                }
                return conditionSatisfied;
            };
            return Trigger;
        }());
        Triggers.Trigger = Trigger;
        var PackagedConditionals;
        (function (PackagedConditionals) {
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
            PackagedConditionals.distance = distance;
        })(PackagedConditionals = Triggers.PackagedConditionals || (Triggers.PackagedConditionals = {}));
        var PackagedAction;
        (function (PackagedAction) {
            function fadeOutMesh(mesh, milliseconds) {
                // Note: For complex geometries, this will likely cause problems.
                // See http://www.html5gamedevs.com/topic/25430-transparency-issues/
                if (milliseconds === void 0) { milliseconds = 2000; }
                mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;
                Timers_1.default.addTimer({
                    name: "FadeOut" + Math.random().toString(),
                    intervalInMiliseconds: milliseconds,
                    interpValStart: 1.0,
                    interpValEnd: 0.0,
                    autoRestart: false,
                    tickCallback: function (val) {
                        this.material.alpha = val;
                    }.bind(mesh),
                    doneCallback: function () {
                        this.material.alpha = 0;
                        mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                    }.bind(mesh)
                });
            }
            PackagedAction.fadeOutMesh = fadeOutMesh;
            function fadeInMesh(mesh, milliseconds) {
                // Note: For complex geometries, this will likely cause problems.
                // See http://www.html5gamedevs.com/topic/25430-transparency-issues/
                if (milliseconds === void 0) { milliseconds = 2000; }
                mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;
                Timers_1.default.addTimer({
                    name: "FadeIn" + Math.random().toString(),
                    intervalInMiliseconds: milliseconds,
                    interpValStart: 0.0,
                    interpValEnd: 1.0,
                    autoRestart: false,
                    tickCallback: function (val) {
                        this.material.alpha = val;
                    }.bind(mesh),
                    doneCallback: function () {
                        this.material.alpha = 1.0;
                        mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                    }.bind(mesh)
                });
            }
            PackagedAction.fadeInMesh = fadeInMesh;
        })(PackagedAction = Triggers.PackagedAction || (Triggers.PackagedAction = {}));
    })(Triggers || (Triggers = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Triggers;
});
