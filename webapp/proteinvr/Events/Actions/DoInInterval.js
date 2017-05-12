var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ActionParent"], function (require, exports, ActionParent_1) {
    "use strict";
    var FadeOutMesh = (function (_super) {
        __extends(FadeOutMesh, _super);
        /**
        A class for fading out a given mesh.
        */
        function FadeOutMesh(params) {
            /**
            The constructor. super(params) passes params to the parent class'
                constructor.
    
            :param DoInterface params: The parameters for this class. Use an
                               interface to make sure the correct
                               parameters are always used.
            */
            _super.call(this, params);
        }
        FadeOutMesh.prototype.do = function () {
            /**
            Perform the action: Fade out.
            */
            // Note: For complex geometries, this will likely cause problems.
            // See http://www.html5gamedevs.com/topic/25430-transparency-issues/
            var params = this.parameters;
            setInterval(function () {
                params.action.do();
            }, params.milliseconds);
        };
        return FadeOutMesh;
    }(ActionParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = FadeOutMesh;
});
