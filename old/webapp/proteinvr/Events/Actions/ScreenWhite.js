var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "../Countdowns", "./ActionParent"], function (require, exports, Countdowns, ActionParent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jQuery = PVRGlobals.jQuery;
    // interface DoInterface {
    //     mesh: any;
    //     milliseconds: number;
    // }
    var ScreenWhite = (function (_super) {
        __extends(ScreenWhite, _super);
        function ScreenWhite(params) {
            /**
            The constructor. super(params) passes params to the parent class'
                constructor.
    
            :param DoInterface params: The parameters for this class. Use an
                               interface to make sure the correct
                               parameters are always used.
            */
            var _this = _super.call(this, params) || this;
            /**
            A class to fade the screen to white.
            */
            /**
            A jQuery object, where the canvas where the scene is being rendered.
            */
            _this.canvasJQuery = undefined;
            return _this;
        }
        ScreenWhite.prototype.do = function () {
            /**
            Perform the action: Flash the screen white.
            */
            // Fog suddenly gets thicker.
            //this.scene().FOGMODE_EXP2;
            this.canvasJQuery = jQuery("#renderCanvas");
            Countdowns.addCountdown({
                name: "ScreenWhite" + Math.random().toString(),
                countdownDurationMilliseconds: 200,
                countdownStartVal: 1.0,
                countdownEndVal: 0.0,
                afterCountdownAdvanced: function (val) {
                    // this.material.alpha = val;
                    //this.customShader.alpha = val;
                    //this.scene().fogDensity = val;
                    this.canvasJQuery.css("opacity", val);
                }.bind(this),
                doneCallback: function () {
                    // this.material.alpha = 0;
                    //this.customShader.alpha = 0;
                    //this.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                    //this.scene().fogDensity = 10.0;
                    this.canvasJQuery.css("opacity", 1);
                }.bind(this)
            });
        };
        return ScreenWhite;
    }(ActionParent_1.default));
    exports.default = ScreenWhite;
});