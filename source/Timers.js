define(["require", "exports", "./Core/Core"], function (require, exports, Core_1) {
    "use strict";
    var Timers;
    (function (Timers) {
        Timers.timers = {};
        Timers.lastTime = new Date().getTime();
        function addTimer(params) {
            // Default tickFrameFrequency to 1 (check timer every frame)
            params.tickFrameFrequency = (params.tickFrameFrequency === undefined) ? 1 : params.tickFrameFrequency;
            // Make a new timer.
            var newTimer = new Timer(params);
            // Add it to the timer list.
            Timers.timers[params.name] = newTimer;
        }
        Timers.addTimer = addTimer;
        function tick() {
            // get time that has passed since last tick
            var nowTime = new Date().getTime();
            var deltaTime = nowTime - Timers.lastTime;
            Timers.lastTime = nowTime;
            for (var key in Timers.timers) {
                if (Timers.timers.hasOwnProperty(key)) {
                    Timers.timers[key].tick(deltaTime);
                }
            }
        }
        Timers.tick = tick;
        var Timer = (function () {
            function Timer(params) {
                this.timeRemaining = undefined;
                // Set object values.
                this.parameters = params;
                // Set the current time remaining.
                this.timeRemaining = params.intervalInMiliseconds;
                // There's a lot of functions flying around here. Let's add
                // the current object to this.parameters.extraVars just in
                // case one of those functions is in another context (so you
                // don't have to figure out what "this" is).
                this.parameters.extraVars = (this.parameters.extraVars === undefined) ? {} : this.parameters.extraVars;
                this.parameters.extraVars.timerObj = this;
                Core_1.default.debugMsg("Timer " + this.parameters.name + ": Starting");
            }
            Timer.prototype.tick = function (deltaTime) {
                // Compute the remaining time on this timer
                this.timeRemaining = this.timeRemaining - deltaTime;
                // See if this timer is set to be checked for this frame number.
                if (Core_1.default.frameNum % this.parameters.tickFrameFrequency !== 0) {
                    return;
                }
                // Core.debugMsg("Timer " + this.parameters.name + ": Tick. " + this.timeRemaining.toString() + " ms remaining.");
                // Run the tick callback if it exists
                if (this.parameters.tickCallback !== undefined) {
                    // Interpolate between the start and end values, based on timer value.
                    // pts: (countdowntime, interpval)
                    //   (this.parameters.intervalInMiliseconds, this.parameters.interpValStart)
                    //   (0, this.parameters.interpValEnd)
                    var rise = this.parameters.interpValStart - this.parameters.interpValEnd;
                    var run = this.parameters.intervalInMiliseconds;
                    var m = rise / run;
                    var interpVal = m * this.timeRemaining + this.parameters.interpValEnd;
                    // Be sure to also pass the extraVars to any callback.
                    this.parameters.tickCallback(interpVal, this.parameters.extraVars);
                }
                // If timeRemaining is less than 0, trigger doneCallback
                if (this.timeRemaining < 0) {
                    if (this.parameters.doneCallback !== undefined) {
                        Core_1.default.debugMsg("Timer " + this.parameters.name + ": Calling doneCallBack. Time remaining: " + this.timeRemaining.toString() + " ms");
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
                        Core_1.default.debugMsg("Timer " + this.parameters.name + ": Restarting");
                        this.timeRemaining = this.timeRemaining + this.parameters.intervalInMiliseconds;
                    }
                    else {
                        Core_1.default.debugMsg("Timer " + this.parameters.name + ": Removing");
                        // Otherwise, remove the timer from the list so it is no longer called.
                        delete Timers.timers[this.parameters.name];
                    }
                }
            };
            return Timer;
        }());
        Timers.Timer = Timer;
    })(Timers || (Timers = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Timers;
});
