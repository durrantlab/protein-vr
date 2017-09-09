define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExtractFrames {
        constructor(BABYLON, jQuery, game, callBack = function () { }) {
            this._lastCurrentTime = 0;
            // Create storage elements and variables
            // this._video = document.createElement('video');
            // this._canvas = document.createElement('canvas');
            // this._sampledFrames = [];
            // this._ctx = this._canvas.getContext('2d');
            this._callBack = callBack;
            this._game = game;
            this.BABYLON = BABYLON;
            jQuery.get("./frames/filenames.json", function (data) {
                for (let i = 0; i < data.length; i++) {
                    console.log("DEBUGGING CODE HERE...");
                    let filename = "./frames/" + data[i] + "?" + Math.random().toString(); // Note no caching, for debugging.
                    let tex = new this.BABYLON.Texture(filename, this._game.scene);
                    this._game.cameraPositionsAndTextures[i][1] = tex;
                }
                // Fire the callback.
                this._callBack();
            }.bind(this));
            return;
            // Start loading video
            // this._video.autoplay = true;
            // this._video.muted = true;
            // let initCanvas = this._initCanvas.bind(this);
            // let drawFrame = this._drawFrame.bind(this);
            // let onend = this._onend.bind(this);
            // this._video.addEventListener('loadedmetadata', initCanvas, false);
            // this._video.addEventListener('timeupdate', drawFrame, false);
            // this._video.addEventListener('ended', onend, false);
            // this._video.src = videoUrl;
        }
    }
    exports.ExtractFrames = ExtractFrames;
});
// let ef = new extractFrames("proteinvr_baked.mp4", function() {
//     console.log("done");
// }); 
