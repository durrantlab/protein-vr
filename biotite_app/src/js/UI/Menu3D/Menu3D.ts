import * as CommonCamera from "../../Cameras/CommonCamera";
import * as VRPoints from "../../Navigation/Points";
import * as VRVoiceCommands from "../../Navigation/VoiceCommands";
import * as Vars from "../../Vars";
import * as Button from "./Button";
import * as Rotations from "./Rotations";
import * as Styles from "./Styles";

declare var BABYLON;

// An easy way to define a menu. It's a nested object. See setup();
let menuInf;

// The program will convert that nested array to a flat list.
let menuInfFlat;

export let clickSound: any = undefined;
export let openMainMenuFloorButton: any;

// These variables need to be initialized in setup(), to enable reloading if
// necessary.
let allButtons;
let GUI3DMenuManager;
let commonMenuAnchor;
let latestLevelViewed;
let sceneInfoData;

/**
 * Load the 3D GUI. Also reloads the GUI (destroys old version). Reloading is
 * useful when you add a new PDB, for example, and want to update the
 * selection options.
 * @param  {Object<string,*>=} data The data from scene_info.json. Saves on
 *                                  first use so it doesn't need to be
 *                                  subsequently specified.
 * @returns void
 */
export function setup(data?): void {
    // Initialize some variables
    allButtons = [];
    latestLevelViewed = 0;
    menuInf = {
        "Styles": Styles.buildStylesSubMenu(),
        "Rotate": Rotations.buildRotationsSubMenu(),
        "Last": () => {
            console.log("Going to", latestLevelViewed);
            showOnlyButtonsOfLevel(latestLevelViewed);
        },
    };

    // Save the scene data so you can reference it in the future, if you
    // recreate the menu. If it's not defined, the use the saved data.
    if (data !== undefined) {
        sceneInfoData = data;
    } else {
        data = sceneInfoData;
    }

    // Only required to setup once.
    if (GUI3DMenuManager === undefined) {
        // Make a manager for the menu
        GUI3DMenuManager = new BABYLON.GUI.GUI3DManager(Vars.scene);
        // window["GUI3DMenuManager"] = GUI3DMenuManager;
    }

    setupMainMenu();

    // Only required to setup once.
    if (openMainMenuFloorButton === undefined) {
        setupMainMenuToggleButton();
    }

    // Only required to setup once.
    if (clickSound === undefined) {
        clickSound = new BABYLON.Sound(
            "click-button", "assets/staple-public-domain.mp3",
            Vars.scene, null,
            { loop: false, autoplay: false, spatialSound: true, volume: 0.1 },
        );
    }
}

// window["setup"] = setup;

/**
 * Setup the main menu.
 * @returns void
 */
function setupMainMenu(): void {
    // Get the descriptions
    // VRVoiceCommands.setMoleculeNameInfos(data);

    // Flatten the menu data.
    menuInfFlat = groupMenuInfByLevel();

    // Here would also be a good place to add additional buttons such as voice
    // dictation. See setupSubMenuNavButtons for how this was done
    // previously.
    menuInfFlat = setupSubMenuNavButtons(menuInfFlat);

    commonMenuAnchor = new BABYLON.TransformNode(""); // this can be a mesh, too

    // createPanelIfNeeded(1);
    createPanelSixteenButtons();

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
    // setupSubMenuNavButtons(cylinderPanelMainMenu, data);

    // window["cylinderPanelMainMenu"] = cylinderPanelMainMenu;
}

/**
 * Creates a panel containing 16 buttons. These buttons are manipulated to
 * show different submenus.
 * @returns void
 */
