// Controls animations, loaded through data.json. Just translation and
// rotation.

// Note that ProteinVR doesn't currently make these animations automatically.
// This object has to be explicitly created.

// TODO: Blender exporter uses markers to define animations?

import * as Globals from "../../config/Globals";
import * as CubicSpline from "./CubicSpline";

export class Animation {
    private _animationSpline = undefined;
    private _obj = undefined;
    private _BABYLON = Globals.get("BABYLON");
    private _firstFrameIndex: number = undefined;
    private _numFrames: number = undefined;

    constructor(obj: any) {
        if (typeof(obj) === "string") {
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
        for (let i=0; i<objAnimData.length; i++) {
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

    public setAnimationFrame(frameIndex: number) {
        // See https://doc.babylonjs.com/tutorials/position,_rotate,_translate_and_spaces
        let vals = this._animationSpline.get(frameIndex);
        let pos = new this._BABYLON.Vector3(vals[0], vals[2], vals[1]);
        this._obj.position = pos;
        this._obj.setPivotMatrix(this._BABYLON.Matrix.Translation(0, 0, 0));
        this._obj.rotation = new this._BABYLON.Vector3(vals[3], vals[5], vals[4]);
    }

    private _playing: boolean = false;
    private _playStartTime: number = undefined;
    private _playStartFrame: number = undefined;
    private _playEndFrame: number = undefined;
    private _playDurationInSeconds: number = undefined;
    private _playDeltaFrames: number = undefined;
    private _playLoop: string = "FALSE";

    public play(durationInSeconds: number, animationStartFrame: number = undefined, animationEndFrame: number = undefined, playLoop: string = "FALSE") {
        animationStartFrame = animationStartFrame === undefined ? this._firstFrameIndex : animationStartFrame;
        animationEndFrame = animationEndFrame === undefined ? this._firstFrameIndex + this._numFrames - 1: animationEndFrame;
        
        this._playStartTime = new Date().getTime() / 1000;
        this._playStartFrame = animationStartFrame;
        this._playEndFrame = animationEndFrame;
        this._playDurationInSeconds = durationInSeconds;
        this._playDeltaFrames = animationEndFrame - animationStartFrame;
        this._playing = true;
        this._playLoop = playLoop;
    }

    public stop() {
        this._playing = false;
    }

    public updatePos() {
        if (this._playing) {
            let deltaTimeInSecs = new Date().getTime() / 1000 - this._playStartTime;
            if (deltaTimeInSecs <= this._playDurationInSeconds) {
                let timeRatio = deltaTimeInSecs / this._playDurationInSeconds;
                let deltaFrames = this._playDeltaFrames * timeRatio;
                let currentFrame = this._playStartFrame + deltaFrames;
                this.setAnimationFrame(currentFrame);
            } else {
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
                if (this._playLoop ) {
                } else {
                }
            }
        }
    }
}

