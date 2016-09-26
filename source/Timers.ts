namespace World {
    export namespace Timers {
        export var timersList = [];
        export var lastTime = new Date().getTime();

        export interface NewTimerInterface {
            intervalInMiliseconds: number;
            interpValStart: number;
            interpValEnd: number;
            autoRestart: boolean;  // Whether or not to automatically restart timer once done.
            tickCallback?: any;
            doneCallback?: any;
        }

        export interface TimerObjInterface extends NewTimerInterface {
            index?: number;
        }

        export function addTimer(params: World.Timers.NewTimerInterface) {
            let params2: World.Timers.TimerObjInterface = params;
            params2.index = World.Timers.timersList.length;
            let newTimer = new World.Timers.Timer(params2);
            World.Timers.timersList.push(newTimer);
        }

        export function tick() {
            // get time that has passed since last tick
            let nowTime: number = new Date().getTime();
            let deltaTime = nowTime - World.Timers.lastTime;
            World.Timers.lastTime = nowTime;

            for (let i = 0; i < World.Timers.timersList.length; i++) {
                let timer = World.Timers.timersList[i];
                timer.tick(deltaTime);
            }
        }
        
        export class Timer {
            public parameters: World.Timers.TimerObjInterface;
            public timeRemaining: number = undefined;

            constructor(params: World.Timers.TimerObjInterface) {
                // Set object values.
                this.parameters = params

                // Set the current time remaining.
                this.timeRemaining = params.intervalInMiliseconds;
            }

            public tick(deltaTime: number) {
                // Compute the remaining time on this timer
                this.timeRemaining = this.timeRemaining - deltaTime;

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
                    this.parameters.tickCallback(interpVal);
                }

                // If timeRemaining is less than 0, trigger doneCallback
                if (this.timeRemaining < 0) {
                    if (this.parameters.doneCallback !== undefined) {
                        this.parameters.doneCallback();
                    }

                    // If it's autorestart, add the interval time to timeRemaining.
                    if (this.parameters.autoRestart === true) {
                        this.timeRemaining = this.timeRemaining + this.parameters.intervalInMiliseconds;
                    } else {
                        // Otherwise, remove the timer from the list so it is no longer called.
                        World.Timers.timersList.splice(this.parameters.index, 1);
                    }
                }
            }
        }
    }
}