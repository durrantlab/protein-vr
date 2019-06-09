import * as CommonCamera from "../Cameras/CommonCamera";
import * as Visualize from "../Mols/3DMol/Visualize";
import * as Pickables from "../Navigation/Pickables";
import * as VRPoints from "../Navigation/Points";
import * as VRVoiceCommands from "../Navigation/VoiceCommands";
import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars";

declare var BABYLON;

// An easy way to define a menu.
let menuInf = buildMenu();

// let visibilityInfo = {};  // The button states.
let allButtons = [];
// let mainMenuVisible = false;
let GUI3DMenuManager;
let panels = {};
let commonMenuAnchor;
let clickSound: any;
let openMainMenuFloorButton: any;
// let cylinderPanelMainMenu: any;

let colorDelta = 0.1;
// const defaultButtonColor = new BABYLON.Color3(0.3, 0.35, 0.4);
const greenColor = new BABYLON.Color3(0.3, 0.35 + colorDelta, 0.4);
const yellowColor = new BABYLON.Color3(0.3 + colorDelta, 0.35 + colorDelta, 0.4);
const redColor = new BABYLON.Color3(0.3 + colorDelta, 0.35, 0.4);

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

function buildMenu(): any {
    let components = ["Protein", "Ligand", "Water", "Nucleic"];
    let selections = {
        "Ligand": ["All"],
        "Nucleic": ["All"],
        "Protein": [
            "All", "Hydrophobic", "Hydrophilic", "Charged", "Aromatic",  // Other? From VMD?
        ],
        "Water": ["All"],
    };
    let commonReps = ["Stick", "Sphere", "Surface"];
    let representations = {
        "Ligand": commonReps,
        "Nucleic": commonReps,
        "Protein": ["Cartoon"].concat(commonReps),
        "Water": commonReps,
    };
    let colorSchemes = ["Element", "Red", "Blue", "Green", "Orange", "Yellow", "Purple", "Spectrum", "Hide"];

    let menu = {};
    for (let i1 in components) {
        if (components.hasOwnProperty(i1)) {
            let component = components[i1];
            menu[component] = {};

            for (let i2 in selections[component]) {
                if (selections[component].hasOwnProperty(i2)) {
                    let selection = selections[component][i2];
                    menu[component][selection] = {};

                    for (let i3 in representations[component]) {
                        if (representations[component].hasOwnProperty(i3)) {
                            let rep = representations[component][i3];
                            menu[component][selection][rep] = {};
                            for (let i4 in colorSchemes) {
                                if (colorSchemes.hasOwnProperty(i4)) {
                                    let colorScheme = colorSchemes[i4];
                                    menu[component][selection][rep][colorScheme] = () => {
                                        Visualize.toggleRep([component, selection], rep, colorScheme);
                                        openMainMenuFloorButton.toggled();
                                    };
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    return menu;
}

/**
 * Setup the main menu.
 * @param  {Object<string,*>} data The data from scene_info.json.
 * @returns void
 */
function setupMainMenu(data): void {
    // Get the descriptions
    // VRVoiceCommands.setMoleculeNameInfos(data);

    // Flatten the menu data.
    let menuData = groupMenuInfByLevel();

    // Here would also be a good place to add additional buttons such as voice
    // dictation. See setupNonVisualizationButtons for how this was done
    // previously.
    menuData = setupNonVisualizationButtons(menuData);

    commonMenuAnchor = new BABYLON.TransformNode(""); // this can be a mesh, too

    // Make a manager for the menu
    GUI3DMenuManager = new BABYLON.GUI.GUI3DManager(Vars.scene);

    for (let level in menuData) {
        if (menuData.hasOwnProperty(level)) {
            // panels[level] = new BABYLON.GUI.CylinderPanel();
            panels[level] = new BABYLON.GUI.SpherePanel();
            GUI3DMenuManager.addControl(panels[level]);
            panels[level].blockLayout = true;

            // To get things to render in a better order, you need to
            // reverse them. Very strange.
            menuData[level].reverse();

            // Add buttons
            for (let idx in menuData[level]) {
                if (menuData[level].hasOwnProperty(idx)) {
                    let btnInf = menuData[level][idx];

                    let txt = btnInf.txt;
                    let func = btnInf.func;
                    let color = btnInf.color;

                    let levelInt = parseInt(level, 10);

                    allButtons.push(
                        new ButtonWrapper({
                            clickFunc: (buttonWrapper) => {
                                func();

                                // For reasons I don't understand, the radius on this
                                // cylinder (set below) doesn't take. Put it here to
                                // too make sure.
                                // cylinderPanelMainMenu.radius = Vars.MENU_RADIUS;
                                // cylinderPanelMainMenu.margin = Vars.MENU_MARGIN;
                            },
                            default: false,
                            falseTxt: txt, //  + "\n(Hide)",
                            initFunc: (buttonWrapper) => {
                                buttonWrapper.isVisible(false);  // Buttons start off hidden.
                            },
                            level: levelInt,
                            name: "menu-visible-button-" + txt,
                            panel: panels[level],
                            trueTxt: txt, //  + "\n(Show)",
                            color,
                        }),
                    );

                    panels[level].columns = 4;
                    window["panels"] = panels;

                    panels[level].blockLayout = false;

                    panels[level].linkToTransformNode(commonMenuAnchor);

                    // Set radius and such.
                    setInterval(() => {
                        panels[level].radius = Vars.MENU_RADIUS;
                        panels[level].margin = Vars.MENU_MARGIN;
                    }, 1000);
                }
            }
        }
    }

    // for (let key in VRVoiceCommands.moleculeNameInfos) {
    //     if (VRVoiceCommands.moleculeNameInfos.hasOwnProperty(key)) {
    //         let inf = VRVoiceCommands.moleculeNameInfos[key];
    //         let desc = inf.description;

    //         allButtons.push(
    //             new ButtonWrapper({
    //                 clickFunc: (buttonWrapper) => {
    //                     VRVoiceCommands.showOrHideModel(
    //                         inf.modelName,
    //                         inf.representation,
    //                         !buttonWrapper.value,
    //                     );

    //                     // For reasons I don't understand, the radius on this
    //                     // cylinder (set below) doesn't take. Put it here to
    //                     // too make sure.
    //                     // cylinderPanelMainMenu.radius = Vars.MENU_RADIUS;
    //                     // cylinderPanelMainMenu.margin = Vars.MENU_MARGIN;
    //                 },
    //                 default: false,
    //                 falseTxt: desc + "\n(Hide)",
    //                 initFunc: (buttonWrapper) => {
    //                     buttonWrapper.isVisible(false);  // Buttons start off hidden.
    //                 },
    //                 name: "menu-visible-button-" + inf.modelName.replace(/ /g, "").replace(/\n/g, ""),
    //                 panel: cylinderPanelMainMenu,
    //                 trueTxt: desc + "\n(Show)",
    //             }),
    //         );
    //         // window.but = but;
    //     }
    // }
    // setupNonVisualizationButtons(cylinderPanelMainMenu, data);

    // window["cylinderPanelMainMenu"] = cylinderPanelMainMenu;
}

/**
 * Takes the data in menuInf and groups it into appropriate levels. Eventually
 * these levels will becomme diferent submenus.
 * @returns Object<number: Array<string, *>> The grouped data.
 */
function groupMenuInfByLevel(): any {
    // You need to restructure the menuInf variable.
    let menuData = {};  // Where to put the data.

    let levelsUsed = [];

    /**
     * Get the next available level slot.
     * @param  {number} bestLevelGuess  The best guess at the next available
     *                                  slot.
     * @returns number  The actual slot.
     */
    let getNextAvailableLevel = (bestLevelGuess: number): number => {
        // You may need to adjust the level to make sure it hasn't already
        // been used.
        while (levelsUsed.indexOf(bestLevelGuess) !== -1) {
            bestLevelGuess++;
        }

        return bestLevelGuess;
    };

    /**
     * @param  {Object<string,*>} inf The menuInfo data.
     * @param  {number} level         The currently menu level.
     * @param  {number} upLevel       The level of the submenu one above this
     *                                one.
     * @returns void
     */
    let recurse = (inf: any, level: number, upLevel: number): void => {
        levelsUsed.push(level);

        let keys = Object.keys(inf);
        for (let idx in keys) {
            if (keys.hasOwnProperty(idx)) {
                let key = keys[idx];
                let val = inf[key];

                // Make sure list initialized.s
                menuData[level] = (menuData[level] === undefined) ? [] : menuData[level];

                switch (typeof(val)) {
                    case "function":
                        menuData[level].push({
                            func: val,
                            txt: key,
                            upLevel,
                        });
                        break;
                    case "object":
                        let nextLevel = getNextAvailableLevel(level + 1);
                        menuData[level].push({
                            color: greenColor,
                            func: () => { showOnlyButtonsOfLevel(nextLevel); },
                            txt: key + " ⇨",  // " >"
                            upLevel,
                        });
                        recurse(val, nextLevel, level);
                        break;
                    default:
                        alert("error!");
                }
            }
        }
    };

    recurse(menuInf, 1, undefined);

    return menuData;
}

function setupNonVisualizationButtons(menuData: any): any {
    // Each of the submenus should have a back button and a close menu button.
    for (let level in menuData) {
        if (menuData.hasOwnProperty(level)) {
            // Sort the existing items by the text. To alphabetize before
            // adding "control" buttons below.
            menuData[level].sort((first, second) => {
                // See https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
                return ("" + first.txt).localeCompare(second.txt);
            });

            let levelInt = parseInt(level, 10);
            if (levelInt > 1) {  // Because even main submenu can't go back (will be cancel).
                menuData[level].push({
                    color: yellowColor,
                    func: () => {
                        showOnlyButtonsOfLevel(menuData[level][0].upLevel);
                    },
                    txt: "Back ⇦",  // " >"
                    upLevel: menuData[level][0].upLevel,
                });
            }

            if (levelInt > 0) {
                menuData[level].push({
                    color: redColor,
                    func: () => {
                        // showOnlyButtonsOfLevel(0);
                        openMainMenuFloorButton.toggled();
                    },
                    txt: "Close Menu ×",  // " >"
                    upLevel: menuData[level][0].upLevel,
                });
            }
        }
    }
    console.log(menuData);

    return menuData;
}

/**
 * Sets up some additional buttons (like audio, tactile feedback, etc).
 * @param  {*}                panel  The panel to add the buttons to.
 * @param  {Object<string,*>} data   The data from scene_info.json.
 * @returns void
 */
// function setupNonVisualizationButtons(panel: any, data: any): void {
    // Turn on speech synthesis.
    // allButtons.push(
    //     new ButtonWrapper({
    //         clickFunc: (buttonWrapper) => {
    //             // TODO:
    //             if (buttonWrapper.value) {
    //                 VRVoiceCommands.setup(data);
    //             } else {
    //                 VRVoiceCommands.stopVoiceCommands();
    //             }
    //         },
    //         default: false,
    //         falseTxt: "Audio Commands\n(On)",
    //         initFunc: (buttonWrapper) => {
    //             buttonWrapper.isVisible(false);  // No audio to begin.
    //         },
    //         name: "menu-audio-commands-button",
    //         panel,
    //         trueTxt: "Audio Commands\n(Off)",
    //     }),
    // );
// }

/**
 * Setup the toggle button on the floor that turns the main menu on and off.
 * @returns void
 */
function setupMainMenuToggleButton(): void {
    // Also set up a manager at your feet. This turns the main manager on and
    // off.
    // gui3DMenuManagers[0] = new BABYLON.GUI.GUI3DManager(Vars.scene);
    let panelToggle = new BABYLON.GUI.StackPanel3D();
    GUI3DMenuManager.addControl(panelToggle);

    // Set up the button
    let camera = Vars.scene.activeCamera;
    openMainMenuFloorButton = new ButtonWrapper({
        clickFunc: (buttonWrapper) => {
            // Update main-menu button visibility
            // mainMenuGUI3DManager.isVisible = ! mainMenuGUI3DManager.isVisible; *****
            // for (let i in allButtons) {
            //     if (allButtons.hasOwnProperty(i)) {
            //         let iInt = parseInt(i, 10);
            //         allButtons[iInt].isVisible(buttonWrapper.value);
            //     }
            // }

            if (!buttonWrapper.value) {
                showOnlyButtonsOfLevel(0);
            } else {
                showOnlyButtonsOfLevel(1);
            }

            // mainMenuVisible = !mainMenuVisible;
            commonMenuAnchor.position.copyFrom(CommonCamera.getCameraPosition());
            commonMenuAnchor.rotation.y = CommonCamera.getCameraRotationY(); //  + Math.PI * 0.5;
            // camera.rotation.y + Math.PI * 0.5;  // TODO: What about if VR camera?
        },
        default: false,
        falseTxt: "Show Menu",
        level: 0,
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

function showOnlyButtonsOfLevel(level: number): void {
    for (let idx in allButtons) {
        if (allButtons.hasOwnProperty(idx)) {
            let btn = allButtons[idx];
            if (btn.level === 0) {
                // The main menu buttons is always visible on the floor.
                btn.isVisible(true);
            } else if (btn.level === level) {
                btn.isVisible(true);
            } else {
                btn.isVisible(false);
            }
        }
    }

    // for (let aLevel in gui3DMenuManagers) {
    //     if (gui3DMenuManagers.hasOwnProperty(aLevel)) {
    //         let aLevelInt = parseInt(aLevel, 10);
    //         let manager = gui3DMenuManagers[aLevelInt];

    //         if (aLevelInt === 0) {
    //             // The main menu buttons is always visible on the floor.
    //             manager.rootContainer.isVisible = true;
    //         } else if (aLevelInt === level) {
    //             manager.rootContainer.isVisible = true;
    //         } else {
    //             manager.rootContainer.isVisible = false;
    //         }
    //     }
    // }
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
    level: number;
    color?: any;
}

class ButtonWrapper {
    public button: any;
    public level: number;
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

        // Change button color if appropriate.
        if (params.color !== undefined) {
            // Need to make distinct material. Otherwise, it will share this
            // material with the other buttons.
            let newMat = this.button.mesh.material.clone();
            newMat.albedoColor = params.color;
            this.button.mesh.material = newMat;
        }

        // Save the level.
        this.level = params.level;

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
        //     mesh.actionManager
        // .registerAction(
            // )

            this.button.isVisible = val;
            this.containingMesh.isVisible = val;
        }
    }

    /**
     * Toggle whether this button is visible.
     * @returns void
     */
    public toggled(): void {
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

    /**
     * Sets the text on this button.
     * @returns void
     */
    private updateTxt(): void {
        this.textBlock.text = this.value ? this.trueTxt : this.falseTxt;
        this.button.content.dispose();
        this.button.content = this.textBlock;
    }
}
