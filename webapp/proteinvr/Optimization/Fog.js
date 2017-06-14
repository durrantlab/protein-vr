///<reference path="../../js/Babylonjs/dist/babylon.2.5.d.ts" />
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
define(["require", "exports", "../Environment"], function (require, exports, Environment) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var mySceneOptimizationFog = (function (_super) {
        __extends(mySceneOptimizationFog, _super);
        function mySceneOptimizationFog() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.apply = function (scene) {
                switch (_this.priority) {
                    case 3:
                        // Fog far away
                        Environment.setFog(0.05);
                        // No need to render things beyond the fog.
                        PVRGlobals.scene.activeCamera.maxZ = 30; // nothing visible beyond 30 anyway.
                        break;
                    case 5:
                        // Not so far away.
                        Environment.setFog(0.1);
                        PVRGlobals.scene.activeCamera.maxZ = 15;
                        break;
                    case 6:
                        // Not so far away.
                        Environment.setFog(0.15);
                        PVRGlobals.scene.activeCamera.maxZ = 10;
                        break;
                    default:
                        alert("Error with fog priority value! It's " + _this.priority.toString());
                }
                return true;
            };
            return _this;
        }
        return mySceneOptimizationFog;
    }(BABYLON.SceneOptimization));
    exports.mySceneOptimizationFog = mySceneOptimizationFog;
    function allObjsReceiveFog() {
    }
    exports.default = mySceneOptimizationFog;
});
