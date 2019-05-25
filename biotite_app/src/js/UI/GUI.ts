import * as CommonCamera from "../Cameras/CommonCamera";
import * as Pickables from "../Navigation/Pickables";
import * as VRPoints from "../Navigation/Points";
import * as VRVoiceCommands from "../Navigation/VoiceCommands";
import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars";

declare var BABYLON;

// let visibilityInfo = {};  // The button states.
let allButtons = [];
// let mainMenuVisible = false;
let mainMenuGUI3DManager;
let mainMenuAnchor;
let clickSound: any;
let cylinderPanelMainMenu: any;

/**
 * Load the 3D GUI.
 * @param  {Object<string,*>} data The data from scene_info.json.
 * @returns void
 */
export function setup(data): void {
    setupMainMenu(data);
    setupMainMenuToggleButton();

    clickSound = new BABYLON.Sound(
        "click-button", "assets/staple-public-domain.mp3",
        Vars.scene, null,
        { loop: false, autoplay: false, spatialSound: true, volume: 0.1 },
    );
}

/**
 * Setup the main menu.
 * @param  {Object<string,*>} data The data from scene_info.json.
 * @returns void
 */
function setupMainMenu(data): void {
    // Get the descriptions
    VRVoiceCommands.setMoleculeNameInfos(data);

    // Set up the main menu TODO: Can you use just one GUI3DManage, with
    // multiple panels? If so, redundancy here.
    mainMenuGUI3DManager = new BABYLON.GUI.GUI3DManager(Vars.scene);

    cylinderPanelMainMenu = new BABYLON.GUI.CylinderPanel();
    // var cylinderPanelMainMenu = new BABYLON.GUI.SpherePanel();
    mainMenuGUI3DManager.addControl(cylinderPanelMainMenu);
    cylinderPanelMainMenu.blockLayout = true;

    for (let key in VRVoiceCommands.moleculeNameInfos) {
        if (VRVoiceCommands.moleculeNameInfos.hasOwnProperty(key)) {
            let inf = VRVoiceCommands.moleculeNameInfos[key];
            let desc = inf.description;

            allButtons.push(
                new ButtonWrapper({
                    clickFunc: (buttonWrapper) => {
                        VRVoiceCommands.showOrHideModel(
                            inf.modelName,
                            inf.representation,
                            !buttonWrapper.value,
                        );

                        // For reasons I don't understand, the radius on this
                        // cylinder (set below) doesn't take. Put it here to
                        // too make sure.
                        // cylinderPanelMainMenu.radius = Vars.MENU_RADIUS;
                        // cylinderPanelMainMenu.margin = Vars.MENU_MARGIN;
                    },
                    default: false,
                    falseTxt: desc + "\n(Hide)",
                    initFunc: (buttonWrapper) => {
                        buttonWrapper.isVisible(false);  // Buttons start off hidden.
                    },
                    name: "menu-visible-button-" + inf.modelName.replace(/ /g, "").replace(/\n/g, ""),
                    panel: cylinderPanelMainMenu,
                    trueTxt: desc + "\n(Show)",
                }),
            );
            // window.but = but;
        }
    }
    nonVisibiliyButtons(cylinderPanelMainMenu, data);

    cylinderPanelMainMenu.blockLayout = false;

    mainMenuAnchor = new BABYLON.TransformNode(""); // this can be a mesh, too
    cylinderPanelMainMenu.linkToTransformNode(mainMenuAnchor);

    // Set radius and such.
    setInterval(() => {
        cylinderPanelMainMenu.radius = Vars.MENU_RADIUS;
        cylinderPanelMainMenu.margin = Vars.MENU_MARGIN;
    }, 1000);
    window["cylinderPanelMainMenu"] = cylinderPanelMainMenu;
}

/**
 * Sets up some additional buttons (like audio, tactile feedback, etc).
 * @param  {*}                panel  The panel to add the buttons to.
 * @param  {Object<string,*>} data   The data from scene_info.json.
 * @returns void
 */
function nonVisibiliyButtons(panel: any, data: any): void {
    // Turn on speech synthesis.
    allButtons.push(
        new ButtonWrapper({
            clickFunc: (buttonWrapper) => {
                // TODO:
                if (buttonWrapper.value) {
                    VRVoiceCommands.setup(data);
                } else {
                    VRVoiceCommands.stopVoiceCommands();
                }
            },
            default: false,
            falseTxt: "Audio Commands\n(On)",
            initFunc: (buttonWrapper) => {
                buttonWrapper.isVisible(false);  // No audio to begin.
            },
            name: "menu-audio-commands-button",
            panel,
            trueTxt: "Audio Commands\n(Off)",
        }),
    );
}

/**
 * Setup the toggle button on the floor that turns the main menu on and off.
 * @returns void
 */
