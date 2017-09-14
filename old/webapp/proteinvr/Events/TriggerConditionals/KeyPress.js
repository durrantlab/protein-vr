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
define(["require", "exports", "./TriggerConditionalParent"], function (require, exports, TriggerConditionalParent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jQuery = PVRGlobals.jQuery;
    var KeyPress = (function (_super) {
        __extends(KeyPress, _super);
        function KeyPress(params) {
            var _this = 
            /**
             * This is the constructor.
             *
             * :param CheckInterface params: The expected parameters for this module
             */
            _super.call(this, params) || this;
            _this.canvasJQuery = undefined;
            //listen for keypress event
            var action = _this.parameters["action"];
            document.addEventListener(_this.parameters['event'], function listener(event) {
                // call action event
                action.do();
            });
            return _this;
        }
        KeyPress.prototype.checkIfTriggered = function () {
            /**
             * This method is effectively useless, only kept here because it is required to extend TriggerConditionalParent
             * This method should not be executed, all logic is contained in the constructor
             *
             * :returns: true
             * :rtype: :boolean:
             */
            console.log("Entered check function");
            return true;
        };
        return KeyPress;
    }(TriggerConditionalParent_1.default));
    exports.default = KeyPress;
});
