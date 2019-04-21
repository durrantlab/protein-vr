// Controls animations, loaded through data.json. Just translation and
// rotation.

// Note that ProteinVR doesn't currently make these animations automatically.
// This object has to be explicitly created.

// TODO: Blender exporter uses markers to define animations?

import * as Globals from "../../config/Globals";
import * as CubicSpline from "./CubicSpline";

export class Animation {
    /*
    A class to manage animations (not armature animations... just translation
    and rotation).
    */

    private _animationSpline = undefined;
    private _obj = undefined;
    private _BABYLON = Globals.get("BABYLON");
    private _firstFrameIndex: number = undefined;
    private _lastFrameIndex: number = undefined;

    constructor(obj: any) {
        /*
        Construct the Animation object for a mesh.

        :param ??? obj: The BABYLON.Mesh object to animate.
        */

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
        let lastFrameIndex = Globals.get("lastFrameIndex");
        this._lastFrameIndex = lastFrameIndex;
        let objAnimData = animationData[objName];

        // Extract just the desired frames.
        let framesToKeep = [];
        let posAndRot = [];
        let lastPosAndRot = undefined;
        for (let i=firstFrameIndex; i<=lastFrameIndex; i++) {
            framesToKeep.push(i);
            let thisPosAndRot = (objAnimData[i] !== undefined) ? objAnimData[i] : lastPosAndRot;
            posAndRot.push(thisPosAndRot);
            lastPosAndRot = thisPosAndRot;
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
        /*
        Positions and rotates the object tomatch a given animation frame.

        :param number frameIndex: The frame number.
        */

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

    public play(durationInSeconds: number, animationStartFrame: number = undefined, animationEndFrame: number = undefined, playLoop: string = "FALSE"): void {
        /*
        Play the animation.

        :param number durationInSeconds: The duration of the animation.

        :param number animationStartFrame: The starting frame number.

        :param number animationEndFrame: The ending frame number.

        :param string playLoop: How to play the animation. "FALSE" means no
                      loop. "LOOP" means loop the animation. "ROCK" means go
                      forward through the animation, then back, then forward.
        */
        
        animationStartFrame = animationStartFrame === undefined ? this._firstFrameIndex : animationStartFrame;
        animationEndFrame = animationEndFrame === undefined ? this._lastFrameIndex: animationEndFrame;
        
        this._playStartTime = new Date().getTime() / 1000;
        this._playStartFrame = animationStartFrame;
        this._playEndFrame = animationEndFrame;
        this._playDurationInSeconds = durationInSeconds;
        this._playDeltaFrames = animationEndFrame - animationStartFrame;
        this._playing = true;
        this._playLoop = playLoop;
    }

    public stop(): void {
        /*
        Stop playing the animation.
        */

        this._playing = false;
    }

    public updatePos(): void {
        /*
        Update the animation based on the amount of time that has passed since
        the animation was started. Also iniates looping.
        */
        
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
            }
        }
    }
}

