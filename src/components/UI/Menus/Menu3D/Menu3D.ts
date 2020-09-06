// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

import * as CommonCamera from "../../../Cameras/CommonCamera";
import * as VRPoints from "../../../Navigation/Points";
import * as Vars from "../../../Vars/Vars";
import * as Button from "./Button";
import * as Rotations from "./Rotations";
import * as Styles from "./Styles";
import ButtonPressSoundFile from "./staple-public-domain.mp3";

declare var BABYLON: any;

// An easy way to define a menu. It's a nested object. See setup();
/** @type {Object<string,*>} */
export let menuInf: any;

export let clickSound: any = undefined;
export let openMainMenuFloorButton: any;

// These variables need to be initialized in setup(), to enable reloading if
// necessary.
/** @type {Array<*>} */
let allButtons: any[];

let latestBreadcrumbsViewed: string[];

/** @type {Object<string>} */
// let sceneInfoData: any;

let gui3DMenuManager: any;
let commonMenuAnchor: any;

/**
 * Load the 3D GUI. Also reloads the GUI (destroys old version). Reloading is
 * useful when you add a new PDB, for example, and want to update the
 * selection options.
 * @param  {Object<string,*>=} data The data from scene_info.json. Saves on
 *                                  first use so it doesn't need to be
 *                                  subsequently specified.
 * @returns void
 */
