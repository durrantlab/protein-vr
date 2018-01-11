// Sets up the scene.

declare var BABYLON;

import * as UserVars from "../config/UserVars";
import * as Globals from "../config/Globals";
import { RenderingGroups } from "../config/Globals";
import { Material } from "../Spheres/Material";
import * as Arrows from "./Arrows";
import { setupAllSigns } from "./Sign";
import { TextureType } from "../Spheres/Material";

export function loadBabylonFile(): void {
    /*
    Loads and sets up the main scene.
    */

    var engine = Globals.get("engine");
    var scene = new BABYLON.Scene(engine);
    Globals.set("scene", scene);
    let uniqID = window.uniqID;

    BABYLON.SceneLoader.Append("", uniqID + ".babylon.babylon", scene, () => {

        window.scrollTo(0, 1);  // supposed to autohide scroll bar.

        // Wait for textures and materials to be ready
        scene.executeWhenReady(() => {
            // Make it so subsequent textures are stored in indexeddb. This is
            // hackish, but it works.
            scene.database = new BABYLON.Database(uniqID + '.babylon.babylon', function()  {});            

            // Delay textures until needed. Cool, but too slow for our
            // purposes here... Keep it commented out for now.
            // newScene.useDelayedTextureLoading = true

            // Setup viewer sphere template
            let radius = 12; // When using VR, this needs to be farther away that what it was rendered at. this._JSONData["viewerSphereSize"];
            _setupViewerSphereTemplate(scene, radius);
            
            // Set up environmental (skybox) sphere
            _setupEnvironmentalSphere(radius);

            // Setup arrows
            Arrows.setup();

            // Setup signs
            setupAllSigns();

            // window.debugit = scene.debugLayer;
            window.scene = scene;
            // scene.debugLayer.show();

            scene.clearColor = new BABYLON.Color3(0, 0, 0);

            // No built-in loading screen.
            BABYLON.SceneLoader.ShowLoadingScreen = false;
            
            if (Globals.get("debug")) { scene.debugLayer.show(); }

            // Add a sphere to the scene to mark where you're looking.
            // (advanced navigation system)
            // let destinationNeighborSphere = BABYLON.MeshBuilder.CreateSphere("destinationNeighborSphere", {diameter: 0.05}, scene);
            // var destinationNeighborSphereMaterial = new BABYLON.StandardMaterial("myMaterial", scene);
            // destinationNeighborSphereMaterial.diffuseColor = new BABYLON.Color3(1, 0, 1);
            // destinationNeighborSphereMaterial.specularColor = new BABYLON.Color3(1.0, 1.0, 1.0);  // Make it shiny.
            // destinationNeighborSphereMaterial.emissiveColor = new BABYLON.Color3(1, 0, 1);
            // destinationNeighborSphere.material = destinationNeighborSphereMaterial;
            // destinationNeighborSphere.renderingGroupId = RenderingGroups.VisibleObjects;
            // destinationNeighborSphere.isVisible = false;  // Make it initially invisible.
            // Globals.set("destinationNeighborSphere", destinationNeighborSphere);

            // Make the scene right handed.
            // scene.useRightHandedSystem = true;


            Globals.milestone("BabylonSceneLoaded", true);
        });
    });
}

export function getMeshThatContainsStr(str: string, scene: any): any {
    /*
    Gets the first mesh with a name that contains the given substring.

    :param string str: The substring.

    :param ??? scene: The BABYLON scene.

    :returns: The first mesh.
    :rtype: :class:`???`
    */

    // Identify viewer sphere template
    let theMesh;
    for (let t = 0; t < scene.meshes.length; t++) {
        if (scene.meshes[t].name.indexOf(str) !== -1) {
            theMesh = scene.meshes[t];
            break;
        }
    }
    return theMesh;
}

var ROTATE_SPHERES = -0.5 * Math.PI;
function _setupViewerSphereTemplate(scene: any, radius: number): void {
    /*
    Sets up the initial viewer sphere. This will be cloned for each valid
    camera location in the scene.

    :param ??? scene: The BABYLON scene.

    :param number radius: The size of the viewer sphere.
    */

    // Identify viewer sphere template
    let viewerSphereTemplate = getMeshThatContainsStr("ProteinVR_ViewerSphere", scene);
    viewerSphereTemplate.scaling = new BABYLON.Vector3(radius, radius, -radius);
    viewerSphereTemplate.isPickable = false;
    viewerSphereTemplate.renderingGroupId = RenderingGroups.ViewerSphere;
    viewerSphereTemplate.rotation.y = ROTATE_SPHERES; //4.908738521234052;  // To align export with scene. 281.25 degrees = 25/32*360
    Globals.set("viewerSphereTemplate", viewerSphereTemplate);
}

function _setupEnvironmentalSphere(radius): void {
    /*
    Sets up the environmental sphere (unchanging depending on position). Note
    that Alex's blender plugin uses a different nomenclature. You should
    standardize these names.

    :param number radius: The size of the environmenal sphere.
    */

    let viewerSphereTemplate = Globals.get("viewerSphereTemplate")
    let skyboxSphere = viewerSphereTemplate.clone("skyboxSphere");
    let slightlyBiggerRadius = radius * 1.05;
    skyboxSphere.scaling = new BABYLON.Vector3(slightlyBiggerRadius, slightlyBiggerRadius, -slightlyBiggerRadius);
    skyboxSphere.rotation.y = ROTATE_SPHERES; // 4.908738521234052;  // To align export with scene. 281.25 degrees = 25/32*360
    skyboxSphere.isPickable = false;
    skyboxSphere.renderingGroupId = RenderingGroups.EnvironmentalSphere;

    let sphereMaterial2 = new Material(true);
    sphereMaterial2.loadTexture(window.uniqID + '.skybox.png', () => {
        skyboxSphere.material = sphereMaterial2.material;
        Globals.set("skyboxSphere", skyboxSphere);
    }, TextureType.Full);
}

