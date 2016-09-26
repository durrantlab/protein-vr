/// <reference path="Timers.ts" />

namespace World {
    export namespace Triggers {
        export var triggers = [];

        export function addTrigger(action, conditionToSatisfy, fireOnce, intervalInMiliseconds: number = 2000) {
            let trig = new World.Triggers.Trigger(action, conditionToSatisfy, fireOnce, intervalInMiliseconds);
            World.Triggers.triggers.push(trig);
        }

        export function checkAllTriggers() {
            for (let i = 0; i < World.Triggers.triggers.length; i++) {
                let trig = World.Triggers.triggers[i];
                trig.tick();
            }
        }

        export class Trigger {
            public action = function() {};
            public conditionToSatisfy = function() {};
            public intervalInMiliseconds: number = 0;
            public fireOnce: boolean = true;
            public countDown: number = 0;
            private lastTime = 0;

            public constructor(action, conditionToSatisfy, fireOnce, intervalInMiliseconds: number = 2000) {
                // Set class variables
                this.action = action;
                this.conditionToSatisfy = conditionToSatisfy;  // This function doesn't accept parameters. Just bind the needed variables.
                this.fireOnce = fireOnce;
                this.intervalInMiliseconds = intervalInMiliseconds;

                // Set countdown.
                this.countDown = intervalInMiliseconds;
                this.lastTime = new Date().getTime();
            }

            private tick() {
                if (this.countDown < 0) {
                    this.countDown = this.intervalInMiliseconds;
                    if (this.conditionToSatisfy()) {
                        this.action();
                        if (this.fireOnce == true) {
                            this.action = function() {};
                        }
                    }
                } else {
                    let curTime = new Date().getTime();
                    let deltaTime = curTime - this.lastTime;
                    this.countDown = this.countDown - deltaTime;
                    this.lastTime = curTime;
                }
            }
        }

        export namespace PackagedConditionals {
            export function distance(triggerMesh, cutoffDistance: number) {

                // The distance trigger function.
                let func = function() {

                    // First check if the player is within a certain distance of the target.
                    let dist: number = BABYLON.Vector3.Distance(this.triggerMesh.position, World.CameraChar.camera.position);
                    if (dist < this.cutoffDistance) {
                        // They are close to the target.
                        // Now check if the camera is looking at the target.
                        let frustumPlanes = BABYLON.Frustum.GetPlanes(World.scene.getTransformMatrix());
                        if (triggerMesh.isInFrustum(frustumPlanes)) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
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
                World.Timers.addTimer({
                    intervalInMiliseconds: milliseconds, //milliseconds,
                    interpValStart: 1.0,
                    interpValEnd: 0.0,
                    autoRestart: false,
                    tickCallback: function(val) {this.visibility = val;}.bind(mesh),
                    doneCallback: function() {this.visibility = 0;}.bind(mesh)
                });
            }

            export function fadeInMesh(mesh, milliseconds: number = 2000) {
                // Note: For complex geometries, this will likely cause problems.
                // See http://www.html5gamedevs.com/topic/25430-transparency-issues/
                World.Timers.addTimer({
                    intervalInMiliseconds: milliseconds, //milliseconds,
                    interpValStart: 0.0,
                    interpValEnd: 1.0,
                    autoRestart: false,
                    tickCallback: function(val) {this.visibility = val;}.bind(mesh),
                    doneCallback: function() {this.visibility = 1.0;}.bind(mesh)
                });
            }
        }
    }
}