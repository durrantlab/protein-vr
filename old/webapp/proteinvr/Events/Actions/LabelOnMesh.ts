import parent from "./ActionParent";
import * as Core from "../../Core/Core";
import * as CameraChar from "../../CameraChar";
import * as UserVars from "../../Settings/UserVars";

declare var BABYLON;
declare var PVRGlobals;

var jQuery = PVRGlobals.jQuery;

interface LabelInterface{
    label: String;
}

class LabelOnMesh extends parent {
    /**
     * This class will make a label for a mesh with a Canvas2D element.
     * The label will appear near where the mesh is clicked and will disappear when
     * a click is registered anywhere else in the screen. Clicking the mesh a second time will
     * remove the label, but will also create a new label in the location of the second (or 3rd, 4th, etc.)
     * click. The mesh to label must be determined by the trigger, not this action. Currently only works
     * with the ClickedObject trigger, but other triggers could be created and incorporated for VR use.
     */
    
    constructor(params: LabelInterface){
    /**
     * The constructor for this action.
     * :param LabelInterface params: The expected parameters for this object
     */
        super(params);
    }

    public pt: BABYLON.Vector3 = new BABYLON.Vector3(0, 0, 0);

    public do(pt?: BABYLON.Vector3) { //jQuery?: any, pickResult?: any) {
        /**
         * Create the label.
         * :param any: jQuery
         * :param any: pickResult. The location (currently from the pick() babylon funtion) for the label
         */

        // Any action that uses this must specify this.pt before using this function.
   
        let point = BABYLON.Vector3.Project(pt,
            BABYLON.Matrix.Identity(), 
            PVRGlobals.scene.getTransformMatrix(), 
            PVRGlobals.camera.camera.viewport.toGlobal(
                PVRGlobals.engine.getRenderWidth(), 
                PVRGlobals.engine.getRenderHeight()
            )
        );

        // #### debugging code ####

        // console.log("Vector2 point?");
        // console.log(point);

        console.log("v2 point");
        console.log(point.x + ", " + (PVRGlobals.engine.getRenderHeight() -  point.y));
        // console.log("camera part working?");
        // console.log(camera.camera.viewport);
        // console.log("Camera info");
        // console.log(camera.camera);

        // console.log("engine?");
        // console.log(PVRGlobals.engine);


        // console.log("transform matrix working?");
        // console.log(super.scene().getTransformMatrix());

        // console.log("Identity working?");
        // console.log(BABYLON.Matrix.Identity());
        // #### end debugging code ####
        
        // give a random id so a new label appears/disappears with each click
        let id = Math.random();
        let canvas = new BABYLON.ScreenSpaceCanvas2D(PVRGlobals.scene, {
            id: id.toString(),
            position: new BABYLON.Vector2(point.x, PVRGlobals.engine.getRenderHeight() - point.y),
            size: new BABYLON.Size(300, 100),
            backgroundFill: "#4040408F",
            backgroundRoundRadius: 50,
            cachingStrategy: BABYLON.Canvas2D.CACHESTRATEGY_CANVAS,
            levelVisible: true,
            children: [
                new BABYLON.Text2D(this.parameters['label'], {
                    id: "text",
                    marginAlignment: "h: center, v:center",
                    fontName: "20pt Arial"
                })
            ]
        });

        PVRGlobals.scene.render();

        // console.log("Retrieving device in use from sys vars");
        // console.log(UserVars.getViewer());
    
        console.log("Canvas created, another click should remove the canvas");
        jQuery('#renderCanvas').click(function(){
            canvas.levelVisible = false;
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
    }
}


export default LabelOnMesh;