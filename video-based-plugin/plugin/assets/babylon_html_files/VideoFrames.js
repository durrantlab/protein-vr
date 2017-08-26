define(["require", "exports"], function (require, exports) {
    "use strict";
    exports.__esModule = true;
    var ExtractFrames = (function () {
        function ExtractFrames(videoUrl, BABYLON, babylonScene, callBack) {
            if (callBack === void 0) { callBack = function () { }; }
            this._lastCurrentTime = 0;
            // Create storage elements and variables
            this._video = document.createElement('video');
            this._canvas = document.createElement('canvas');
            this._sampledFrames = [];
            this._ctx = this._canvas.getContext('2d');
            this._callBack = callBack;
            this._babylonScene = babylonScene;
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
                this will save as a Blob, less memory consumptive than toDataURL
                a polyfill can be found at
                https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob#Polyfill
                */
                // Effort with blobs failed...
                // let saveFrame = this._saveFrame.bind(this);
                // this._canvas.toBlob(saveFrame, 'image/jpeg');  // Would be better, but I don't think babylon can handle this as well as a dataurl
                var dataUrl = this._canvas.toDataURL('image/jpeg', 1.0); // full quality needed?
                this._sampledFrames.push(dataUrl);
                // pro.innerHTML = ((this.currentTime / this.duration) * 100).toFixed(2) + ' %';
                // console.log(((this._video.currentTime / this._video.duration) * 100).toFixed(2) + ' %');
                this._lastCurrentTime = this._video.currentTime;
            }
            if (this._video.currentTime < this._video.duration) {
                this._video.play();
            }
        };
        // private _saveFrame(blob) {
        //     this._sampledFrames.push(blob);
        // }
        ExtractFrames.prototype._onend = function (e) {
            var img;
            // do whatever with the frames
            // keep only ever so few frames (to match framerate)
            var keepEvery = this._sampledFrames.length / (this._video.duration * 24.0);
            this._frames = [];
            var currentIndex = 0.0;
            while (currentIndex <= this._sampledFrames.length) {
                // let blob = this._sampledFrames[Math.round(currentIndex)];
                // let url = URL.createObjectURL(blob);
                // let tex = new window.BABYLON.Texture(url, this._babylonScene);
                var dataUrl = this._sampledFrames[currentIndex];
                console.log("dataURL:", dataUrl);
                var tex = this.BABYLON.Texture.CreateFromBase64String(dataUrl, 'mymap', this._babylonScene);
                // URL.revokeObjectURL(url); // don't keep the url
                this._frames.push(tex);
                currentIndex = currentIndex + keepEvery;
            }
            console.log(this._frames);
            // Don't retain the video's objectURL
            URL.revokeObjectURL(this._video.src);
            // Fire the callback.
            this._callBack();
        };
        ExtractFrames.prototype.getFrame = function (frameIndex) {
            var img = new Image();
            img.onload = function (e) { URL.revokeObjectURL(this.src); }; // don't save the URL
            img.src = URL.createObjectURL(this._frames[frameIndex]);
            document.body.appendChild(img);
        };
        return ExtractFrames;
    }());
    exports.ExtractFrames = ExtractFrames;
});
// let ef = new extractFrames("proteinvr_baked.mp4", function() {
//     console.log("done");
// }); 
