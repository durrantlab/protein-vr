/* Create the viewer spheres. */
define(["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var sphere_materials;
    function setup() {
        /*
        Setup the viewer spheres. Position them at the correct locations, for
        example.
        */
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        // Get the template sphere
        let viewerSphereTemplate = Globals.get("viewerSphereTemplate");
        // Go through and clone the viewer sphere for each of the camera locations.
        let sphereMaterials = Globals.get("sphereMaterials"); // Contains materials with the PNG textures.
        let cameraPositions = Globals.get("cameraPositions");
        let cameraObj = Globals.get("camera");
        let viewerSpheres = [];
        for (let i = 0; i < sphereMaterials.length; i++) {
            // Clone the sphere for this specific PNG/materials
            let aViewerSphere = viewerSphereTemplate.clone("viewer_sphere" + i.toString());
            // Position that sphere at the associated camera location (in same order).
            aViewerSphere.position = cameraPositions[i];
            aViewerSphere.material = sphereMaterials[i].material;
            if (i === 0) {
                // First frame is initially visible.
                aViewerSphere.visibility = 1;
                // Camera starts at location of first frame.
                scene.activeCamera.position = aViewerSphere.position;
                cameraObj._prevCameraPos = aViewerSphere.position.clone();
                cameraObj._nextMovementVec = new BABYLON.Vector3(0, 0, 0);
                cameraObj._prevViewerSphere = aViewerSphere;
                cameraObj._nextViewerSphere = aViewerSphere;
            }
            else {
                // All other frames are invisible.
                aViewerSphere.visibility = 0;
            }
            // Add this viewersphere to the list.
            viewerSpheres.push(aViewerSphere);
        }
        // Save all viewer spheres as global variables.
        Globals.set("viewerSpheres", viewerSpheres);
        // Setup first steps forward
        cameraObj._onDoneCameraAutoMoving(scene.activeCamera);
        // Initial template also hidden. SHOULD THIS BE DELETED????
        viewerSphereTemplate.visibility = 0;
        // window.backgroundSphere = backgroundSphere;
        // window.viewerSphereTemplate = viewerSphereTemplate;
    }
    exports.setup = setup;
    function hideAll() {
        /*
        Hide all spheres. Helper function.
        */
        let viewerSpheres = Globals.get("viewerSpheres");
        for (let i = 0; i < viewerSpheres.length; i++) {
            let viewerSphere = viewerSpheres[i];
            viewerSphere.visibility = 0;
        }
    }
    exports.hideAll = hideAll;
});