var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "../Timers", "./ActionParent"], function (require, exports, Timers_1, ActionParent_1) {
    "use strict";
    // interface DoInterface {
    //     mesh: any;
    //     milliseconds: number;
    // }
    var ScreenWhite = (function (_super) {
        __extends(ScreenWhite, _super);
        function ScreenWhite(params) {
            _super.call(this, params);
            this.canvasJQuery = undefined;
        }
        ScreenWhite.prototype.do = function () {
            // Fog suddenly gets thicker.
            //this.scene().FOGMODE_EXP2;
            this.canvasJQuery = jQuery("#renderCanvas");
            Timers_1.default.addTimer({
                name: "ScreenWhite" + Math.random().toString(),
                durationInMiliseconds: 2000,
                interpValStart: 1.0,
                interpValEnd: 0.0,
                tickCallback: function (val) {
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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ScreenWhite;
});
