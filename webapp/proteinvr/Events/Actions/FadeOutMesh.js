var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Countdowns", "./ActionParent"], function (require, exports, Countdowns, ActionParent_1) {
    "use strict";
    var FadeOutMesh = (function (_super) {
        __extends(FadeOutMesh, _super);
        /**
        A class for fading out a given mesh.
        */
        function FadeOutMesh(params) {
            /**
            The constructor. super(params) passes params to the parent class'
                constructor.
    
            :param DoInterface params: The parameters for this class. Use an
                               interface to make sure the correct
                               parameters are always used.
            */
            _super.call(this, params);
        }
        FadeOutMesh.prototype.do = function () {
            /**
            Perform the action: Fade out.
            */
            // Note: For complex geometries, this will likely cause problems.
            // See http://www.html5gamedevs.com/topic/25430-transparency-issues/
            var params = this.parameters;
            params.mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;
            Countdowns.addCountdown({
                name: "FadeOut" + Math.random().toString(),
                countdownDurationMilliseconds: params.milliseconds,
                countdownStartVal: 1.0,
                countdownEndVal: 0.0,
                afterCountdownAdvanced: function (val) {
                    this.material.alpha = val;
                    // this.customShader.alpha = val;
                }.bind(params.mesh),
                doneCallback: function () {
                    this.material.alpha = 0;
                    // this.customShader.alpha = 0;
                    this.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                }.bind(params.mesh)
            });
        };
        return FadeOutMesh;
    }(ActionParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FadeOutMesh;
});
