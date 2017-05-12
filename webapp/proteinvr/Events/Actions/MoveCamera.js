var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Countdowns", "./ActionParent"], function (require, exports, Countdowns, ActionParent_1) {
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
         * @param camera :any The camera to be moved
         * @param direction :any The direction the camera should be facing when moved
         * @param startPoint :any The current location of camera
         * @param endPoint :any The location vector that the camera is to be moved to
         */
        MoveCamera.prototype.do = function (destination) {
            console.log("Move Camera action initiated!");
            if (destination) {
                console.log("Destination: " + destination);
                this.ep = destination;
                // keep camera above ground
                this.ep.y += 0.5;
                console.log("Updated destination: " + this.ep);
                console.log("For reference, sp = " + this.parameters["camera"].position);
            }
            else {
                this.ep = this.parameters["endPoint"];
            }
            Countdowns.addCountdown({
                name: "MoveCamera" + Math.random().toString(),
                countdownDurationMilliseconds: this.parameters["milliseconds"],
                countdownStartVal: 0.0,
                countdownEndVal: 1.0,
                afterCountdownAdvanced: function (val) {
                    var camera = this.parameters["camera"];
                    var sp = camera.position;
                    // this.ep = this.parameters["endPoint"];
                    console.log("Beginning movement in countdown");
                    console.log("Val: " + val);
                    camera.position.x = sp.x + ((this.ep.x - sp.x) * val);
                    console.log("y coord before calc: " + camera.position.y);
                    console.log("sp.y: " + sp.y);
                    console.log("ep.y: " + this.ep.y);
                    console.log("y calculation:");
                    console.log("this.ep.y - sp.y = " + (this.ep.y - sp.y));
                    console.log("That * val = " + (this.ep.y - sp.y) * val);
                    camera.position.y = sp.y + ((this.ep.y - sp.y) * val);
                    camera.position.z = sp.z + ((this.ep.z - sp.z) * val);
                    console.log("Ending this iteration");
                    console.log("Y coordinate: " + camera.position.y);
                    // camera.direction = this.parameters["direction"];
                }.bind(this),
                doneCallback: function () {
                    console.log("Position before callback function: " + this.parameters["camera"].position);
                    this.parameters["camera"].position = this.ep;
                    console.log("Position after callback: " + this.parameters["camera"].position);
                    // this.camera.position = this.parameters["direction"];
                }.bind(this)
            });
        };
        MoveCamera.prototype.setEndPoint = function (ep) {
            this.parameters['endPoint'] = ep;
        };
        return MoveCamera;
    }(ActionParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = MoveCamera;
});
