import * as Vars from "./Vars";
import * as CommonCamera from "./VR/CommonCamera";
import * as Navigation from "./VR/Navigation";
// import * as VR from "./VR";
import * as VRVars from "./VR/Vars";

declare var BABYLON;

let visibilityInfo = {};  // The button states.
let mainMenuVisible = false;
let mainMenuAnchor;

export function setupGUI(data) {
    setupMainMenu(data);
    setupMainMenuToggleButton();
}

function setupMainMenu(data) {
    // Set up the main menu
    let manager = new BABYLON.GUI.GUI3DManager(Vars.scene);

    let panel = new BABYLON.GUI.CylinderPanel();
    // var panel = new BABYLON.GUI.SpherePanel();
    panel.radius = 3;
    panel.margin = 0.1;

    manager.addControl(panel);
    panel.blockLayout = true;

    for (let idx in data["objIDs"]) {
        if (data["objIDs"].hasOwnProperty(idx)) {
            let objID = data["objIDs"][idx];

            // let button = new BABYLON.GUI.Button3D("click me");
            let button = new BABYLON.GUI.HolographicButton("click me");
            panel.addControl(button);

            visibilityInfo[objID] = [button, true];

            button.onPointerClickObservable.add((e) => {
                let newVisVal = !visibilityInfo[objID][1];
                visibilityInfo[objID][1] = newVisVal;
                Vars.scene.getMeshByName(objID).isVisible = newVisVal;
                updateMainMenuButtons();
            });
        }
    }
    panel.blockLayout = false;

    mainMenuAnchor = new BABYLON.TransformNode(""); // this can be a mesh, too
    let camera = Vars.scene.activeCamera;
    // mainMenuAnchor.position = Navigation.getCameraPosition();
    // mainMenuAnchor.rotation.y = camera.rotation.y + Math.PI * 0.5;
    panel.linkToTransformNode(mainMenuAnchor);

    updateMainMenuButtons();
}

function setupMainMenuToggleButton() {
    // Also set up a manager at your feet. This turns the main manager on and
    // off.
    let managerToggle = new BABYLON.GUI.GUI3DManager(Vars.scene);
    let panelToggle = new BABYLON.GUI.StackPanel3D();
    managerToggle.addControl(panelToggle);

    // Set up the button
    let buttonToggle = new BABYLON.GUI.HolographicButton("Toggle Menu");
    panelToggle.addControl(buttonToggle);
    let text = new BABYLON.GUI.TextBlock();
    text.text = "Show Menu";
    text.color = "white";
    text.resizeToFit = true;
    buttonToggle.content = text;

    // Make button clickable.
    let camera = Vars.scene.activeCamera;
    buttonToggle.onPointerClickObservable.add((e) => {
        // Update main menu
        mainMenuVisible = !mainMenuVisible;
        updateMainMenuButtons();
        mainMenuAnchor.position.copyFrom(CommonCamera.getCameraPosition());
        mainMenuAnchor.rotation.y = camera.rotation.y + Math.PI * 0.5;  // TODO: What about if VR camera?

        // Update floor button.
        text.text = mainMenuVisible ? "Hide Menu" : "Show Menu";
        buttonToggle.content.dispose();
        buttonToggle.content = text;
    });

    // Set up the button anchor and move/rotate it.
    let mainMenuAnchorToggle = new BABYLON.TransformNode(""); // this can be a mesh, too
    panelToggle.linkToTransformNode(mainMenuAnchorToggle);
    mainMenuAnchorToggle.rotation.x = Math.PI * 0.5;

    // Update button position with each turn of the render loop.
    let offset = -VRVars.vars.cameraHeight + 0.1; ;
    Vars.renderLoopFuncs.push(() => {
        mainMenuAnchorToggle.position.copyFrom(CommonCamera.getCameraPosition());
        mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + offset;
        mainMenuAnchorToggle.rotation.y = camera.rotation.y;  // TODO: What about VR camera.
    });
}

function updateMainMenuButtons() {
    for (let objID in visibilityInfo) {
        if (visibilityInfo.hasOwnProperty(objID)) {
            let button = visibilityInfo[objID][0];
            let visibilityState = visibilityInfo[objID][1];

            let txtStr = objID.replace(/.sdf/g, "").replace(/.pdb/g, "");
            txtStr = txtStr.replace(/.wrl/g, "");
            txtStr = txtStr.replace(/_/g, "\n");
            txtStr += "\n(" + (visibilityState ? "Hide" : "Show") + ")";

            let text = new BABYLON.GUI.TextBlock();
            text.text = txtStr;
            text.color = "white";
            // text.fontSize = 24;
            text.resizeToFit = true;
            button.content.dispose();
            button.content = text;

            button.isVisible = mainMenuVisible;
        }
    }
}
