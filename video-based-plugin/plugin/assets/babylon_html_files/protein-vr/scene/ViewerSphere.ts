import * as Globals from "../config/Globals";
import { Shader } from "../shaders/StandardShader";
import { RenderingGroups } from "../config/Globals";

var shader;

export function setup() {
    // // Start rendering video texture
    let scene = Globals.get("scene");
    let BABYLON = Globals.get("BABYLON");
    let viewerSphere = scene.meshes[0];  // Because sphere is only thing in scene.
    Globals.set("viewerSphere", viewerSphere);
    scene.activeCamera.position = viewerSphere.position;
    
    // Set the material
    // shader = new Shader(true);
    // shader.material.alpha = 0.1;
    // shader.material.hasAlpha = true;  // on texture, not material
    // shader.material.linkEmissiveWithDiffuse = true;
    // viewerSphere.material = shader.material;
    viewerSphere.isPickable = false;
    viewerSphere.renderingGroupId = RenderingGroups.ViewerSphere;
    // console.log(Globals.get("cameraPositionsAndTextures"))

    // Resize the viewer sphere
    let radius = 12; // When using VR, this needs to be farther away that what it was rendered at. this._JSONData["viewerSphereSize"];
    viewerSphere.scaling = new BABYLON.Vector3(radius, radius, -radius);
    viewerSphere.rotation.y = 4.908738521234052;  // To align export with scene. 281.25 degrees = 25/32*360
    // viewerSphere.scaling = new BABYLON.Vector3(radius, radius, radius);
    // viewerSphere.rotation.y = 1.0 * Math.PI;  // To align export with scene.
    // window.sphere = viewerSphere;
    // window.camera = Globals.get("camera");

    // viewerSphere.visibility = 0;

    // Now make the background sphere
    let backgroundSphere = viewerSphere.clone("backgroundSphere");
    let slightlyBiggerRadius = radius * 1.05;
    backgroundSphere.scaling = new BABYLON.Vector3(slightlyBiggerRadius, slightlyBiggerRadius, -slightlyBiggerRadius);
    backgroundSphere.rotation.y = 4.908738521234052;  // To align export with scene. 281.25 degrees = 25/32*360
    backgroundSphere.isPickable = false;
    backgroundSphere.renderingGroupId = RenderingGroups.EnvironmentalSphere;
    
    // Set the background sphere's appreance
    // debugger;
    let shader2 = new Shader('environment.png', false);
    backgroundSphere.material = shader2.material;
    // backgroundSphere.material = shader2.material;
    // let tex = new BABYLON.Texture("environment.png", scene);
    // shader2.setTextures(tex);
    // console.log(backgroundSphere);
    Globals.set("backgroundSphere", backgroundSphere);
    // backgroundSphere.parent = viewerSphere;
    
    window.backgroundSphere =backgroundSphere;
    window.viewerSphere =backgroundSphere;
}

export function update(newCameraData) {
    // Move sphere
    let viewerSphere = Globals.get("viewerSphere");
    let backgroundSphere = Globals.get("backgroundSphere");
    viewerSphere.hide = true;
    viewerSphere.position = newCameraData.position;
    backgroundSphere.position = newCameraData.position;

    // console.log(newCameraData.texture);

    // Update texture
    // debugger;
    viewerSphere.material = newCameraData.texture.material;
    // shader.setTextures(newCameraData.texture); //, tex2, tex3, dist1, dist2, dist3);
    // this._viewerSphere.material.emissiveTexture = bestTexture;

}