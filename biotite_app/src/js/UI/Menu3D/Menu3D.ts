import * as CommonCamera from "../../Cameras/CommonCamera";
import * as VRPoints from "../../Navigation/Points";
import * as VRVoiceCommands from "../../Navigation/VoiceCommands";
import * as Vars from "../../Vars";
import * as Button from "./Button";
import * as Rotations from "./Rotations";
import * as Styles from "./Styles";

declare var BABYLON;

// An easy way to define a menu. It's a nested object. See setup();
export let menuInf;

export let clickSound: any = undefined;
export let openMainMenuFloorButton: any;

// These variables need to be initialized in setup(), to enable reloading if
// necessary.
let allButtons;
let GUI3DMenuManager;
let commonMenuAnchor;
let latestBreadcrumbsViewed;
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
    latestBreadcrumbsViewed = [];
    menuInf = {
        "Styles": Styles.buildStylesSubMenu(),
        "Rotate": Rotations.buildRotationsSubMenu(),
        "Last": () => {
            console.log("Going to", latestBreadcrumbsViewed);
            showOnlyButtonsOfLevel(latestBreadcrumbsViewed);
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

/**
 * Setup the main menu.
 * @returns void
 */
function setupMainMenu(): void {
    // Get the descriptions
    // VRVoiceCommands.setMoleculeNameInfos(data);

    // Flatten the menu data.
    // menuInfFlat = groupMenuInfByLevel();

    // Here would also be a good place to add additional buttons such as voice
    // dictation. See setupAllSubMenuNavButtons for how this was done
    // previously.
    setupAllSubMenuNavButtons(menuInf);

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
    // setupAllSubMenuNavButtons(cylinderPanelMainMenu, data);
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

function applyFuncToAllMenuLevels(funcToApply: any): void {

    /**
     * @param  {Object}           subMenu      The submenu data.
     * @param  {Array<string>}    breadcrumbs  They list of keys to get to
     *                                         this point in the menu.
     * @returns void
     */
    let recurse = (subMenu: any, breadcrumbs: string[]): void => {
        funcToApply(subMenu, breadcrumbs);

        let keys = Object.keys(subMenu);
        for (let key of keys) {
            let subMenuItems = subMenu[key];
            switch (typeof(subMenuItems)) {
                case "object":
                    recurse(subMenuItems, breadcrumbs.concat([key]));
                    break;
                default:
                    continue;
            }
        }
    };

    recurse(menuInf, []);
}

/**
 * Set up submenu navigation buttons like back and close.
 * @returns void
 */
function setupAllSubMenuNavButtons(): void {
    // Each of the submenus should have a back button and a close menu button.
    applyFuncToAllMenuLevels((subMenu, breadcrumbs) => {
        setupSubMenuNavButtons(subMenu, breadcrumbs);
    });
}

export function setupSubMenuNavButtons(subMenu, breadcrumbs) {
    if (breadcrumbs.length > 0) {
        // No back button on top-level menu.
        subMenu["Back ⇦"] = () => {
            let newBreadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
            showOnlyButtonsOfLevel(newBreadcrumbs);
        };
    }
    subMenu["Close Menu ×"] = () => {
        openMainMenuFloorButton.toggled();
    };
}

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
                showOnlyButtonsOfLevel(undefined);
            } else {
                showOnlyButtonsOfLevel([]);
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
 * @param  {Array<string>|undefined} breadcrumbs The breadcrumbs to get to the desired menu level.
 * @returns void
 */
function showOnlyButtonsOfLevel(breadcrumbs: string[]): void {
    if ((breadcrumbs !== undefined) && (breadcrumbs.length > 0)) {
        // Not the top-level menu or floor button, so enable "Last" button.
        latestBreadcrumbsViewed = breadcrumbs;
    }

    // Hide all the buttons.
    for (let btn of allButtons) {
        btn.isVisible(false);
    }

    if (breadcrumbs === undefined) {
        // It's the button on the floor. Just needed to hide all buttons, so
        // now you're good.
        return;
    }

    // Find the submenu
    let subMenu = menuInf;
    for (let breadcrumb of breadcrumbs) {
        subMenu = subMenu[breadcrumb];
    }

    // Get the names of the submenu items.
    let subMenuItemNames = Object.keys(subMenu);

    // Set some names aside as "special".
    let redBtns = ["Close Menu ×"];
    let yellowBtns = ["Back ⇦"];
    let specialBtns = redBtns.concat(yellowBtns);

    // Sort those names
    subMenuItemNames.sort((first, second) => {
        // See https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
        let firstIsSpecial = specialBtns.indexOf(first) !== -1;
        let secondIsSpecial = specialBtns.indexOf(second) !== -1;
        if (firstIsSpecial && !secondIsSpecial) {
            return 1;
        } else if (!firstIsSpecial && secondIsSpecial) {
            return -1;
        } else {
            return ("" + first).localeCompare(second);
        }
    });

    // Figure out what layout to use.
    let btnIdxOrder = [];
    if (subMenuItemNames.length <= 4) {
        btnIdxOrder = [7, 6, 5, 4];
    } else if (subMenuItemNames.length <= 8) {
        btnIdxOrder = [7, 6, 5, 4, 11, 10, 9, 8];
    } else if (subMenuItemNames.length <= 12) {
        btnIdxOrder = [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8];
    } else {
        btnIdxOrder = [3, 2, 1, 0, 7, 6, 5, 4, 11, 10, 9, 8, 15, 14, 13, 12];
    }

    // Update and show the buttons.
    for (let i = 0; i < subMenuItemNames.length; i++) {
        let subMenuItemName = subMenuItemNames[i];
        let subMenuItem = subMenu[subMenuItemName];
        let btnidx = btnIdxOrder[i];
        let btn = allButtons[btnidx];
        btn.updateTxt(subMenuItemName);

        switch (typeof(subMenuItem)) {
            case "object":
                btn.clickFunc = () => {
                    showOnlyButtonsOfLevel(breadcrumbs.concat(subMenuItemName));
                };
                btn.updateColor("green");
                break;
            case "function":
                btn.clickFunc = subMenuItem;
                btn.updateColor("default");
                break;
            default:
                break;
        }

        if (redBtns.indexOf(subMenuItemName) !== -1) {
            btn.updateColor("red");
        } else if (yellowBtns.indexOf(subMenuItemName) !== -1) {
            btn.updateColor("yellow");
        }
        // menuInfFlatThisOne.upLevel doesn't seem to be necessary.

        btn.isVisible(true);
    }
};
