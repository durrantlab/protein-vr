import parent from "./ActionParent";
import Core from "../../Core/Core";
import camera from "../../CameraChar";
declare var BABYLON;
//provide a label for the mesh when triggered

interface LabelInterface{
    mesh :any;
    label :String;
}

class LabelOnMesh extends parent{
    constructor(params: LabelInterface){
        super(params);
    }

    // canvas = null;

// use abstract mesh in billboard_mode along with dynamic texture
    public do(jQuery?: any, pickResult?: any){
   
    console.log(pickResult.pickedPoint);

    let point = BABYLON.Vector3.Project(pickResult.pickedPoint, 
        BABYLON.Matrix.Identity(), 
        super.scene().getTransformMatrix(), 
        camera.camera.viewport.toGlobal(
            Core.engine.getRenderWidth(), 
            Core.engine.getRenderHeight()
        )
    );

// debugging code

    // console.log("Vector2 point?");
    // console.log(point);

    console.log("v2 point");
    console.log(point.x + ", " + (Core.engine.getRenderHeight() -  point.y));
    // console.log("camera part working?");
    // console.log(camera.camera.viewport);
    // console.log("Camera info");
    // console.log(camera.camera);

    // console.log("engine?");
    // console.log(Core.engine);


    // console.log("transform matrix working?");
    // console.log(super.scene().getTransformMatrix());

    // console.log("Identity working?");
    // console.log(BABYLON.Matrix.Identity());
// end debugging code
    let id = Math.random();
    let canvas = new BABYLON.ScreenSpaceCanvas2D(super.scene(), {
        id: id.toString(),
        // position: BABYLON.Vector3.Project(pickResult.pickedPoint, BABYLON.Matrix.Identity(), super.scene().getTransformMatrix(), camera.camera.viewport.toGlobal(Core.engine)),
        // position: new BABYLON.Vector2(500, 250),
        position: new BABYLON.Vector2(point.x, Core.engine.getRenderHeight() - point.y),
        size: new BABYLON.Size(300, 100),
        backgroundFill: "#4040408F",
        backgroundRoundRadius: 50,
        cachingStrategy: BABYLON.Canvas2D.CACHESTRATEGY_CANVAS,
        levelVisible: true,
        children: [
            new BABYLON.Text2D("Hello World!", {
                id: "text",
                marginAlignment: "h: center, v:center",
                fontName: "20pt Arial"
            })
        ]
    });
    // console.log("did it work?");
    // console.log(canvas);

    // console.log(canvas._id)
    // console.log("Is it visible?");
    // console.log(canvas.levelVisible);
    
    super.scene().render();


    // this.remove();
    console.log("Canvas created, another click should remove the canvas");
    jQuery('#renderCanvas').click(function(){
        canvas.levelVisible = false;
        // canvas.dispose(); 
        return;     
    });
    
    
    // ok so screenspace canvas works now :)
    // I think worldSpace canvas will work better, should rotate with screen and such

    // let worldCanvas = new BABYLON.WorldSpaceCanvas2D(super.scene(), new BABYLON.Size(50, 50) ,{
    //     id: "WorldCanvas",
    //     worldPosition: new BABYLON.Vector3(0,0,0),
    //     backgroundFill: "#4040408F",
    //     scaling: .25,
    //     children: [
    //         new BABYLON.Text2D("Hi there!", {
    //             id: "sample-text",
    //             marginAlignment: "h: center, v: center",
    //             fontName: "15pt Arial",
    //             scale: .25
    //             // areaSize: new BABYLON.Size(10, 10)
    //         })
    //     ]
    // });

    // super.scene().render(worldCanvas, true);

    }
    public erase(canvas: any) {
        console.log("entered remove")
        canvas.levelVisible = false;
    }
}


export default LabelOnMesh;