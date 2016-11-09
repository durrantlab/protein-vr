define(["require", "exports", "../../Core/Core"], function (require, exports, Core_1) {
    "use strict";
    /**
     * The class that all other actions inherit.
     */
    var ActionParent = (function () {
        /**
         * The class constructor.
         * @param  {any}    params Any required parameters.
         */
        function ActionParent(params) {
            this.parameters = params;
        }
        /**
         * A function that returns the current BABYLON scene. Here for
         *     convenience.
         * @return {any} The BABYLON scene.
         */
        ActionParent.prototype.scene = function () {
            return Core_1.default.scene;
        };
        return ActionParent;
    }());
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ActionParent;
});
