define(["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var shader;
    function setup() {
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        // Get the template sphere
        let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
        // Go through and clone the viewer sphere for each of the locations.
        let sphereShaders = Globals.get("sphereShaders");
        let viewerSpheres = []; //Globals.get("viewerSpheres");
        let cameraPositions = Globals.get("cameraPositions");
        let cameraObj = Globals.get("camera");
        for (let i = 0; i < sphereShaders.length; i++) {
            let aViewerSphere = viewerSphereTemplate.clone("viewer_sphere" + i.toString());
            aViewerSphere.position = cameraPositions[i];
            aViewerSphere.material = sphereShaders[i].material;
            if (i === 0) {
                aViewerSphere.visibility = 1;
                scene.activeCamera.position = aViewerSphere.position;
                cameraObj._prevCameraPos = aViewerSphere.position.clone();
                cameraObj._nextMovementVec = new BABYLON.Vector3(0, 0, 0);
                cameraObj._prevViewerSphere = aViewerSphere;
                cameraObj._nextViewerSphere = aViewerSphere;
            }
            else {
                aViewerSphere.visibility = 0;
            }
            viewerSpheres.push(aViewerSphere);
        }
        Globals.set("viewerSpheres", viewerSpheres);
        viewerSphereTemplate.visibility = 0;
        // window.backgroundSphere = backgroundSphere;
        window.viewerSphereTemplate = viewerSphereTemplate;
    }
    exports.setup = setup;
    function hideAll() {
        let viewerSpheres = Globals.get("viewerSpheres");
        for (let i = 0; i < viewerSpheres.length; i++) {
            let viewerSphere = viewerSpheres[i];
            viewerSphere.visibility = 0;
            // if (viewerSphere.uniqueId === newCameraData.associatedViewerSphere.uniqueId) {
            //     viewerSphere.visibility = 1;
            // } else {
            //     viewerSphere.visibility = 0;
            // }
        }
    }
    exports.hideAll = hideAll;
    function update(newCameraData) {
        // First, make sure only the new viewer sphere is visible.
        this.hideAll();
        newCameraData.associatedViewerSphere.visibility = 1;
        //     // Move sphere
        //     let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
        //     let backgroundSphere = Globals.get("backgroundSphere");
        //     viewerSphereTemplate.hide = true;
        //     viewerSphereTemplate.position = newCameraData.position;
        //     backgroundSphere.position = newCameraData.position;
        //     // console.log(newCameraData.texture);
        //     // Update texture
        //     // debugger;
        //     viewerSphereTemplate.material = newCameraData.texture.material;
        //     // shader.setTextures(newCameraData.texture); //, tex2, tex3, dist1, dist2, dist3);
        //     // this._viewerSphere.material.emissiveTexture = bestTexture;
    }
    exports.update = update;
});