export function setup(data?: any): void {
    // Initialize some variables
    allButtons = [];
    latestBreadcrumbsViewed = [];
    menuInf = {
        "Styles": Styles.buildStylesSubMenu(),
        "Rotate": Rotations.buildRotationsSubMenu()
    };

    // Save the scene data so you can reference it in the future, if you
    // recreate the menu. If it's not defined, the use the saved data.
    // if (data !== undefined) {
    //     sceneInfoData = data;
    // } else {
    //     data = sceneInfoData;
    // }

    // Only required to setup once.
    if (gui3DMenuManager === undefined) {
        // Make a manager for the menu
        gui3DMenuManager = new BABYLON.GUI.GUI3DManager(Vars.scene);
    }

    // Simplify the menu (collapsing excessive parts).
    reduceSingleItemSubMenus();

    setupMainMenu();

    // Only required to setup once.
    if (openMainMenuFloorButton === undefined) {
        setupMainMenuToggleButton();
    }

    // Only required to setup once.
    if (clickSound === undefined) {
        clickSound = new BABYLON.Sound(
            "click-button", ButtonPressSoundFile,
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
    // Here would also be a good place to add additional buttons such as voice
    // dictation. See setupAllSubMenuNavButtons for how this was done
    // previously. Currently adds back and close buttons.
    setupAllSubMenuNavButtons();

    commonMenuAnchor = new BABYLON.TransformNode(""); // this can be a mesh, too

    createPanelSixteenButtons();
}

/**
 * Creates a panel containing 16 buttons. These buttons are manipulated to
 * show different submenus.
 * @returns void
 */
function createPanelSixteenButtons(): void {
    // let panel = new BABYLON.GUI.CylinderPanel();
    const panel = new BABYLON.GUI.SpherePanel();

    panel.radius = Vars.MENU_RADIUS;
    panel.margin = Vars.MENU_MARGIN;

    gui3DMenuManager.addControl(panel);
    panel.blockLayout = true;

    // Add buttons
    for (let idx = 0; idx < 16; idx++) {
        const func = () => { return; };
        const txt = idx.toString();
        const color = "yellow";
        const levelInt = 1;

        allButtons.push(
            new Button.ButtonWrapper({
                clickFunc: (buttonWrapper: Button.ButtonWrapper) => {
                    func();
                    // For reasons I don't understand, the radius on this
                    // cylinder (set below) doesn't take. Put it here to
                    // too make sure.
                    // cylinderPanelMainMenu.radius = Vars.MENU_RADIUS;
                    // cylinderPanelMainMenu.margin = Vars.MENU_MARGIN;
                },
                default: false,
                falseTxt: txt, //  + "\n(Hide)",
                initFunc: (buttonWrapper: Button.ButtonWrapper) => {
                    buttonWrapper.isVisible(false);  // Buttons start off hidden.
                },
                level: levelInt,
                name: "menu-visible-button-" + txt,
                panel,
                trueTxt: txt,
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
 * Applies a user-provided function to all levels of the menu. For example,
 * adds "Back" and "Close Menu" buttons to all sub menus.
 * @param  {Function(Object, Array<string>)} funcToApply  The function to
 *                                                        apply.
 * @returns void
 */
export function applyFuncToAllMenuLevels(funcToApply: any): void {

    /**
     * @param  {Object}           subMenu      The submenu data.
     * @param  {Array<string>}    breadcrumbs  They list of keys to get to
     *                                         this point in the menu.
     * @returns void
     */
    const recurse = (subMenu: any, breadcrumbs: string[]): void => {
        funcToApply(subMenu, breadcrumbs);

        const keys = Object.keys(subMenu);
        const keysLen = keys.length;
        for (let i = 0; i < keysLen; i++) {
            const key = keys[i];
            const subMenuItems = subMenu[key];
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
    applyFuncToAllMenuLevels((subMenu: any, breadcrumbs: string[]) => {
        setupSubMenuNavButtons(subMenu, breadcrumbs);
    });
}

/**
 * Sets up the submenu navigation buttons ("Back", "Close Menu"). This
 * function acts on a single submenu, but elsewhere it is applied to all
 * submenus.
 * @param  {*}        subMenu      Information about the submenu.
 * @param  {string[]} breadcrumbs  The breadcrumbs to get to this submenu.
 * @returns void
 */
export function setupSubMenuNavButtons(subMenu: any, breadcrumbs: string[]): void {
    if (breadcrumbs.length > 0) {
        // No back button on top-level menu.
        subMenu["Back ⇦"] = () => {
            const newBreadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1);
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
    const panelToggle = new BABYLON.GUI.StackPanel3D();
    gui3DMenuManager.addControl(panelToggle);

    // Set up the button
    openMainMenuFloorButton = new Button.ButtonWrapper({
        clickFunc: (buttonWrapper: Button.ButtonWrapper) => {
            if (!buttonWrapper.value) {
                showOnlyButtonsOfLevel(undefined);
            } else {
                showOnlyButtonsOfLevel([]);
            }

            commonMenuAnchor.position.copyFrom(CommonCamera.getCameraPosition());
            commonMenuAnchor.rotation.y = CommonCamera.getCameraRotationY();
        },
        default: false,
        falseTxt: "Show Menu",
        level: 0,
        name: "menu-visible-button",
        panel: panelToggle,
        trueTxt: "Hide Menu",
    });

    // Offset the button so it's not right below the camera.
    openMainMenuFloorButton.button.position.y = 0.75;
    openMainMenuFloorButton.button.position.z = 0.75;
    // openMainMenuFloorButton.button.rotation.x = 0.25 * Math.PI;

    // Set up the button anchor and move/rotate it.
    const mainMenuAnchorToggle = new BABYLON.TransformNode(""); // this can be a mesh, too
    panelToggle.linkToTransformNode(mainMenuAnchorToggle);
    mainMenuAnchorToggle.rotation.x = Math.PI * 0.5;

    // Update button position with each turn of the render loop.
    mainMenuAnchorToggle.position.copyFrom(VRPoints.groundPointBelowCamera);
    mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + 0.1;
    mainMenuAnchorToggle.rotation.y = CommonCamera.getCameraRotationY();  // Rotates around up.

    // Rotate the menu button towards camera. Because no longer right below
    // user's feet.
    mainMenuAnchorToggle.rotation.x = 0.4 * Math.PI;

    Vars.scene.registerBeforeRender(() => {
        mainMenuAnchorToggle.position.copyFrom(VRPoints.groundPointBelowCamera);  // Prob
        mainMenuAnchorToggle.position.y = mainMenuAnchorToggle.position.y + 0.1;     // No prob
        mainMenuAnchorToggle.rotation.y = CommonCamera.getCameraRotationY();  // Prob
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
        if (menuInf["Last"] === undefined) {
            menuInf["Last"] = () => {
                console.log("Going to", latestBreadcrumbsViewed);
                showOnlyButtonsOfLevel(latestBreadcrumbsViewed);
            };
        }
    }

    // Hide all the buttons.
    const allButtonsLen = allButtons.length;
    for (let i = 0; i < allButtonsLen; i++) {
        const btn = allButtons[i];
        btn.isVisible(false);
    }

    if (breadcrumbs === undefined) {
        // It's the button on the floor. Just needed to hide all buttons, so
        // now you're good.
        return;
    }

    // Find the submenu
    let subMenu = menuInf;
    const breadcrumbsLen = breadcrumbs.length;
    for (let i = 0; i < breadcrumbsLen; i++) {
        const breadcrumb = breadcrumbs[i];
        subMenu = subMenu[breadcrumb];
    }

    // Get the names of the submenu items.
    const subMenuItemNames = Object.keys(subMenu);

    // Set some names aside as "special".
    const redBtns = ["Close Menu ×", "Exit VR ×"];
    const yellowBtns = ["Back ⇦"];
    const specialBtns = redBtns.concat(yellowBtns);

    // Sort those names
    subMenuItemNames.sort((first: string, second: string) => {
        // See
        // https://stackoverflow.com/questions/51165/how-to-sort-strings-in-javascript
        const firstIsSpecial = specialBtns.indexOf(first) !== -1;
        const secondIsSpecial = specialBtns.indexOf(second) !== -1;
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
    const len = subMenuItemNames.length;
    for (let i = 0; i < len; i++) {
        const subMenuItemName = subMenuItemNames[i];
        const subMenuItem = subMenu[subMenuItemName];
        const btnidx = btnIdxOrder[i];
        const btn = allButtons[btnidx];
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
}

/**
 * If a given submenu has only one item, condense the menu.
 * @returns void
 */
function reduceSingleItemSubMenus(): void {
    /**
     * @param  {Object}           subMenu      The submenu data.
     * @param  {Array<string>}    breadcrumbs  They list of keys to get to
     *                                         this point in the menu.
     * @returns void
     */
    const recurse = (subMenu: any, breadcrumbs: string[]): void => {
        let keys = Object.keys(subMenu);

        if (keys.length === 1) {  // Not 3 because back and close not added yet.
            // Only one item remains. That's the one to collpase.
            const keyToKeep = keys[0];

            // Get the name of the new key (one up with keyToKeep added to
            // end).
            const lastKey = breadcrumbs[breadcrumbs.length - 1];
            const newKey = lastKey + ": " + keyToKeep;

            // Redefine the breadcrumbs
            breadcrumbs = breadcrumbs.slice(0, breadcrumbs.length - 1).concat([newKey]);

            // Go through the menu keys to get to the submenu above this one.
            subMenu = menuInf;
            const breadcrumbsButLast = breadcrumbs.slice(0, breadcrumbs.length - 1);
            const breadcrumbsButLastLen = breadcrumbsButLast.length;
            for (let i = 0; i < breadcrumbsButLastLen; i++) {
                const breadcrumb = breadcrumbsButLast[i];
                subMenu = subMenu[breadcrumb];
            }

            // Rename if submenu.
            subMenu[newKey] = subMenu[lastKey][keyToKeep];
            delete subMenu[lastKey];

            // Go into new submenu
            subMenu = subMenu[newKey];

            // Update keys
            keys = Object.keys(subMenu);
        }

        const keysLen = keys.length;
        for (let i = 0; i < keysLen; i++) {
            const key = keys[i];
            const subMenuItems = subMenu[key];
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
