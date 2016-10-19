define(["require", "exports", "./Timers"], function (require, exports, Timers_1) {
    "use strict";
    var BuiltInActions;
    (function (BuiltInActions) {
        function fadeOutMesh(mesh, milliseconds) {
            // Note: For complex geometries, this will likely cause problems.
            // See http://www.html5gamedevs.com/topic/25430-transparency-issues/
            if (milliseconds === void 0) { milliseconds = 2000; }
            mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;
            Timers_1.default.addTimer({
                name: "FadeOut" + Math.random().toString(),
                durationInMiliseconds: milliseconds,
                interpValStart: 1.0,
                interpValEnd: 0.0,
                tickCallback: function (val) {
                    this.material.alpha = val;
                }.bind(mesh),
                doneCallback: function () {
                    this.material.alpha = 0;
                    mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                }.bind(mesh)
            });
        }
        BuiltInActions.fadeOutMesh = fadeOutMesh;
        function fadeInMesh(mesh, milliseconds) {
            // Note: For complex geometries, this will likely cause problems.
            // See http://www.html5gamedevs.com/topic/25430-transparency-issues/
            if (milliseconds === void 0) { milliseconds = 2000; }
            mesh.material.alphaMode = BABYLON.Engine.ALPHA_ADD;
            Timers_1.default.addTimer({
                name: "FadeIn" + Math.random().toString(),
                durationInMiliseconds: milliseconds,
                tickCallback: function (val) {
                    this.material.alpha = val;
                    console.log(val);
                }.bind(mesh),
                doneCallback: function () {
                    this.material.alpha = 1.0;
                    mesh.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                }.bind(mesh)
            });
        }
        BuiltInActions.fadeInMesh = fadeInMesh;
    })(BuiltInActions || (BuiltInActions = {}));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = BuiltInActions;
});
