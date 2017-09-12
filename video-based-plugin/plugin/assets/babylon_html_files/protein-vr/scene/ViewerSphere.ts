import * as Globals from "../config/Globals";
import { Shader } from "../shaders/StandardShader";
import { RenderingGroups } from "../config/Globals";

var shader;

export function setup() {
    let scene = Globals.get("scene");
    let BABYLON = Globals.get("BABYLON");

    // Get the template sphere
    let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
    
    // Go through and clone the viewer sphere for each of the locations.
    let sphereShaders = Globals.get("sphereShaders");
    let viewerSpheres = [];
    let cameraPositions = Globals.get("cameraPositions");
    let cameraObj = Globals.get("camera");
    for (let i = 0; i < sphereShaders.length; i++) {
        let aViewerSphere = viewerSphereTemplate.clone("viewer_sphere" +i.toString());
        aViewerSphere.position = cameraPositions[i];
        aViewerSphere.material = sphereShaders[i].material;
        
        if (i === 0) {  // first frame
            aViewerSphere.visibility = 1;
            scene.activeCamera.position = aViewerSphere.position;
            cameraObj._prevCameraPos = aViewerSphere.position.clone();
            cameraObj._nextMovementVec = new BABYLON.Vector3(0,0,0);
            cameraObj._prevViewerSphere = aViewerSphere;
            cameraObj._nextViewerSphere = aViewerSphere;
        } else {
            aViewerSphere.visibility = 0;
        }
        viewerSpheres.push(aViewerSphere);
    }
    Globals.set("viewerSpheres", viewerSpheres);

    // Setup first steps forward
    cameraObj._onDoneCameraAutoMoving(scene.activeCamera);
                
    viewerSphereTemplate.visibility = 0;
    
    // window.backgroundSphere = backgroundSphere;
    // window.viewerSphereTemplate = viewerSphereTemplate;
}

export function hideAll() {
    let viewerSpheres = Globals.get("viewerSpheres");
    for (let i = 0; i < viewerSpheres.length; i++) {
        let viewerSphere = viewerSpheres[i];
        viewerSphere.visibility = 0;
    }
}
