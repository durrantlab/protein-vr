define(["require", "exports", "./Vars"], function (require, exports, Vars) {
    "use strict";
    exports.__esModule = true;
    function setup() {
        var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), Vars.scene);
        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), Vars.scene);
    }
    exports.setup = setup;
});
