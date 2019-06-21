import * as ThreeDMol from "../../Mols/3DMol/ThreeDMol";
import * as Visualize from "../../Mols/3DMol/Visualize";
import * as UrlVars from "../../UrlVars";
import * as Menu3D from "./Menu3D";

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

// You'll need to modify colorSchemeKeyWordTo3DMol in Visualize.ts too.
let colors = [
    "White", "Red", "Blue", "Green", "Orange", "Yellow", "Purple",
];

let colorSchemes = [
    "Element", "Amino Acid", "Chain", "Nucleic", "Spectrum",
];

/**
 * Makes submenus required for the various style options (reps, colors, etc.).
 * @returns Object
 */
export function buildStylesSubMenu(): any {
    let menu = {
        "Components": {},
        "Selections": {},
        "Clear": () => {
            for (let fullKey in Visualize.styleMeshes) {
                if (Visualize.styleMeshes.hasOwnProperty(fullKey)) {
                    let styleMesh = Visualize.styleMeshes[fullKey];
                    styleMesh.mesh.isVisible = false;
                }
            }
            Menu3D.openMainMenuFloorButton.toggled();
        },
        "Remove Existing": {},
    };

    // Add in the standard selections (ligand, protein, etc).
    for (let component of components) {
        menu["Components"][component] = {};
        for (let selection of selections[component]) {
            menu["Components"][component][selection] = makeRepColorSchemeSubMenus({}, component, (rep, colorScheme) => {
                Visualize.toggleRep([component, selection], rep, colorScheme);
            });
        }
    }

    // Selection keywords
    let selKeywords = {
        "Atom Name": "atom",
        "Chain": "chain",
        "Element": "elem",
        "Residue Index": "resi",
        "Residue Name": "resn",
        "Secondary Structure": "ss",
    };

    let maxNumPerGroup = 14;
    let addToMenuRecurse = (component: string, menuBranch: any, items: any[]) => {
        items.sort((x, y) => {
            // If either is a string number, convert to number.
            x = isNaN(+x) ? x : +x;
            y = isNaN(+y) ? y : +y;

            if (x < y) { return -1; }
            if (x > y) { return 1; }
            return 0;
        });

        // So divide it into maxNumPerGroup groups.
        let chunks = chunkify(items, maxNumPerGroup);

        for (let chunk of chunks) {
            if (chunk.length === 1) {
                // Just a single item, so make the rep/color submenus.
                let item = chunk[0];
                menuBranch[item] = {};
                menuBranch[item] = makeRepColorSchemeSubMenus(menuBranch[item], component, (rep, colorScheme) => {
                    let selKeyword = selKeywords[component];  // See ThreeDMol.ts
                    let it = {};
                    it[selKeyword] = item;
                    Visualize.toggleRep([it], rep, colorScheme);
                });
            } else {
                // Multiple items, so it's a category.
                let lbl = "[" + chunk[0].toString() + "-" + chunk[chunk.length - 1].toString() + "]";
                menuBranch[lbl] = {};
                addToMenuRecurse(component, menuBranch[lbl], chunk);
            }
        }
    };

    // Add in selections specific to this protein.
    for (let component in ThreeDMol.atomicInfo) {
        if (ThreeDMol.atomicInfo.hasOwnProperty(component)) {
            // component is like "Element"

            let sels = ThreeDMol.atomicInfo[component];
            menu["Selections"][component] = {};

            addToMenuRecurse(component, menu["Selections"][component], sels);
        }
    }

    return menu;
}

/**
 * Populates the portion of the styles menu that lets the user remove old
 * styles.
 * @param  {any} menuInf
 * @returns void
 */
export function updatePastStylesInMenu(menuInf: any): void {
    // Also add in existing styles so they can be removed.
    menuInf["Styles"]["Remove Existing"] = {};
    Menu3D.setupSubMenuNavButtons(
        menuInf["Styles"]["Remove Existing"],
        ["Styles", "Remove Existing"],
    );

    for (let repName in Visualize.styleMeshes) {
        if (Visualize.styleMeshes.hasOwnProperty(repName)) {
            if (Visualize.styleMeshes[repName].mesh.isVisible === true) {
                let lbl = repName.replace(/--/g, " ");
                lbl = lbl.replace(/{/g, "").replace(/}/g, "").replace(/"/g, "");
                menuInf["Styles"]["Remove Existing"][lbl] = () => {
                    Menu3D.openMainMenuFloorButton.toggled();
                    setTimeout(() => {
                        let repInfo = UrlVars.extractRepInfoFromKey(repName);
                        Visualize.toggleRep(repInfo[0], repInfo[1], "Hide");
                    }, 0);
                };
            }
        }
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

    let len = arr.length;
    let out = [];
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
 * @param  {Object}    menuBranch  The branch to which to add these submenus.
 * @param  {string}    component   Like "Protein".
 * @param  {Function}  clickFunc   The function to run when the buttons of
 *                                 this submenu are clicked.
 * @returns Object                 The submenu object, now updated.
 */
function makeRepColorSchemeSubMenus(menuBranch: any, component: string, clickFunc: any): any {
    // What representations can you use? Default to Protein because it
    // contains them all.
    let repsToUse = (representations[component] === undefined) ?
                    representations["Protein"] :
                    representations[component];

    for (let rep of repsToUse) {
        menuBranch[rep] = {
            "Colors": {},
            "Color Schemes": {},
        };
        for (let colorScheme of colorSchemes) {
            menuBranch[rep]["Color Schemes"][colorScheme] = () => {
                clickFunc(rep, colorScheme);
                Menu3D.openMainMenuFloorButton.toggled();
            };
        }
        for (let color of colors) {
            menuBranch[rep]["Colors"][color] = () => {
                clickFunc(rep, color);
                Menu3D.openMainMenuFloorButton.toggled();
            };
        }
        menuBranch[rep]["Hide"] = () => {
            clickFunc(rep, "Hide");
            Menu3D.openMainMenuFloorButton.toggled();
        };
    }
    return menuBranch;
}
