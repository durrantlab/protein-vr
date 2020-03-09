// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


import * as ThreeDMol from "../../Mols/3DMol/ThreeDMol";
import * as VisStyles from "../../Mols/3DMol/VisStyles";
import * as UrlVars from "../../Vars/UrlVars";
import * as Menu3D from "./Menu3D";

// Define all the possible components.
const components = ["Protein", "Ligand", "Ligand Context", "Water", "Nucleic"];

// For each of those components, get the possible selections.
const selections = {
    "Ligand": ["All"],
    "Ligand Context": ["All"],
    "Nucleic": ["All"],
    "Protein": [
        "All", "Hydrophobic", "Hydrophilic", "Charged", "Aromatic",  // Other? From VMD?
    ],
    "Water": ["All"],
};

// For each of those components, specify the associated representations.
const commonReps = ["Stick", "Sphere", "Surface"];
const representations = {
    "Ligand": commonReps,
    "Ligand Context": ["Cartoon"].concat(commonReps),
    "Nucleic": commonReps,
    "Protein": ["Cartoon"].concat(commonReps),
    "Water": commonReps,
};

// You'll need to modify colorSchemeKeyWordTo3DMol in VisStyles.ts too.
const colors = [
    "White", "Red", "Blue", "Green", "Orange", "Yellow", "Purple",
];

const colorSchemes = [
    "Element", "Amino Acid", "Chain", "Nucleic", "Spectrum",
];

/**
 * Makes submenus required for the various style options (reps, colors, etc.).
 * @returns Object
 */
export function buildStylesSubMenu(): any {
    const menu = {
        "Components": {},
        "Selections": {},
        "Clear": () => {
            const fullKeys = Object.keys(VisStyles.styleMeshes);
            const len = fullKeys.length;
            for (let i = 0; i < len; i++) {
                const fullKey = fullKeys[i];
                const styleMesh = VisStyles.styleMeshes[fullKey];
                styleMesh.mesh.isVisible = false;
            }
            // Menu3D.openMainMenuFloorButton.toggled();
        },
        "Remove Existing": {},
    };

    // Add in the components (ligand, protein, etc).
    /** @type {number} */
    const componentsLen = components.length;
    for (let i = 0; i < componentsLen; i++) {
        const component = components[i];
        menu["Components"][component] = {};
        /** @type {number} */
        const selectionsComponentLen = selections[component].length;
        for (let i2 = 0; i2 < selectionsComponentLen; i2++) {
            const selection = selections[component][i2];
            menu["Components"][component][selection] = makeRepColorSchemeSubMenus({}, component, (rep: any, colorScheme: any) => {
                VisStyles.toggleRep([component, selection], rep, colorScheme);
            });
        }
    }

    return menu;
}

/**
 * Populates the portion of the styles menu that lets the user remove old
 * styles.
 * @param  {Object<string,*>} menuInf
 * @returns void
 */