function setupMainMenuToggleButton(): void {
    // Also set up a manager at your feet. This turns the main manager on and
    // off.
    let managerToggle = new BABYLON.GUI.GUI3DManager(Vars.scene);
    let panelToggle = new BABYLON.GUI.StackPanel3D();
    managerToggle.addControl(panelToggle);

    // Set up the button
    let camera = Vars.scene.activeCamera;
    let menuVisibleButton = new ButtonWrapper({
        clickFunc: (buttonWrapper) => {
            // Update main-menu button visibility
            // mainMenuGUI3DManager.isVisible = ! mainMenuGUI3DManager.isVisible; *****
            for (let i in allButtons) {
                if (allButtons.hasOwnProperty(i)) {
                    let iInt = parseInt(i, 10);
                    allButtons[iInt].isVisible(buttonWrapper.value);
                }
            }

            // mainMenuVisible = !mainMenuVisible;
            mainMenuAnchor.position.copyFrom(CommonCamera.getCameraPosition());
            mainMenuAnchor.rotation.y = CommonCamera.getCameraRotationY(); //  + Math.PI * 0.5;
            // camera.rotation.y + Math.PI * 0.5;  // TODO: What about if VR camera?
        },
        default: false,
        falseTxt: "Show Menu",
        name: "menu-visible-button",
        panel: panelToggle,
        trueTxt: "Hide Menu",
    });

    // Set up the button anchor and move/rotate it.
    let mainMenuAnchorToggle = new BABYLON.TransformNode(""); // this can be a mesh, too
    panelToggle.linkToTransformNode(mainMenuAnchorToggle);
    mainMenuAnchorToggle.rotation.x = Math.PI * 0.5;

    // Update button position with each turn of the render loop.
    // let offset = -VRVars.vars.cameraHeight + 0.1; ;
    Vars.scene.registerBeforeRender(() => {
        mainMenuAnchorToggle.position.copyFrom(VRPoints.groundPointBelowCamera);
        mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + 0.1;
        mainMenuAnchorToggle.rotation.y = CommonCamera.getCameraRotationY();
        // camera.rotation.y;  // TODO: What about VR camera.

        // console.log(new Date().getTime(), Vars.scene.activeCamera.id, Vars.scene.activeCamera);
        // console.log(Vars.vrHelper.currentVRCamera.id, Vars.vrHelper.currentVRCamera);
        // console.log(Vars.vrHelper.currentVRCamera.rotation, Vars.vrHelper.currentVRCamera.rotationQuaternion);
    });
}

// function updateMainMenuButtons() {
//     for (let objID in visibilityInfo) {
//         if (visibilityInfo.hasOwnProperty(objID)) {
//             let button = visibilityInfo[objID][0];
//             let visibilityState = visibilityInfo[objID][1];

//             let txtStr = objID.replace(/.sdf/g, "").replace(/.pdb/g, "");
//             txtStr = txtStr.replace(/.wrl/g, "");
//             txtStr = txtStr.replace(/_/g, "\n");
//             txtStr += "\n(" + (visibilityState ? "Hide" : "Show") + ")";

//             let text = new BABYLON.GUI.TextBlock();
//             text.text = txtStr;
//             text.color = "white";
//             // text.fontSize = 24;
//             text.resizeToFit = true;
//             button.content.dispose();
//             button.content = text;

//             button.isVisible = mainMenuVisible;
//         }
//     }
// }

interface IButtonWrapper {
    panel: any;
    trueTxt: string;
    falseTxt: string;
    default: boolean;
    name: string;
    clickFunc: any;
    initFunc?: any;
}

class ButtonWrapper {
    public button: any;
    private value: boolean;
    private textBlock: any;
    private trueTxt: string;
    private falseTxt: string;
    private clickFunc;
    private containingMesh: any;

    /**
     * The constructor.
     * @param  {Object<string,*>} params
     * @constructor
     */
    constructor(params: IButtonWrapper) {
        // Make the button
        this.button = new BABYLON.GUI.HolographicButton(params.name);
        params.panel.addControl(this.button);

        // Make a text block
        this.textBlock = new BABYLON.GUI.TextBlock();
        this.textBlock.color = "white";
        this.textBlock.resizeToFit = true;

        // Save the value and text, etc.
        this.value = params.default;
        this.trueTxt = params.trueTxt;
        this.falseTxt = params.falseTxt;
        this.clickFunc = params.clickFunc;

        // Update the text.
        this.updateTxt();

        // Make the button clickable. No. It is the sphere that will trigger this...
        // this.button.onPointerClickObservable.add((e) => {
            // this.toggled();
        // });

        // Make a mesh that surrounds the button. It actually triggers the
        // click.
        this.containingMesh = BABYLON.Mesh.CreateSphere(
            params.name + "-container-mesh", 2, Vars.BUTTON_SPHERE_RADIUS, Vars.scene,
        );
        this.containingMesh.position = this.button.node.absolutePosition;
        this.containingMesh.visibility = 0;

        // Add a clicking function to the mesh.
        this.containingMesh.clickFunc = () => {
            this.toggled();
        };

        // Add the mesh to the list of ones that are pickable.
        Pickables.addPickableButton(this.containingMesh);

        if (params.initFunc !== undefined) {
            params.initFunc(this);
        }
    }

    /**
     * Determines if this button is visible.
     * @param  {boolean} [val=] Whether this button is visible.
     * @returns void
     */
    public isVisible(val?: boolean): void {
        if (val === undefined) {
            // A getter
            return this.button.isVisible;
        } else {
            // A setter. Note that this doesn't affect visibility on meshes
            // (they could be entirely transparent).
            this.button.isVisible = val;
            this.containingMesh.isVisible = val;
        }
    }

    /**
     * Sets the text on this button.
     * @returns void
     */
    private updateTxt(): void {
        this.textBlock.text = this.value ? this.trueTxt : this.falseTxt;
        this.button.content.dispose();
        this.button.content = this.textBlock;
    }

    /**
     * Toggle whether this button is visible.
     * @returns void
     */
    private toggled(): void {
        // Play the sound.
        clickSound.setPosition(this.containingMesh.position.clone());
        clickSound.play();

        // Switch value.
        this.value = !this.value;

        // Fire the user-defined trigger.
        this.clickFunc(this);

        // Update the text.
        this.updateTxt();
    }
}
