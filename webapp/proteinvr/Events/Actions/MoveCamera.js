var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Countdowns", "./ActionParent", "../../CameraChar"], function (require, exports, Countdowns, ActionParent_1, CameraChar) {
    "use strict";
    var jQuery = PVRGlobals.jQuery;
    var MoveCamera = (function (_super) {
        __extends(MoveCamera, _super);
        function MoveCamera(params) {
            _super.call(this, params);
            this.ep = null;
        }
        /**
         * This function will move the camera from its current position to the destination. the camera will be oriented in
         * the direction indicated by the vector provided to the function.
         * @param direction :any The direction the camera should be facing when moved
         * @param startPoint :any The current location of camera
         * @param endPoint :any The location vector that the camera is to be moved to
         */
        MoveCamera.prototype.do = function (destination) {
            // console.log("Move Camera action initiated!");
            if (PVRGlobals.jumpRefractoryPeriod === true) {
                // If you're currently jumping, don't jump again.
                return;
            }
            if (destination) {
                // console.log("Destination: " + destination);
                this.ep = destination;
                // keep camera above ground
                this.ep.y += 0.5;
            }
            else {
                this.ep = this.parameters["endPoint"];
            }
            // Run the onStart callback.
            if (this.parameters.onStart !== undefined) {
                this.parameters.onStart();
            }
            var startVec = PVRGlobals.camera.position.clone();
            var diffVec = this.ep.subtract(startVec);
            Countdowns.addCountdown({
                name: "MoveCamera" + Math.random().toString(),
                countdownDurationMilliseconds: this.parameters["milliseconds"],
                countdownStartVal: 0.0,
                countdownEndVal: 1.0,
                afterCountdownAdvanced: function (val) {
                    var newCameraPos = this.extraVars.startVec.add(this.extraVars.diffVec.scale(val));
                    CameraChar.setPosition(newCameraPos);
                    // console.log(this.extraVars.startVec, this.extraVars.diffVec, newCameraPos, val);
                    // console.log(this.extraVars.startVec, this.extraVars.ep, newCameraPos, val, "MOO");
                    // let sp = camera.position;
                    // this.ep = this.parameters["endPoint"];
                    // console.log("Beginning movement in countdown");
                    // console.log("Val: " + val);
                    // camera.position.x = sp.x + ((this.ep.x-sp.x) * val);
                    // console.log("y coord before calc: " + camera.position.y);
                    // console.log("sp.y: " + sp.y);
                    // console.log("ep.y: " + this.ep.y);
                    // console.log("y calculation:");
                    // console.log("this.ep.y - sp.y = " + (this.ep.y-sp.y));
                    // console.log("That * val = " + (this.ep.y-sp.y)*val);
                    // camera.position.y = sp.y + ((this.ep.y-sp.y) * val);
                    // camera.position.z = sp.z + ((this.ep.z-sp.z) * val);
                    // console.log("Ending this iteration");
                    // console.log("Y coordinate: " + camera.position.y);
                    // camera.direction = this.parameters["direction"];
                },
                doneCallback: function () {
                    // console.log("Position before callback function: " +  PVRGlobals.camera.position);
                    CameraChar.setPosition(this.extraVars.startVec.add(this.extraVars.diffVec));
                    // console.log("Position after callback: " +  PVRGlobals.camera.position);
                    // this.camera.position = this.parameters["direction"];
                    if (this.extraVars.onEnd !== undefined) {
                        this.extraVars.onEnd();
                    }
                },
                extraVars: {
                    onEnd: this.parameters.onEnd,
                    diffVec: diffVec,
                    startVec: startVec,
                }
            });
        };
        return MoveCamera;
    }(ActionParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MoveCamera;
});
