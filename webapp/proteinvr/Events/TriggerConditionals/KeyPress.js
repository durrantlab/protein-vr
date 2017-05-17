var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./TriggerConditionalParent"], function (require, exports, TriggerConditionalParent_1) {
    "use strict";
    var jQuery = PVRGlobals.jQuery;
    var KeyPress = (function (_super) {
        __extends(KeyPress, _super);
        function KeyPress(params) {
            /**
             * This is the constructor.
             *
             * :param CheckInterface params: The expected parameters for this module
             */
            _super.call(this, params);
            this.canvasJQuery = undefined;
            //listen for keypress event
            var action = this.parameters["action"];
            document.addEventListener(this.parameters['event'], function listener(event) {
                // call action event
                action.do();
            });
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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = KeyPress;
});
