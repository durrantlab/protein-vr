var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./TriggerConditionalParent"], function (require, exports, TriggerConditionalParent_1) {
    "use strict";
    // declare var jQuery;
    var GameStart = (function (_super) {
        __extends(GameStart, _super);
        function GameStart(params, jQuery) {
            _super.call(this, params);
            this.canvasJQuery = undefined;
            this.$ = undefined;
        }
        GameStart.prototype.check = function () {
            /**
             * useless method, required to extend parent class
             */
            return true;
        };
        GameStart.prototype.asyncSetup = function () {
            /**
             * This method sets up the asycnronous function to be called in event.ts
             *
             * :returns: An object containing the 'listener' target and the event to be listened for.
             * :rtype: :any: `object`
             */
            return {
                "target": "document",
                "event": "ready"
            };
        };
        return GameStart;
    }(TriggerConditionalParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = GameStart;
});
