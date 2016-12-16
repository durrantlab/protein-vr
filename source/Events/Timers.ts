import Core from "../Core/Core";
import RenderLoop from "../Core/RenderLoop";

namespace Timers {
    /**
     * This namespace stores timers.
     */

    /**
     * A json object where the timers are stored. 
     */
    export var timers = {};

    /**
     * The last recorded time the Timers were fired.
     */
    export var lastTime = new Date().getTime();

    /**
     * Whether or not the render loop knows about the timers.
     */
    export var tickAllTimersAddedToLoop: boolean = false;

    export interface TimerInterface {
        /**
         * The Timer interface. To make sure the correct variables are passed.
         */

        name: string,
        durationInMiliseconds: number;  // The duration of the timer
        repeated?: boolean;  // Whether or not to automatically restart timer
                             // once done.
        extraVars?: any;  // A place to store extra variables that can be 
                          // accessed within the callbacks.
        tickCallback?: any;  // Call this function at every tick of the timer
        interpValStart?: number;  // These only needed if you use tickCallback
        interpValEnd?: number;
        doneCallback?: any;  // This function runs when the timer is done.
        tickFrameFrequency?: number;  // For timers where exact timing
                                      // isn't critical, you might
                                      // evaluate them every 10 frames or
                                      // something to save on CPU demands.
    }

    /**
     * The default Timer variables.
     */
    export var defaults = {
        repeated: false,
        extraVars: {},
        tickCallback: undefined,
        interpValStart: 0.0,
        interpValEnd: 1.0,
        doneCallback: undefined,
        tickFrameFrequency: 1
    }

    export function addTimer(params: TimerInterface): Timer {
        /**
         * Function to add a timer.
         * @param  {TimerInterface} params  The parameters associated with this
         *                                      timer.
         * @return {Timer}                 Aside from adding it the universal
         *                                     list, this function also returns 
         *                                     the new timer.
         */

        // Set default values
        for (var key in this.defaults) {
            if (this.defaults.hasOwnProperty(key)) {
                if (params[key] === undefined) {
                    params[key] = this.defaults[key];
                }
            }
        }

        // Default tickFrameFrequency to 1 (check timer every frame)
        params.tickFrameFrequency = (params.tickFrameFrequency === undefined) ? 1 : params.tickFrameFrequency;

        // Make a new timer.
        let newTimer = new Timer(params);

        // Add it to the timer list.
        timers[params.name] = newTimer;

        // Add a timer ticker to the loop if it hasn't already been added.
        if (Timers.tickAllTimersAddedToLoop === false) {
            Timers.tickAllTimersAddedToLoop = true;
            RenderLoop.extraFunctionsToRunInLoop.push(function() {
                Timers.tickAllTimers();
            })
        }

        // Return the new timer too.
        return newTimer;
    }

    export function tickAllTimers(): void {
        /**
         * This function updates the current times on all Timers. It causes all
         * timers to "tick."
         */

        // get time that has passed since last tick
        let nowTime: number = new Date().getTime();
        let deltaTime = nowTime - lastTime;
        lastTime = nowTime;

        // fire the ticks on all the timers.
        for (var key in timers) {
            if (timers.hasOwnProperty(key)) {
                timers[key].tick(deltaTime);
            }
        }
    }

    export class Timer {
        /**
         * This is the Timer class.
         */

        public parameters: TimerInterface;
        public timeRemaining: number = undefined;

        constructor(params: TimerInterface) {
            /**
             * The Timer constructor.
             * @param  {TimerInterface} params  The parameters that govern the
             *                                  behavior of this timer.
             */

            // Set object values.
            this.parameters = params

            // Set the current time remaining.
            this.timeRemaining = params.durationInMiliseconds;

            // There's a lot of functions flying around here. Let's add
            // the current object to this.parameters.extraVars just in
            // case one of those functions is in another context (so you
            // don't have to figure out what "this" is).
            this.parameters.extraVars = (this.parameters.extraVars === undefined) ? {} : this.parameters.extraVars;
            this.parameters.extraVars.timerObj = this;

            Core.debugMsg("Timer " + this.parameters.name + ": Starting");
        }

        public dispose(): void {
            /**
             * Dispose of this timer. It stops ticking.
             */

            // Stop this timer, even if it hasn't yet run it's course.
            delete timers[this.parameters.name];
        }

        public tick(deltaTime: number): void {
            /**
             * Cause this timer to tick. It updates the time and runs the
             *     tickCallBack function, passing the timer's current value.
             * @param {number} deltaTime  How much time has passed since the last
             *                                tick.
             */

            // Compute the remaining time on this timer
            this.timeRemaining = this.timeRemaining - deltaTime;

            // See if this timer is set to be checked for this frame number.
            if (Core.frameNum % this.parameters.tickFrameFrequency !== 0) {
                return;
            }

            // Run the tick callback if it exists
            if (this.parameters.tickCallback !== undefined) {
                // Interpolate between the start and end values, based on
                // timer value.
                // pts: (countdowntime, interpval)
                //   (this.parameters.durationInMiliseconds, this.parameters.interpValStart)
                //   (0, this.parameters.interpValEnd)

                let rise = this.parameters.interpValStart - this.parameters.interpValEnd;
                let run = this.parameters.durationInMiliseconds;
                let m = rise / run;
                let interpVal = m * this.timeRemaining + this.parameters.interpValEnd;

                // Be sure to also pass the extraVars to any callback.
                this.parameters.tickCallback(interpVal, this.parameters.extraVars);
            }

            // If timeRemaining is less than 0, trigger doneCallback
            if (this.timeRemaining < 0) {
                if (this.parameters.doneCallback !== undefined) {
                    Core.debugMsg("Timer " + this.parameters.name + ": Calling doneCallBack. Time remaining: " + this.timeRemaining.toString() + " ms");

                    // Be sure to pass extraVars to any callback.
                    this.parameters.doneCallback(this.parameters.extraVars);
                }
            }

            if (this.timeRemaining < 0) {
                // Don't merge this with the if block above, because
                // there's a chance that in some circumstances the
                // callback function might modify this.timeRemaining. So
                // you need to recheck it.

                // If it's repeated, add the interval time to timeRemaining.
                if (this.parameters.repeated === true) {
                    Core.debugMsg("Timer " + this.parameters.name + ": Restarting");
                    this.timeRemaining = this.timeRemaining + this.parameters.durationInMiliseconds;
                } else {
                    Core.debugMsg("Timer " + this.parameters.name + ": Removing");

                    // Otherwise, remove the timer from the list so it is no
                    // longer called.
                    this.dispose();
                }
            }
        }
    }
}

export default Timers;
