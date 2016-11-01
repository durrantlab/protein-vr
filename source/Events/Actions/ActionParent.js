define(["require", "exports", "../../Core/Core"], function (require, exports, Core_1) {
    "use strict";
    var ActionParent = (function () {
        function ActionParent(params) {
            this.parameters = params;
        }
        ActionParent.prototype.scene = function () {
            return Core_1.default.scene;
        };
        return ActionParent;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ActionParent;
});
