import * as Core from "./Core";

declare var PVRGlobals;
var jQuery = PVRGlobals.jQuery;

// A list of functions to call on mouse click. In each case
// THIS will be passed as a parameter.

// export namespace MouseState {
// I think this is bad form to use a namespace this way...

export var mouseClickDownFunctions = [];
export var mouseClickUpFunctions = [];
export var mouseDown: boolean = false;

interface mouseDownVarInterface {
    screenLoc: BABYLON.Vector2;
    worldLoc: BABYLON.Vector3;
    distance: number;
    mesh: BABYLON.Mesh;
}

export function setup() {
    PVRGlobals.scene.onPointerDown = function (evt, pickResult) {
        mouseDown = true;
        //meshUnder = pickResult.pickedMesh;
        //console.log(pickResult);

        let clickInfo: mouseDownVarInterface = {
            screenLoc: new BABYLON.Vector2(PVRGlobals.scene.pointerX, PVRGlobals.scene.pointerY),
            worldLoc: pickResult.pickedPoint,
            distance: pickResult.distance,
            mesh: pickResult.pickedMesh
        }

        console.log(clickInfo);

        for (let i = 0; i < mouseClickDownFunctions.length; i++) {
            let func = mouseClickDownFunctions[i];
            func(clickInfo);
        }

    };

    PVRGlobals.scene.onPointerUp = function (evt, pickResult) {
        mouseDown = false;

        for (let i = 0; i < mouseClickUpFunctions.length; i++) {
            let func = mouseClickUpFunctions[i];
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
// }

// export default MouseState