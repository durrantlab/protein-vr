/// <reference path="Timers.ts" />

namespace World {
    export namespace Triggers {
        export var triggers = [];

        // Combine timer and trigger interfaces
        export interface AddTriggerInterface extends World.Triggers.TriggerInterface, World.Timers.TimerInterface {}

        export function addTrigger(params: World.Triggers.AddTriggerInterface) {
            // Create a new trigger object. It will be checked from within a
            // timer object.
            let trig = new World.Triggers.Trigger(params);

            // Create a timer that checks if the trigger should be fired every
            // so often, and fires it if necessary. Optional parameters on
            // triggerTimerParams need to be overwritten here to work with
            // Trigger.
            params.extraVars = {
                // The trigger object must be associated with the timer, and visa versa.
                triggerObj: trig,
            }

            params.doneCallback = function(extraVars) {
                // After the timer countdown, check the trigger.
                if (!(extraVars.triggerObj.check())) {
                    // So the condition isn't satisfied yet. Regardless of the
                    // user-specified value of autoRestart, you need to check
                    // again in a bit to see if the condition is satisfied.
                    extraVars.timerObj.timeRemaining = extraVars.timerObj.timeRemaining + extraVars.timerObj.parameters.intervalInMiliseconds;
                }
            }

            // Enable the timer.
            World.Timers.addTimer(params)
        }

        export interface TriggerInterface {
            // Both functions don't accept parameters. Put any variables you
            // need to access as the third constructor parameter, which can be
            // accessed through this.vars from within these functions. This
            // alone refers to the Trigger object (which has this.check())
            conditionToSatisfy: any 
            actionIfConditionSatisfied: any,
        }

        export class Trigger {
            public parameters: World.Triggers.TriggerInterface;
            //public vars = {};

            public constructor(params: World.Triggers.TriggerInterface) {
                // Set class variables
                this.parameters = params;

                // Set the extra vars
                // this.vars = extraVars;
            }

            public check() {
                World.debugMsg("Checking a trigger.");
                let conditionSatisfied: boolean = this.parameters.conditionToSatisfy(); 
                if (conditionSatisfied) {
                    this.parameters.actionIfConditionSatisfied();
                    World.debugMsg("Trigger firing.");
                }

                return conditionSatisfied;
            }
        }

        export namespace PackagedConditionals {
            export function distance(triggerMesh, cutoffDistance: number) {

                // The distance trigger function.
                let func = function() {

                    // First check if the player is within a certain distance of the target.
                    let dist: number = BABYLON.Vector3.Distance(this.triggerMesh.position, World.CameraChar.camera.position);
                    World.debugMsg("Distance from camera to " + this.triggerMesh.name + ": " + dist.toString());

                    if (dist < this.cutoffDistance) {
                        World.debugMsg("That distance is less than cutoff of " + this.cutoffDistance.toString());
                        // They are close to the target.
                        // Now check if the camera is looking at the target.
                        let frustumPlanes = BABYLON.Frustum.GetPlanes(World.scene.getTransformMatrix());
                        if (triggerMesh.isInFrustum(frustumPlanes)) {
                            World.debugMsg(this.triggerMesh.name + " is also visible to camera. So condition satisfied.");
                            return true;
                        } else {
                            World.debugMsg("But " + this.triggerMesh.name + " is not visible to camera.");
                            return false;
                        }
                    } else {
                        World.debugMsg("That distance is NOT less than cutoff of " + this.cutoffDistance.toString());
                        // They are not, so return false.
                        return false;
                    }
                }.bind({
                    triggerMesh: triggerMesh,
                    cutoffDistance: cutoffDistance
                });

                return func;
            }
        }

        export namespace PackagedAction {
            export function fadeOutMesh(mesh, milliseconds: number = 2000) {
                // Note: For complex geometries, this will likely cause problems.
                // See http://www.html5gamedevs.com/topic/25430-transparency-issues/

                mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;

                World.Timers.addTimer({
                    name: "FadeOut" + Math.random().toString(),
                    intervalInMiliseconds: milliseconds, //milliseconds,
                    interpValStart: 1.0,
                    interpValEnd: 0.0,
                    autoRestart: false,
                    tickCallback: function(val) {
                        this.material.alpha = val;
                    }.bind(mesh),
                    doneCallback: function() {
                        this.material.alpha = 0;
                        mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                    }.bind(mesh)
                });
            }

            export function fadeInMesh(mesh, milliseconds: number = 2000) {
                // Note: For complex geometries, this will likely cause problems.
                // See http://www.html5gamedevs.com/topic/25430-transparency-issues/

                mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;
                
                World.Timers.addTimer({
                    name: "FadeIn" + Math.random().toString(),
                    intervalInMiliseconds: milliseconds, //milliseconds,
                    interpValStart: 0.0,
                    interpValEnd: 1.0,
                    autoRestart: false,
                    tickCallback: function(val) {
                        this.material.alpha = val;
                    }.bind(mesh),
                    doneCallback: function() {
                        this.material.alpha = 1.0;
                        mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                    }.bind(mesh)
                });
            }
        }
    }
}