function createPanelSixteenButtons(): void {
    // let panel = new BABYLON.GUI.CylinderPanel();
    let panel = new BABYLON.GUI.SpherePanel();

    panel.radius = Vars.MENU_RADIUS;
    panel.margin = Vars.MENU_MARGIN;

    GUI3DMenuManager.addControl(panel);
    panel.blockLayout = true;

    // Add buttons
    for (let idx = 0; idx < 16; idx++) {
        let func = () => { return; };
        let txt = idx.toString();
        let color = "yellow";
        let levelInt = 1;

        allButtons.push(
            new Button.ButtonWrapper({
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
                panel: panel,
                trueTxt: txt, //  + "\n(Show)",
                color,
            }),
        );
    }

    // Set radius and such.
    panel.columns = 4;

    panel.linkToTransformNode(commonMenuAnchor);

    panel.blockLayout = false;
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
     * @param  {Object}           inf      The menuInfo data.
     * @param  {number}           level    The currently menu level.
     * @param  {number|undefined} upLevel  The level of the submenu one above
     *                                     this one.
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
                            color: "green",
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

/**
 * Set up submenu navigation buttons like back and close.
 * @param  {Object} menuData
 * @returns *
 */
function setupSubMenuNavButtons(menuData: any): any {
    // Each of the submenus should have a back button and a close menu button.
    for (let level in menuData) {
        if (menuData.hasOwnProperty(level)) {
            // Sort the existing items by the text. To alphabetize before
            // adding "control" buttons below.
            menuData[level].sort((first, second) => {
                // See https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
                return ("" + first.txt).localeCompare(second.txt);
            });

            let levelInt = +level;
            if (levelInt > 1) {  // Because even main submenu can't go back (will be cancel).
                menuData[level].push({
                    color: "yellow",
                    func: () => {
                        showOnlyButtonsOfLevel(menuData[level][0].upLevel);
                    },
                    txt: "Back ⇦",  // " >"
                    upLevel: menuData[level][0].upLevel,
                });
            }

            if (levelInt > 0) {
                menuData[level].push({
                    color: "red",
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
    // console.log(menuData);

    return menuData;
}

/**
 * Sets up some additional buttons (like audio, tactile feedback, etc).
 * @param  {*}                panel  The panel to add the buttons to.
 * @param  {Object<string,*>} data   The data from scene_info.json.
 * @returns void
 */
// function setupSubMenuNavButtons(panel: any, data: any): void {
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
    // let camera = Vars.scene.activeCamera;
    openMainMenuFloorButton = new Button.ButtonWrapper({
        clickFunc: (buttonWrapper) => {
            if (!buttonWrapper.value) {
                showOnlyButtonsOfLevel(0);
            } else {
                showOnlyButtonsOfLevel(1);
            }

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

    window["openMainMenuFloorButton"] = openMainMenuFloorButton;

    // Set up the button anchor and move/rotate it.
    let mainMenuAnchorToggle = new BABYLON.TransformNode(""); // this can be a mesh, too
    panelToggle.linkToTransformNode(mainMenuAnchorToggle);
    mainMenuAnchorToggle.rotation.x = Math.PI * 0.5;

    // Update button position with each turn of the render loop.
    mainMenuAnchorToggle.position.copyFrom(VRPoints.groundPointBelowCamera);
    mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + 0.1;
    mainMenuAnchorToggle.rotation.y = CommonCamera.getCameraRotationY();

    Vars.scene.registerBeforeRender(() => {
    // setInterval(() => {
        mainMenuAnchorToggle.position.copyFrom(VRPoints.groundPointBelowCamera);  // Prob
        mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + 0.1;     // No prob
        mainMenuAnchorToggle.rotation.y = CommonCamera.getCameraRotationY();  // Prob
        // camera.rotation.y;  // TODO: What about VR camera.
    // }, 1000);
    });
}

/**
 * Shows the buttons associated with a specific submenu level.
 * @param  {number} level
 * @returns void
 */
function showOnlyButtonsOfLevel(level: number): void {
    if (level > 1) {  // Not the main menu.
        latestLevelViewed = level;
    }

    // Hide all the buttons.
    for (let btn of allButtons) {
        btn.isVisible(false);
    }

    if (level === 0) {
        // It's the button on the floor. Just needed to hide all buttons, so
        // now you're good.
        return;
    }

    // Figure out what layout to use.
    let btnIdxOrder = [];
    if (menuInfFlat[level].length <= 4) {
        btnIdxOrder = [7, 6, 5, 4];
    } else if (menuInfFlat[level].length <= 8) {
        btnIdxOrder = [7, 6, 5, 4, 11, 10, 9, 8];
    } else if (menuInfFlat[level].length <= 12) {
        btnIdxOrder = [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8];
    } else {
        btnIdxOrder = [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8, 15, 14, 13, 12];
    }

    // Show enough buttons for the number of menu items to show, and update
    // them.
    for (let i = 0; i < menuInfFlat[level].length; i++) {
        let btnidx = btnIdxOrder[i];
        let menuInfFlatThisOne = menuInfFlat[level][i];
        let btn = allButtons[btnidx];
        btn.updateTxt(menuInfFlatThisOne.txt);
        btn.updateColor(menuInfFlatThisOne.color);
        btn.clickFunc = menuInfFlatThisOne.func;
        // menuInfFlatThisOne.upLevel doesn't seem to be necessary.
        btn.isVisible(true);
    }
};

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
