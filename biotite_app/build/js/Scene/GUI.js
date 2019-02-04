define(["require", "exports", "./Vars", "./VR/CommonCamera", "./VR/Vars"], function (require, exports, Vars, CommonCamera, VRVars) {
    "use strict";
    exports.__esModule = true;
    var visibilityInfo = {}; // The button states.
    var mainMenuVisible = false;
    var mainMenuAnchor;
    function setupGUI(data) {
        setupMainMenu(data);
        setupMainMenuToggleButton();
    }
    exports.setupGUI = setupGUI;
    function setupMainMenu(data) {
        // Set up the main menu
        var manager = new BABYLON.GUI.GUI3DManager(Vars.scene);
        var panel = new BABYLON.GUI.CylinderPanel();
        // var panel = new BABYLON.GUI.SpherePanel();
        panel.radius = 3;
        panel.margin = 0.1;
        manager.addControl(panel);
        panel.blockLayout = true;
        var _loop_1 = function (idx) {
            if (data["objIDs"].hasOwnProperty(idx)) {
                var objID_1 = data["objIDs"][idx];
                // let button = new BABYLON.GUI.Button3D("click me");
                var button = new BABYLON.GUI.HolographicButton("click me");
                panel.addControl(button);
                visibilityInfo[objID_1] = [button, true];
                button.onPointerClickObservable.add(function (e) {
                    var newVisVal = !visibilityInfo[objID_1][1];
                    visibilityInfo[objID_1][1] = newVisVal;
                    Vars.scene.getMeshByName(objID_1).isVisible = newVisVal;
                    updateMainMenuButtons();
                });
            }
        };
        for (var idx in data["objIDs"]) {
            _loop_1(idx);
        }
        panel.blockLayout = false;
        mainMenuAnchor = new BABYLON.TransformNode(""); // this can be a mesh, too
        var camera = Vars.scene.activeCamera;
        // mainMenuAnchor.position = Navigation.getCameraPosition();
        // mainMenuAnchor.rotation.y = camera.rotation.y + Math.PI * 0.5;
        panel.linkToTransformNode(mainMenuAnchor);
        updateMainMenuButtons();
    }
    function setupMainMenuToggleButton() {
        // Also set up a manager at your feet. This turns the main manager on and
        // off.
        var managerToggle = new BABYLON.GUI.GUI3DManager(Vars.scene);
        var panelToggle = new BABYLON.GUI.StackPanel3D();
        managerToggle.addControl(panelToggle);
        // Set up the button
        var buttonToggle = new BABYLON.GUI.HolographicButton("Toggle Menu");
        panelToggle.addControl(buttonToggle);
        var text = new BABYLON.GUI.TextBlock();
        text.text = "Show Menu";
        text.color = "white";
        text.resizeToFit = true;
        buttonToggle.content = text;
        // Make button clickable.
        var camera = Vars.scene.activeCamera;
        buttonToggle.onPointerClickObservable.add(function (e) {
            // Update main menu
            mainMenuVisible = !mainMenuVisible;
            updateMainMenuButtons();
            mainMenuAnchor.position.copyFrom(CommonCamera.getCameraPosition());
            mainMenuAnchor.rotation.y = camera.rotation.y + Math.PI * 0.5; // TODO: What about if VR camera?
            // Update floor button.
            text.text = mainMenuVisible ? "Hide Menu" : "Show Menu";
            buttonToggle.content.dispose();
            buttonToggle.content = text;
        });
        // Set up the button anchor and move/rotate it.
        var mainMenuAnchorToggle = new BABYLON.TransformNode(""); // this can be a mesh, too
        panelToggle.linkToTransformNode(mainMenuAnchorToggle);
        mainMenuAnchorToggle.rotation.x = Math.PI * 0.5;
        // Update button position with each turn of the render loop.
        var offset = -VRVars.vars.cameraHeight + 0.1;
        ;
        Vars.renderLoopFuncs.push(function () {
            mainMenuAnchorToggle.position.copyFrom(CommonCamera.getCameraPosition());
            mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + offset;
            mainMenuAnchorToggle.rotation.y = camera.rotation.y; // TODO: What about VR camera.
        });
    }
    function updateMainMenuButtons() {
        for (var objID in visibilityInfo) {
            if (visibilityInfo.hasOwnProperty(objID)) {
                var button = visibilityInfo[objID][0];
                var visibilityState = visibilityInfo[objID][1];
                var txtStr = objID.replace(/.sdf/g, "").replace(/.pdb/g, "");
                txtStr = txtStr.replace(/.wrl/g, "");
                txtStr = txtStr.replace(/_/g, "\n");
                txtStr += "\n(" + (visibilityState ? "Hide" : "Show") + ")";
                var text = new BABYLON.GUI.TextBlock();
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
});
