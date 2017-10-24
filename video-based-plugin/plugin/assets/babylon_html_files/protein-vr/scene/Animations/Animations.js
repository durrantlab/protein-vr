// Controls animations, loaded through data.json. Just translation and
// rotation.
define(["require", "exports", "../../config/Globals", "./CubicSpline"], function (require, exports, Globals, CubicSpline) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Animation {
        constructor(obj) {
            this._animationSpline = undefined;
            this._obj = undefined;
            this._BABYLON = Globals.get("BABYLON");
            this._firstFrameIndex = undefined;
            this._numFrames = undefined;
            this._playing = false;
            this._playStartTime = undefined;
            this._playStartFrame = undefined;
            this._playEndFrame = undefined;
            this._playDurationInSeconds = undefined;
            this._playDeltaFrames = undefined;
            this._playLoop = "FALSE";
            if (typeof (obj) === "string") {
                let scene = Globals.get("scene");
                obj = scene.getMeshByName(obj);
            }
            this._obj = obj;
            // Get the data that will be processed.
            let objName = obj.name;
            let animationData = Globals.get("animationData");
            let firstFrameIndex = Globals.get("firstFrameIndex");
            this._firstFrameIndex = firstFrameIndex;
            let objAnimData = animationData[objName];
            this._numFrames = objAnimData.length;
            // Extract just the desired frames.
            let framesToKeep = [];
            let posAndRot = [];
            for (let i = 0; i < objAnimData.length; i++) {
                let frameIndex = firstFrameIndex + i;
                framesToKeep.push(frameIndex);
                posAndRot.push(objAnimData[i]);
            }
            // Make a spline.
            this._animationSpline = new CubicSpline.MultiDimenSpline(framesToKeep, posAndRot);
            // Set pivot point to location of first frame?
            this.setAnimationFrame(firstFrameIndex);
            // Save this object to the mesh
            this._obj.PVRAnimation = this;
            let meshesWithAnimations = Globals.get("meshesWithAnimations");
            meshesWithAnimations.push(this._obj);
            Globals.set("meshesWithAnimations", meshesWithAnimations);
        }
        setAnimationFrame(frameIndex) {
            // See https://doc.babylonjs.com/tutorials/position,_rotate,_translate_and_spaces
            let vals = this._animationSpline.get(frameIndex);
            let pos = new this._BABYLON.Vector3(vals[0], vals[2], vals[1]);
            this._obj.position = pos;
            this._obj.setPivotMatrix(this._BABYLON.Matrix.Translation(0, 0, 0));
            this._obj.rotation = new this._BABYLON.Vector3(vals[3], vals[5], vals[4]);
        }
        play(durationInSeconds, animationStartFrame = undefined, animationEndFrame = undefined, playLoop = "FALSE") {
            animationStartFrame = animationStartFrame === undefined ? this._firstFrameIndex : animationStartFrame;
            animationEndFrame = animationEndFrame === undefined ? this._firstFrameIndex + this._numFrames - 1 : animationEndFrame;
            this._playStartTime = new Date().getTime() / 1000;
            this._playStartFrame = animationStartFrame;
            this._playEndFrame = animationEndFrame;
            this._playDurationInSeconds = durationInSeconds;
            this._playDeltaFrames = animationEndFrame - animationStartFrame;
            this._playing = true;
            this._playLoop = playLoop;
        }
        stop() {
            this._playing = false;
        }
        updatePos() {
            if (this._playing) {
                let deltaTimeInSecs = new Date().getTime() / 1000 - this._playStartTime;
                if (deltaTimeInSecs <= this._playDurationInSeconds) {
                    let timeRatio = deltaTimeInSecs / this._playDurationInSeconds;
                    let deltaFrames = this._playDeltaFrames * timeRatio;
                    let currentFrame = this._playStartFrame + deltaFrames;
                    this.setAnimationFrame(currentFrame);
                }
                else {
                    // Reached end of animation.
                    switch (this._playLoop) {
                        case "FALSE":
                            // stop animation.
                            this.stop();
                            break;
                        case "LOOP":
                            // Restart animation.
                            this.stop();
                            this.play(this._playDurationInSeconds, this._playStartFrame, this._playEndFrame, this._playLoop);
                            break;
                        case "ROCK":
                            this.stop();
                            this.play(this._playDurationInSeconds, this._playEndFrame, this._playStartFrame, this._playLoop);
                            break;
                        default:
                            console.log("ERROR");
                            debugger;
                    }
                    if (this._playLoop) {
                    }
                    else {
                    }
                }
            }
        }
    }
    exports.Animation = Animation;
});
