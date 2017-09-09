define(["require", "exports", "../config/Globals", "../shaders/StandardShader"], function (require, exports, Globals, StandardShader_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var shader;
    function setup() {
        // // Start rendering video texture
        let scene = Globals.get("scene");
        let BABYLON = Globals.get("BABYLON");
        let viewerSphere = scene.meshes[0];
        Globals.set("viewerSphere", viewerSphere); // Because sphere is only thing in scene.
        scene.activeCamera.position = viewerSphere.position;
        shader = new StandardShader_1.Shader(scene, BABYLON);
        viewerSphere.material = shader.material;
        viewerSphere.isPickable = false;
        viewerSphere.renderingGroupId = 2;
        // Resize the viewer sphere
        let radius = 12; // When using VR, this needs to be farther away that what it was rendered at. this._JSONData["viewerSphereSize"];
        viewerSphere.scaling = new BABYLON.Vector3(radius, radius, -radius);
        viewerSphere.rotation.y = 4.908738521234052; // To align export with scene. 281.25 degrees = 25/32*360
        // viewerSphere.scaling = new BABYLON.Vector3(radius, radius, radius);
        // viewerSphere.rotation.y = 1.0 * Math.PI;  // To align export with scene.
        // window.sphere = viewerSphere;
        // window.camera = Globals.get("camera");
    }
    exports.setup = setup;
    function update(newCameraData) {
        // Move sphere
        let viewerSphere = Globals.get("viewerSphere");
        viewerSphere.hide = true;
        viewerSphere.position = newCameraData.position;
        // Update texture
        shader.setTextures(newCameraData.texture); //, tex2, tex3, dist1, dist2, dist3);
        // this._viewerSphere.material.emissiveTexture = bestTexture;
    }
    exports.update = update;
});
