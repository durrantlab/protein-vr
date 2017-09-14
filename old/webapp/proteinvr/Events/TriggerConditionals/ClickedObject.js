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
define(["require", "exports", "./TriggerConditionalParent", "../../Core/MouseState"], function (require, exports, TriggerConditionalParent_1, MouseState) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var jQuery = PVRGlobals.jQuery;
    var ClickedObject = (function (_super) {
        __extends(ClickedObject, _super);
        function ClickedObject(params) {
            var _this = 
            /**
             * This is the constructor.
             *
             * :param CheckInterface params: The expected parameters for this module
             */
            _super.call(this, params) || this;
            _this.canvasJQuery = undefined;
            //assign parameters to variables because 'this' refers to the render canvas inside ananymous function
            var target = _this.parameters['triggerMesh'];
            var action = _this.parameters['action'];
            // There's a new click detection system. Use that here...
            MouseState.mouseClickDownFunctions.push(function (results) {
                if (results.mesh == target) {
                    console.log('mesh clicked!');
                    action.do(results.worldLoc);
                }
            });
            return _this;
        }
        /**
         * this method is not used because of the asynchronous nature of the triggerMesh
         *
         * In place of a boolean method, the action is triggered from an event listener within the constructor
         */
        ClickedObject.prototype.checkIfTriggered = function () {
            return true;
        };
        return ClickedObject;
    }(TriggerConditionalParent_1.default));
    exports.default = ClickedObject;
});
