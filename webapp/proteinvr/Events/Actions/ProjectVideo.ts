// projects a video onto in-world plane

import parent from "./ActionParent";
import * as CameraChar from "../../CameraChar";


declare var BABYLON;

interface videoParams{
    video: any; //either an html video element or a string array of video urls
    plane: any;
    material?: any;
}

class ProjectVideo extends parent{
    constructor(params: videoParams){
        super(params);
    }

    public do(){
        let video = new BABYLON.VideoTexture(
                "video", 
                this.parameters["video"],
                PVRGlobals.scene
            );
        
        if (this.parameters["material"]) {
            this.parameters["material"].diffuseTexture = video
            this.parameters["plane"].material = this.parameters["material"];
        }

        else{
            let material = new BABYLON.StandardMaterial("material", PVRGlobals.scene);
            material.backFaceCulling = false;
            material.diffuseTexture = video
            this.parameters["plane"].material = material;
        }

        this.parameters["plane"].actionManager = new BABYLON.ActionManager(PVRGlobals.scene);
        this.parameters["plane"].actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, function() {
                if (video.video.paused){
                    video.video.play();
                }
                else{
                    video.video.pause();
                }
            })
        );
    }
}