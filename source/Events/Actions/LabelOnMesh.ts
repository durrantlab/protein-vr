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

// use abstract mesh in billboard_mode along with dynamic texture
    public do(){
        let labelPlane = BABYLON.Mesh.CreatePlane("labelPlane", 5, super.scene(), false);
        labelPlane.billboardMode = BABYLON.AbstractMesh.BILLBOARDMODE_ALL;
        labelPlane.material = new BABYLON.StandardMaterial("labelPlane", super.scene());

        labelPlane.position = new BABYLON.Vector3(camera.camera.position.x+3, camera.camera.position.y, camera.camera.position.z+5);
        // labelPlane.position = this.parameters["mesh"].position;
        labelPlane.scaling.y = 0.4; 
        // something's not working here
        

        // create dynamic texture to hold text
        let labelPlaneTexture = new BABYLON.DynamicTexture("dynamic texture", 200, super.scene(), true);
        labelPlane.material.diffuseTexture = labelPlaneTexture;
        labelPlane.material.specularColor = new BABYLON.Color3(1,1,1);
        labelPlane.material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        labelPlane.material.backFaceCulling = false;
        labelPlaneTexture.drawText(this.parameters["label"], null, 120, "40px verdana", "white", null);

        setTimeout(function(){
            labelPlane.dispose();
        }, 1000);
    }

    // Trying something else: 2DCanvas

    // let canvas = new BABYLON.ScreenSpaceCanvas2D(super.scene(), {
    //     id: "ScreenCanvas",
    //     position: [0,0],
    //     size: new BABYLON.Size(300, 100),
    //     backgroundFill: "#4040408F",
    //     backgroundRoundRadius: 50,
    //     cachingStrategy: BABYLON.Canvas2D.CACHESTRATEGY_CANVAS,
    //     children: [
    //         new BABYLON.Text2D("Hello World!", {
    //             id: "text",
    //             marginAlignment: "h: center, v:center",
    //             fontName: "20pt Arial",
    //         })
    //     ]
    // });
    // console.log("did it work?");
    // console.log(canvas);
    //super.scene().render(canvas);
    // }
}


export default LabelOnMesh;