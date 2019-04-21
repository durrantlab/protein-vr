import * as Globals from "../config/Globals";

export class AudioTrigger {
    private _frameIdx: number;
    private _mp3File: string = "";
    private _BABYLON: any;
    private _scene: any;

    constructor(frameIdx: number, mp3File: string) {
        this._frameIdx = frameIdx;
        this._mp3File = mp3File;
        this._BABYLON = Globals.get("BABYLON");
        this._scene = Globals.get("scene");
    }

    public check(frameIdx: number) {
        // Apparently it's already played once.
        if (this._mp3File === "") {
            return;
        }

        // console.log(frameIdx, this._frameIdx, "DDD");

        if (frameIdx === this._frameIdx) {
            // It matches, and it's never played before.
            // Note that this sound is not spatialized.
            var music = new this._BABYLON.Sound("Music" + Math.random().toString(), this._mp3File, this._scene, null, { loop: false, autoplay: true });

            // Only allow it to play once.
            this._mp3File = "";
        }
    }
}