import * as Globals from "../config/Globals";
import * as UserVars from "../config/UserVars";

export class WebsiteTrigger {
    private _frameIdx: number;
    private _url: string = "";

    constructor(frameIdx: number, url: string) {
        this._frameIdx = frameIdx;
        this._url = url;
        // this._BABYLON = Globals.get("BABYLON");
        // this._scene = Globals.get("scene");
    }

    public check(frameIdx: number) {
        // Apparently it's already played once.
        if (this._url === "") {
            return;
        }

        // console.log(frameIdx, this._frameIdx, "DDD");

        if (frameIdx === this._frameIdx) {
            // It matches, and it's never been redirected.

            // Add get parameters to the url.
            let url = this._url;
            let toAdd: string = "?";
            if (url.indexOf("?") !== -1) {
                toAdd = "&";
            }
            url = url + toAdd + "viewer=" + UserVars.viewers[UserVars.getParam("viewer")].toLowerCase();

            // If currently full screen, next one should be too...
            let engine = Globals.get("engine");
            if (engine.isFullscreen) {
                url = url + "&fullscreen=true";
            }

            window.location.href = url;

            // Only allow it to transfer once.
            this._url = "";
        }
    }
}