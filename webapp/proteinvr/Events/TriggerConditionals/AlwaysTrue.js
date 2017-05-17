var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./TriggerConditionalParent"], function (require, exports, TriggerConditionalParent_1) {
    "use strict";
    var AlwaysTrue = (function (_super) {
        __extends(AlwaysTrue, _super);
        /**
        A condition that is immediately true. Good for starting game triggers, for
        example.
        */
        function AlwaysTrue(params) {
            /**
            The class constructor. super() calls the parent class' constructor.
    
            :param any params:  Any required parameters. To make sure the
                       correct ones are supplied, use an interface.
            */
            _super.call(this, params);
        }
        AlwaysTrue.prototype.checkIfTriggered = function () {
            /**
            Check if the conditions of this trigger are satisfied.
    
            :param any params: General function parameters.
    
            :returns: true if the conditions are satisfied, false otherwise.
            :rtype: :any:`bool`
            */
            return true;
        };
        return AlwaysTrue;
    }(TriggerConditionalParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = AlwaysTrue;
});
