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
    /**
     * A class to fade the screen to white.
     */
    var ScreenWhite = (function (_super) {
        __extends(ScreenWhite, _super);
        /**
         * The constructor.  super(params) passes params to the parent class'
         *     constructor.
         * @param  {DoInterface} params The parameters for this class. Use an
         *                              interface to make sure the correct
         *                              parameters are always used.
         */
        function ScreenWhite(params) {
            _super.call(this, params);
            /**
             * A jQuery object, where the canvas where the scene is being rendered.
             */
            this.canvasJQuery = undefined;
        }
        /**
         * Perform the action.
         */
        ScreenWhite.prototype.do = function () {
            // Fog suddenly gets thicker.
            //this.scene().FOGMODE_EXP2;
            this.canvasJQuery = jQuery("#renderCanvas");
            Timers_1.default.addTimer({
                name: "ScreenWhite" + Math.random().toString(),
                durationInMiliseconds: 200,
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
