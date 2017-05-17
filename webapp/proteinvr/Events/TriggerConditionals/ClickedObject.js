var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./TriggerConditionalParent", "../../Core/MouseState"], function (require, exports, TriggerConditionalParent_1, MouseState) {
    "use strict";
    var jQuery = PVRGlobals.jQuery;
    var ClickedObject = (function (_super) {
        __extends(ClickedObject, _super);
        function ClickedObject(params) {
            /**
             * This is the constructor.
             *
             * :param CheckInterface params: The expected parameters for this module
             */
            _super.call(this, params);
            this.canvasJQuery = undefined;
            //assign parameters to variables because 'this' refers to the render canvas inside ananymous function
            var target = this.parameters['triggerMesh'];
            var action = this.parameters['action'];
            // There's a new click detection system. Use that here...
            MouseState.mouseClickDownFunctions.push(function (results) {
                if (results.mesh == target) {
                    console.log('mesh clicked!');
                    action.do(results.worldLoc);
                }
            });
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
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ClickedObject;
});
