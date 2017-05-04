import * as Core from "../Core/Core";
import * as RenderLoop from "../Core/RenderLoop";

declare var PVRGlobals;

// namespace Countdowns {
/**
This namespace stores countdowns.
*/

/**
A json object where the countdowns are stored. 
*/
export var countdowns = {};

/**
The last recorded time the Countdowns were fired.
*/
export var lastTime = new Date().getTime();

/**
Whether or not the render loop knows about the countdowns.
*/
export var checkCountdownsAlreadyAddedToLoop: boolean = false;

export interface CountdownInterface {
    /**
    The Countdown interface. To make sure the correct variables are passed.
    */

    name: string,
    countdownDurationMilliseconds: number;  // The duration of the countdown
    autoRestartAfterCountdownDone?: boolean;  // Whether or not to automatically restart countdown
                            // once done.
    extraVars?: any;  // A place to store extra variables that can be 
                        // accessed within the callbacks.
    afterCountdownAdvanced?: any;  // Call this function at every advance of the countdown
    countdownStartVal?: number;  // These only needed if you use afterCountdownAdvanced
    countdownEndVal?: number;
    doneCallback?: any;  // This function runs when the countdown is done.
    updateCountdownsFrameFrequency?: number;  // For countdowns where exact timing
                                    // isn't critical, you might
                                    // evaluate them every 10 frames or
                                    // something to save on CPU demands.
}

/**
The default Countdown variables.
*/
export var defaults = {
    autoRestartAfterCountdownDone: false,
    extraVars: {},
    afterCountdownAdvanced: undefined,
    countdownStartVal: 0.0,
    countdownEndVal: 1.0,
    doneCallback: undefined,
    updateCountdownsFrameFrequency: 1
}

export function addCountdown(params: CountdownInterface): Countdown {
    /**
    Function to add a countdown.

    :param CountdownInterface params: The parameters associated with this
                            countdown.

    :returns: Aside from adding it the universal list, this function also
                returns the new countdown.
    :rtype: :any:`Countdown`
    */

    // Set default values
    for (var key in this.defaults) {
        if (this.defaults.hasOwnProperty(key)) {
            if (params[key] === undefined) {
                params[key] = this.defaults[key];
            }
        }
    }

    // Default updateCountdownsFrameFrequency to 1 (check countdown every frame)
    params.updateCountdownsFrameFrequency = (params.updateCountdownsFrameFrequency === undefined) ? 1 : params.updateCountdownsFrameFrequency;

    // Make a new countdown.
    let newCountdown = new Countdown(params);

    // Add it to the countdown list.
    countdowns[params.name] = newCountdown;

    // Add a countdown advanceer to the loop if it hasn't already been added.
    if (checkCountdownsAlreadyAddedToLoop === false) {
        checkCountdownsAlreadyAddedToLoop = true;
        PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized.push(function() {
            advanceAllCountdowns();
        })
    }

    // Return the new countdown too.
    return newCountdown;
}

export function advanceAllCountdowns(): void {
    /**
    This function updates the current times on all Countdowns. It causes all
    countdowns to "advance."
    */

    // get time that has passed since last advance
    let nowTime: number = new Date().getTime();
    let deltaTime = nowTime - lastTime;
    lastTime = nowTime;

    // fire the advances on all the countdowns.
    for (var key in countdowns) {
        if (countdowns.hasOwnProperty(key)) {
            countdowns[key].advance(deltaTime);
        }
    }
}

export class Countdown {
    /**
    This is the Countdown class.
    */

    public parameters: CountdownInterface;
    public timeRemaining: number = undefined;

    constructor(params: CountdownInterface) {
        /**
        The Countdown constructor.

        :param CountdownInterface params: The parameters that govern the
                                behavior of this countdown.
        */

        // Set object values.
        this.parameters = params

        // Set the current time remaining.
        this.timeRemaining = params.countdownDurationMilliseconds;

        // There's a lot of functions flying around here. Let's add
        // the current object to this.parameters.extraVars just in
        // case one of those functions is in another context (so you
        // don't have to figure out what "this" is).
        this.parameters.extraVars = (this.parameters.extraVars === undefined) ? {} : this.parameters.extraVars;
        this.parameters.extraVars.countdownObj = this;

        Core.debugMsg("Countdown " + this.parameters.name + ": Starting");
    }

    public dispose(): void {
        /**
        Dispose of this countdown. It stops advanceing.
        */

        // Stop this countdown, even if it hasn't yet run it's course.
        delete countdowns[this.parameters.name];
    }

    public advance(deltaTime: number): void {
        /**
        Cause this countdown to advance. It updates the time and runs the
        advanceCallBack function, passing the countdown's current value.

        :param float deltaTime: How much time has passed since the last
                        advance.
        */

        // Compute the remaining time on this countdown
        this.timeRemaining = this.timeRemaining - deltaTime;

        // See if this countdown is set to be checked for this frame number.
        if (PVRGlobals.frameNum % this.parameters.updateCountdownsFrameFrequency !== 0) {
            return;
        }

        // Run the advance callback if it exists
        if (this.parameters.afterCountdownAdvanced !== undefined) {
            // Interpolate between the start and end values, based on
            // countdown value.
            // pts: (countdowntime, interpval)
            //   (this.parameters.countdownDurationMilliseconds, this.parameters.countdownStartVal)
            //   (0, this.parameters.countdownEndVal)

            let rise = this.parameters.countdownStartVal - this.parameters.countdownEndVal;
            let run = this.parameters.countdownDurationMilliseconds;
            let m = rise / run;
            let interpVal = m * this.timeRemaining + this.parameters.countdownEndVal;

            // Be sure to also pass the extraVars to any callback.
            this.parameters.afterCountdownAdvanced(interpVal, this.parameters.extraVars);
        }

        // If timeRemaining is less than 0, trigger doneCallback
        if (this.timeRemaining < 0) {
            if (this.parameters.doneCallback !== undefined) {
                Core.debugMsg("Countdown " + this.parameters.name + ": Calling doneCallBack. Time remaining: " + this.timeRemaining.toString() + " ms");

                // Be sure to pass extraVars to any callback.
                this.parameters.doneCallback(this.parameters.extraVars);
            }
        }

        if (this.timeRemaining < 0) {
            // Don't merge this with the if block above, because
            // there's a chance that in some circumstances the
            // callback function might modify this.timeRemaining. So
            // you need to recheck it.

            // If it's autoRestartAfterCountdownDone, add the interval time to timeRemaining.
            if (this.parameters.autoRestartAfterCountdownDone === true) {
                Core.debugMsg("Countdown " + this.parameters.name + ": Restarting");
                this.timeRemaining = this.timeRemaining + this.parameters.countdownDurationMilliseconds;
            } else {
                Core.debugMsg("Countdown " + this.parameters.name + ": Removing");

                // Otherwise, remove the countdown from the list so it is no
                // longer called.
                this.dispose();
            }
        }
    }
}
// }

// export default Countdowns;
