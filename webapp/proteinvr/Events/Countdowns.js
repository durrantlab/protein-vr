define(["require", "exports", "../Core/Core"], function (require, exports, Core) {
    "use strict";
    // namespace Countdowns {
    /**
    This namespace stores countdowns.
    */
    /**
    A json object where the countdowns are stored.
    */
    exports.countdowns = {};
    /**
    The last recorded time the Countdowns were fired.
    */
    exports.lastTime = new Date().getTime();
    /**
    Whether or not the render loop knows about the countdowns.
    */
    exports.checkCountdownsAlreadyAddedToLoop = false;
    /**
    The default Countdown variables.
    */
    exports.defaults = {
        autoRestartAfterCountdownDone: false,
        extraVars: {},
        afterCountdownAdvanced: undefined,
        countdownStartVal: 0.0,
        countdownEndVal: 1.0,
        doneCallback: undefined,
        updateCountdownsFrameFrequency: 1
    };
    function addCountdown(params) {
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
        var newCountdown = new Countdown(params);
        // Add it to the countdown list.
        exports.countdowns[params.name] = newCountdown;
        // Add a countdown advanceer to the loop if it hasn't already been added.
        if (exports.checkCountdownsAlreadyAddedToLoop === false) {
            exports.checkCountdownsAlreadyAddedToLoop = true;
            PVRGlobals.extraFunctionsToRunInLoop_BeforeCameraLocFinalized.push(function () {
                advanceAllCountdowns();
            });
        }
        // Return the new countdown too.
        return newCountdown;
    }
    exports.addCountdown = addCountdown;
    function advanceAllCountdowns() {
        /**
        This function updates the current times on all Countdowns. It causes all
        countdowns to "advance."
        */
        // get time that has passed since last advance
        var nowTime = new Date().getTime();
        var deltaTime = nowTime - exports.lastTime;
        exports.lastTime = nowTime;
        // fire the advances on all the countdowns.
        for (var key in exports.countdowns) {
            if (exports.countdowns.hasOwnProperty(key)) {
                exports.countdowns[key].advance(deltaTime);
            }
        }
    }
    exports.advanceAllCountdowns = advanceAllCountdowns;
    var Countdown = (function () {
        function Countdown(params) {
            /**
            The Countdown constructor.
    
            :param CountdownInterface params: The parameters that govern the
                                    behavior of this countdown.
            */
            this.timeRemaining = undefined;
            // Set object values.
            this.parameters = params;
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
        Countdown.prototype.dispose = function () {
            /**
            Dispose of this countdown. It stops advanceing.
            */
            // Stop this countdown, even if it hasn't yet run it's course.
            delete exports.countdowns[this.parameters.name];
        };
        Countdown.prototype.advance = function (deltaTime) {
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
                var rise = this.parameters.countdownStartVal - this.parameters.countdownEndVal;
                var run = this.parameters.countdownDurationMilliseconds;
                var m = rise / run;
                var timeRemainingToUse = this.timeRemaining;
                if (timeRemainingToUse < 0.0) {
                    timeRemainingToUse = 0.0;
                }
                var interpVal = m * timeRemainingToUse + this.parameters.countdownEndVal;
                // Be sure to also pass the extraVars to any callback.
                this.parameters.afterCountdownAdvanced(interpVal, this.parameters.extraVars);
            }
            // If timeRemaining is less than 0, trigger doneCallback
            if (this.timeRemaining < 0) {
                if (this.parameters.doneCallback !== undefined) {
                    // Core.debugMsg("Countdown " + this.parameters.name + ": Calling doneCallBack. Time remaining: " + this.timeRemaining.toString() + " ms");
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
                    // Core.debugMsg("Countdown " + this.parameters.name + ": Restarting");
                    this.timeRemaining = this.timeRemaining + this.parameters.countdownDurationMilliseconds;
                }
                else {
                    // Core.debugMsg("Countdown " + this.parameters.name + ": Removing");
                    // Otherwise, remove the countdown from the list so it is no
                    // longer called.
                    this.dispose();
                }
            }
        };
        return Countdown;
    }());
    exports.Countdown = Countdown;
});
// }
// export default Countdowns;
