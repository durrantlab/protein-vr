namespace World {
    export namespace Timers {
        export var timers = {};
        export var lastTime = new Date().getTime();

        export interface TimerInterface {
            name: string,
            intervalInMiliseconds: number;
            autoRestart: boolean;  // Whether or not to automatically restart timer once done.
            extraVars?: any;  // A place to store extra variables that can be accessed within the callbacks.
            tickCallback?: any;
            interpValStart?: number;  // These only needed if you use tickCallback
            interpValEnd?: number;
            doneCallback?: any;
            tickFrameFrequency?: number;  // For timers where exact timing
                                          // isn't critical, you might
                                          // evaluate them every 10 frames or
                                          // something to save on CPU demands.
        }

        export function addTimer(params: World.Timers.TimerInterface) {
            // Default tickFrameFrequency to 1 (check timer every frame)
            params.tickFrameFrequency = (params.tickFrameFrequency === undefined) ? 1 : params.tickFrameFrequency;
            
            // Make a new timer.
            let newTimer = new World.Timers.Timer(params);

            // Add it to the timer list.
            World.Timers.timers[params.name] = newTimer;
        }

        export function tick() {
            // get time that has passed since last tick
            let nowTime: number = new Date().getTime();
            let deltaTime = nowTime - World.Timers.lastTime;
            World.Timers.lastTime = nowTime;

            for (var key in World.Timers.timers) {
                if (World.Timers.timers.hasOwnProperty(key)) {
                    World.Timers.timers[key].tick(deltaTime);
                }
            }
        }
        
        export class Timer {
            public parameters: World.Timers.TimerInterface;
            public timeRemaining: number = undefined;

            constructor(params: World.Timers.TimerInterface) {
                // Set object values.
                this.parameters = params

                // Set the current time remaining.
                this.timeRemaining = params.intervalInMiliseconds;

                // There's a lot of functions flying around here. Let's add
                // the current object to this.parameters.extraVars just in
                // case one of those functions is in another context (so you
                // don't have to figure out what "this" is).
                this.parameters.extraVars = (this.parameters.extraVars === undefined) ? {} : this.parameters.extraVars;
                this.parameters.extraVars.timerObj = this;

                World.debugMsg("Timer " + this.parameters.name + ": Starting");
            }

            public tick(deltaTime: number) {
                // Compute the remaining time on this timer
                this.timeRemaining = this.timeRemaining - deltaTime;

                // See if this timer is set to be checked for this frame number.
                if (World.frameNum % this.parameters.tickFrameFrequency !== 0) {
                    return;
                }

                // World.debugMsg("Timer " + this.parameters.name + ": Tick. " + this.timeRemaining.toString() + " ms remaining.");

                // Run the tick callback if it exists
                if (this.parameters.tickCallback !== undefined) {
                    // Interpolate between the start and end values, based on timer value.
                    // pts: (countdowntime, interpval)
                    //   (this.parameters.intervalInMiliseconds, this.parameters.interpValStart)
                    //   (0, this.parameters.interpValEnd)

                    let rise = this.parameters.interpValStart - this.parameters.interpValEnd;
                    let run = this.parameters.intervalInMiliseconds;
                    let m = rise / run;
                    let interpVal = m * this.timeRemaining + this.parameters.interpValEnd;

                    // Be sure to also pass the extraVars to any callback.
                    this.parameters.tickCallback(interpVal, this.parameters.extraVars);
                }

                // If timeRemaining is less than 0, trigger doneCallback
                if (this.timeRemaining < 0) {
                    if (this.parameters.doneCallback !== undefined) {
                        World.debugMsg("Timer " + this.parameters.name + ": Calling doneCallBack. Time remaining: " + this.timeRemaining.toString() + " ms");

                        // Be sure to pass extraVars to any callback.
                        this.parameters.doneCallback(this.parameters.extraVars);
                    }
                }

                if (this.timeRemaining < 0) {
                    // Don't merge this with the if block above, because
                    // there's a chance that in some circumstances the
                    // callback function might modify this.timeRemaining. So
                    // you need to recheck it.

                    // If it's autorestart, add the interval time to timeRemaining.
                    if (this.parameters.autoRestart === true) {
                        World.debugMsg("Timer " + this.parameters.name + ": Restarting");
                        this.timeRemaining = this.timeRemaining + this.parameters.intervalInMiliseconds;
                    } else {
                        World.debugMsg("Timer " + this.parameters.name + ": Removing");

                        // Otherwise, remove the timer from the list so it is no longer called.
                        delete World.Timers.timers[this.parameters.name];
                    }
                }
            }
        }
    }
}