export function updatePastStylesInMenu(menuInf: any): void {
    if (UrlVars.checkIfWebRTCInUrl()) {
        // Leader mode. So no need to update menu (it doesn't exist).
        return;
    }

    // Also add in existing styles so they can be removed.
    menuInf["Styles"]["Remove Existing"] = {};
    Menu3D.setupSubMenuNavButtons(
        menuInf["Styles"]["Remove Existing"],
        ["Styles", "Remove Existing"],
    );

    const repNames = Object.keys(VisStyles.styleMeshes);
    /** @type {number} */
    const len = repNames.length;
    for (let i = 0; i < len; i++) {
        const repName = repNames[i];
        if (VisStyles.styleMeshes[repName].mesh.isVisible === true) {
            let lbl = repName.replace(/--/g, " ");
            lbl = lbl.replace(/{/g, "").replace(/}/g, "").replace(/"/g, "");
            menuInf["Styles"]["Remove Existing"][lbl] = () => {
                // Menu3D.openMainMenuFloorButton.toggled();
                setTimeout(() => {
                    /** @type {Array<*>} */
                    const repInfo = UrlVars.extractRepInfoFromKey(repName);
                    VisStyles.toggleRep(repInfo[0], repInfo[1], "Hide");
                }, 0);
            };
        }
    }
}

/**
 * Populates the portion of the styles menu that has model-specific
 * selections.
 * @param  {Object<string,*>} menuInf
 * @returns void
 */
export function updateModelSpecificSelectionsInMenu(menuInf: any): void {
    // Reset this part of the menu.
    menuInf["Styles"]["Selections"] = {};
    Menu3D.setupSubMenuNavButtons(
        menuInf["Styles"]["Selections"],
        ["Styles", "Selections"],
    );

    // Selection keywords
    const selKeywords = {
        "Atom Name": "atom",
        "Chain": "chain",
        "Element": "elem",
        "Residue Index": "resi",
        "Residue Name": "resn",
        "Secondary Structure": "ss",
    };

    const maxNumPerGroup = 14;

    /**
     * @param  {string}      component
     * @param  {Object<*,*>} menuBranch
     * @param  {Array<*>}    items
     * @param  {Array<string>} breadcrumbs
     */
    const addToMenuRecurse = (component: string, menuBranch: any, items: any[], breadcrumbs: string[]) => {
        items.sort(
            /**
             * @param  {number} x
             * @param  {number} y
             * @returns number
             */
            (x: number, y: number): number => {
                // If either is a string number, convert to number.
                /** @type {number} */
                x = isNaN(+x) ? x : +x;

                /** @type {number} */
                y = isNaN(+y) ? y : +y;

                if (x < y) { return -1; }
                if (x > y) { return 1; }
                return 0;
            },
        );

        // So divide it into maxNumPerGroup groups.
        const chunks = chunkify(items, maxNumPerGroup);

        // Add the items and recurse if necessary.

        /** @type {number} */
        const chunksLen = chunks.length;
        for (let i = 0; i < chunksLen; i++) {
            /** @type {Array<*>} */
            const chunk = chunks[i];
            if (chunk.length === 1) {
                // Just a single item, so make the rep/color submenus.
                let item = chunk[0];
                if (item === undefined) {
                    item = "N/A";
                    menuBranch[item] = function() { return; };
                } else {
                    menuBranch[item] = {};
                    menuBranch[item] = makeRepColorSchemeSubMenus(menuBranch[item], component, (rep: any, colorScheme: any) => {
                        /** @type {string} */
                        const selKeyword = selKeywords[component];  // See ThreeDMol.ts
                        const it = {};
                        it[selKeyword] = item;
                        VisStyles.toggleRep([it], rep, colorScheme);
                    }, breadcrumbs.concat([item]));
                }
            } else {
                // Multiple items, so it's a category.
                const lbl = "[" + chunk[0].toString() + "-" + chunk[chunk.length - 1].toString() + "]";
                menuBranch[lbl] = {};
                addToMenuRecurse(component, menuBranch[lbl], chunk, breadcrumbs.concat([lbl]));
            }
        }

        // Also add in things like back buttons.
        Menu3D.setupSubMenuNavButtons(
            menuBranch, breadcrumbs,
        );
    };

    // Add in selections specific to this protein.
    const cs = Object.keys(ThreeDMol.atomicInfo);
    const len = cs.length;
    for (let i = 0; i < len; i++) {
        const component = cs[i];
        // component is like "Element"

        const sels = ThreeDMol.atomicInfo[component];
        menuInf["Styles"]["Selections"][component] = {};

        addToMenuRecurse(
            component, menuInf["Styles"]["Selections"][component],
            sels, ["Styles", "Selections", component],
        );
    }
}

/**
 * Takes an array and divides it into subarrays that are roughly equally
 * spaced.
 * @param  {Array<*>} arr        The array.
 * @param  {number}   numChunks  The number of subarrays.
 * @returns Array<Array<*>>  An array of arrays.
 */
function chunkify(arr: any[], numChunks: number): any[] {
    // see
    // https://stackoverflow.com/questions/8188548/splitting-a-js-array-into-n-arrays
    if (numChunks < 2) {
        return [arr];
    }

    const len = arr.length;
    const out = [];
    let i = 0;
    let size;

    if (len % numChunks === 0) {
        size = Math.floor(len / numChunks);
        while (i < len) {
            out.push(arr.slice(i, i += size));
        }
    } else {
        while (i < len) {
            size = Math.ceil((len - i) / numChunks--);
            out.push(arr.slice(i, i += size));
        }
    }

    return out;
}

/**
 * Adds representative and color submenus.
 * @param  {Object}        menuBranch      The branch to which to add these
 *                                         submenus.
 * @param  {string}        component       Like "Protein".
 * @param  {Function}      clickFunc       The function to run when the
 *                                         buttons of this submenu are
 *                                         clicked.
 * @param  {Array<string>} [breadcrumbs=]  If given, this is used to add
 *                                         buttons like the Back button.
 * @returns Object                         The submenu object, now updated.
 */
function makeRepColorSchemeSubMenus(menuBranch: any, component: string, clickFunc: any, breadcrumbs?: string[]): any {
    // What representations can you use? Default to Protein because it
    // contains them all.
    /** @type Object<string,*> */
    const repsToUse = (representations[component] === undefined) ?
                    representations["Protein"] :
                    representations[component];  // Like ["Cartoon"]

    /** @type {number} */
    const repsToUseLen = repsToUse.length;
    for (let i = 0; i < repsToUseLen; i++) {
        /** @type {string} */
        const rep = repsToUse[i];
        menuBranch[rep] = {
            "Colors": {},
            "Color Schemes": {},
        };

        const colorSchemesLen = colorSchemes.length;
        for (let i = 0; i < colorSchemesLen; i++) {
            /** @type {string} */
            const colorScheme = colorSchemes[i];
            menuBranch[rep]["Color Schemes"][colorScheme] = () => {
                clickFunc(rep, colorScheme);
                // Menu3D.openMainMenuFloorButton.toggled();
            };
        }

        /** @type {number} */
        const colorsLen = colors.length;
        for (let i = 0; i < colorsLen; i++) {
            /** @type {string} */
            const color = colors[i];
            menuBranch[rep]["Colors"][color] = () => {
                clickFunc(rep, color);
                // Menu3D.openMainMenuFloorButton.toggled();
            };
        }

        menuBranch[rep]["Hide"] = () => {
            clickFunc(rep, "Hide");
            // Menu3D.openMainMenuFloorButton.toggled();
        };

        // Also add in things like back buttons.
        if (breadcrumbs !== undefined) {
            let newCrumbs = breadcrumbs.concat([rep]);
            Menu3D.setupSubMenuNavButtons(menuBranch[rep], newCrumbs);

            newCrumbs = breadcrumbs.concat([rep, "Colors"]);
            let newBranch = menuBranch[rep]["Colors"];
            Menu3D.setupSubMenuNavButtons(newBranch, newCrumbs);

            newCrumbs = breadcrumbs.concat([rep, "Color Schemes"]);
            newBranch = menuBranch[rep]["Color Schemes"];
            Menu3D.setupSubMenuNavButtons(newBranch, newCrumbs);
        }
    }

    if (breadcrumbs !== undefined) {
        Menu3D.setupSubMenuNavButtons(menuBranch, breadcrumbs);
    }

    return menuBranch;
}
