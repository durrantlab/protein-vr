define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var ExtractFrames = (function () {
        function ExtractFrames(videoUrl, BABYLON, game, callBack) {
            if (callBack === void 0) { callBack = function () { }; }
            this._lastCurrentTime = 0;
            // Create storage elements and variables
            this._video = document.createElement('video');
            this._canvas = document.createElement('canvas');
            this._sampledFrames = [];
            this._ctx = this._canvas.getContext('2d');
            this._callBack = callBack;
            this._game = game;
            this.BABYLON = BABYLON;
            // Start loading video
            this._video.autoplay = true;
            this._video.muted = true;
            var initCanvas = this._initCanvas.bind(this);
            var drawFrame = this._drawFrame.bind(this);
            var onend = this._onend.bind(this);
            this._video.addEventListener('loadedmetadata', initCanvas, false);
            this._video.addEventListener('timeupdate', drawFrame, false);
            this._video.addEventListener('ended', onend, false);
            this._video.src = videoUrl;
        }
        ExtractFrames.prototype._initCanvas = function (e) {
            this._canvas.width = this._video.videoWidth;
            this._canvas.height = this._video.videoHeight;
        };
        ExtractFrames.prototype._drawFrame = function (e) {
            this._video.pause();
            if (this._video.currentTime - this._lastCurrentTime > 1 / 36.0) {
                this._ctx.drawImage(this._video, 0, 0);
                /*
                Blob would be better than toDataURL, but I don't think babylon can easily work with blobs...
                */
                var dataUrl = this._canvas.toDataURL('image/jpeg', 1.0); // full quality needed?
                this._sampledFrames.push(dataUrl);
                // console.log(((this._video.currentTime / this._video.duration) * 100).toFixed(2) + ' %');
                this._lastCurrentTime = this._video.currentTime;
            }
            if (this._video.currentTime < this._video.duration) {
                this._video.play();
            }
        };
        ExtractFrames.prototype._onend = function (e) {
            // keep only every-so-few frames (to match framerate)
            var indeciesToKeep = [];
            var deltaIndex = (this._sampledFrames.length - 1) / (this._game.cameraPositionsAndTextures.length - 1);
            for (var i = 0; i < this._game.cameraPositionsAndTextures.length; i++) {
                indeciesToKeep.push(Math.floor(i * deltaIndex));
            }
            var textures = [];
            for (var i = 0; i < indeciesToKeep.length; i++) {
                var indexToKeep = indeciesToKeep[i];
                var dataUrl = this._sampledFrames[indexToKeep];
                if (dataUrl === undefined) {
                    // console.log("YYY", dataUrl, indexToKeep, this._sampledFrames.length);
                    debugger;
                }
                textures.push(this.BABYLON.Texture.CreateFromBase64String(dataUrl, 'mytex' + Math.random().toString(), this._game.scene));
                this._sampledFrames[indexToKeep] = null; // free for garbage collection
            }
            // let keepEvery = this._sampledFrames.length / (this._game.cameraPos.length - 1);
            // let currentIndex = 0.0;
            // while (currentIndex <= this._sampledFrames.length) {
            //     let indexToUse = Math.round(currentIndex);
            //     let dataUrl = this._sampledFrames[indexToUse];
            //     console.log("YYY", dataUrl, indexToUse, this._sampledFrames.length);
            //     textures.push(
            //         this.BABYLON.Texture.CreateFromBase64String(dataUrl, 'mytex' + Math.random().toString(), this._game.scene)
            //     );
            //     currentIndex = currentIndex + keepEvery;
            //     this._sampledFrames[indexToUse] = null;  // free for garbage collection
            // }
            // // debugger;
            // // get last one if missing (rounding error, so it varies...)
            // if (textures.length < this._game.cameraPos.length) {
            //     let dataUrl = this._sampledFrames[this._sampledFrames.length - 1];
            //     console.log("YYY2", dataUrl, "D", this._sampledFrames.length);
            //     textures.push(
            //         this.BABYLON.Texture.CreateFromBase64String(dataUrl, 'mytex' + Math.random().toString(), this._game.scene)
            //     );
            //     this._sampledFrames[this._sampledFrames.length - 1] = null;  // free for garbage collection
            // }
            // console.log(textures.length, this._game.cameraPos.length, "HEHEEHE");
            // Update list in game
            for (var i = 0; i < this._game.cameraPositionsAndTextures.length; i++) {
                var tex = textures[i];
                // let tex = new this.BABYLON.Texture("./.tmp/proteinvr_baked_texture34.png", this._game.scene);
                this._game.cameraPositionsAndTextures[i][1] = tex;
                // debugger;
                // textures[i] = null;  // Help with memory (garbage collection)
            }
            // free for garbage collection.
            this._sampledFrames = null;
            // textures = null;
            // Don't retain the video's objectURL
            URL.revokeObjectURL(this._video.src);
            // Fire the callback.
            this._callBack();
        };
        return ExtractFrames;
    }());
    exports.ExtractFrames = ExtractFrames;
});
// let ef = new extractFrames("proteinvr_baked.mp4", function() {
//     console.log("done");
// }); 
