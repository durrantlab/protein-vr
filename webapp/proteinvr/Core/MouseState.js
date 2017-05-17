define(["require", "exports"], function (require, exports) {
    "use strict";
    var jQuery = PVRGlobals.jQuery;
    // A list of functions to call on mouse click. In each case
    // THIS will be passed as a parameter.
    // export namespace MouseState {
    // I think this is bad form to use a namespace this way...
    exports.mouseClickDownFunctions = [];
    exports.mouseClickUpFunctions = [];
    exports.mouseDown = false;
    function setup() {
        PVRGlobals.scene.onPointerDown = function (evt, pickResult) {
            exports.mouseDown = true;
            //meshUnder = pickResult.pickedMesh;
            //console.log(pickResult);
            var clickInfo = {
                screenLoc: new BABYLON.Vector2(PVRGlobals.scene.pointerX, PVRGlobals.scene.pointerY),
                worldLoc: pickResult.pickedPoint,
                distance: pickResult.distance,
                mesh: pickResult.pickedMesh,
                normal: pickResult.getNormal()
            };
            console.log(clickInfo);
            for (var i = 0; i < exports.mouseClickDownFunctions.length; i++) {
                var func = exports.mouseClickDownFunctions[i];
                func(clickInfo);
            }
        };
        PVRGlobals.scene.onPointerUp = function (evt, pickResult) {
            exports.mouseDown = false;
            for (var i = 0; i < exports.mouseClickUpFunctions.length; i++) {
                var func = exports.mouseClickUpFunctions[i];
                func();
            }
        };
        // jQuery('#renderCanvas').click(function(){
        //     mouseDown = true;
        //     let pickResult = PVRGlobals.scene.pick(PVRGlobals.scene.pointerX, PVRGlobals.scene.pointerY);
        //     console.log(response);
        //     if(pickResult.hit) {
        //         console.log(pickResult.pickedMesh);
        //         console.log(pickResult.pickedPoint);
        //     }
        // });
    }
    exports.setup = setup;
});
// }
// export default MouseState 
