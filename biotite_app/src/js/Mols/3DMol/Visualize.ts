// Functions to create a protein visualization using 3DMol.js

import * as Vars from "../../Vars";
import * as VRML from "./VRML";

// A place to keep track of all the styles. List of [key, vals]
let styles: any[] = [];

let selKeyWordTo3DMolSel = {
    // See VMD output TCL files for good ideas.
    "All":         {},
    "Protein":     {"resn": lAndU(["ALA", "ARG", "ASP", "ASN", "ASX", "CYS",
                                   "GLN", "GLU", "GLX", "GLY", "HIS", "HSP",
                                   "HYP", "ILE", "LEU", "LYS", "MET", "PCA",
                                   "PHE", "PRO", "TRP", "TYR", "VAL", "GLU",
                                   "SER", "THR", "MSE"])},
    "Acidic":      {"resn": lAndU(["ASP", "GLU"])},
    "Cyclic":      {"resn": lAndU(["HIS", "PHE", "PRO", "TRP", "TYR"])},
    "Aliphatic":   {"resn": lAndU(["ALA", "GLY", "ILE", "LEU", "VAL"])},
    "Aromatic":    {"resn": lAndU(["HIS", "PHE", "TRP", "TYR"])},
    "Basic":       {"resn": lAndU(["ARG", "HIS", "LYS", "HSP"])},
    "Charged":     {"resn": lAndU(["ASP", "GLU", "ARG", "HIS", "LYS", "HSP"])},
    "Hydrophobic": {"resn": lAndU(["ALA", "LEU", "VAL", "ILE", "PRO", "PHE",
                                   "MET", "TRP"])},
    "Neutral":     {"resn": lAndU(["VAL", "PHE", "GLN", "TYR", "HIS", "CYS",
                                   "MET", "TRP", "ASX", "GLX", "PCA", "HYP"])},
    "Nucleic":     {"resn": lAndU(["ADE", "A", "GUA", "G", "CYT", "C", "THY",
                                   "T", "URA", "U"])},
    "Purine":      {"resn": lAndU(["ADE", "A", "GUA", "G"])},
    "Pyrimidine":  {"resn": lAndU(["CYT", "C", "THY", "T", "URA", "U"])},
    "Ions":        {"resn": lAndU(["AL", "BA", "CA", "CAL", "CD", "CES", "CLA",
                                   "CL", "CO", "CS", "CU", "CU1", "CUA", "HG",
                                   "IN", "IOD", "K", "MG", "MN3", "MO3", "MO4",
                                   "MO5", "MO6", "NA", "NAW", "OC7", "PB",
                                   "POT", "PT", "RB", "SOD", "TB", "TL", "WO4",
                                   "YB", "ZN", "ZN1", "ZN2"])},
    "Water":     {"resn": lAndU(["WAT", "HOH", "TIP", "TIP3"])},
};

// Add in ligand
selKeyWordTo3DMolSel["Ligand"] = {"not": {"or": [
    selKeyWordTo3DMolSel["Protein"],
    selKeyWordTo3DMolSel["Nucleic"],
    selKeyWordTo3DMolSel["Ions"],
    selKeyWordTo3DMolSel["Water"],
]}};

let colorSchemeKeyWordTo3DMol = {
    "Element": {"colorscheme": "default"},
    "Red": {"color": "red"},
    "Blue": {"color": "blue"},
    "Green": {"color": "green"},
    "Orange": {"color": "orange"},
    "Yellow": {"color": "yellow"},
    "Purple": {"color": "purple"},
    "Spectrum": {"color": "spectrum"},
};

// Ligand?

// All residus? Chains? Elements? Others here... https://3dmol.csb.pitt.edu/doc/types.html#AtomSpec

export function toggleRep(filters: string[], repName: string, colorScheme: string): void {
    // Get the key of this rep request.
    let key = getKey(filters, repName, colorScheme);

    if (styles.map((i) => i[0]).indexOf(key) !== -1) {
        // If it already exists in styles, remove it.
        styles = styles.filter((i) => i[0] !== key);
    } else {
        // Otherwise add it.
        styles.push([key, {filters, repName, colorScheme}]);
    }

    // Remove all representations from existing 3Dmoljs.
    VRML.viewer.setStyle({});

    // console.log("Styles", styles);

    // Now go through each of the styles and add it to the viewer.
    for (let i in styles) {
        if (styles.hasOwnProperty(i)) {
            let iInt = parseInt(i, 10);
            let style = styles[iInt];
            let filts = style[1].filters;
            let color = style[1].colorScheme;
            let rep = {};
            rep[style[1].repName.toLowerCase()] = colorSchemeKeyWordTo3DMol[color];
            let sels = {"and": filts.map((i) => selKeyWordTo3DMolSel[i])};
            // console.log(JSON.stringify(sels), JSON.stringify(rep));
            VRML.viewer.addStyle(sels, rep);
        }
    }
    VRML.render();
}

function getKey(filters: string[], repName: string, colorScheme: string) {
    filters.sort();
    return filters.join("-") + "-" + repName + "-" + colorScheme;
}

/**
 * Also adds upper and lower versions of elements in a list.
 * @param  {string[]} lst  The original list.
 * @returns string  The list with uppercase and lowercase items also added.
 */
function lAndU(lst: string[]): string[] {
    let newLst = lst.map((s) => s);
    for (let i in lst) {
        if (lst.hasOwnProperty(i)) {
            let s = lst[i];
            newLst.push(s.toUpperCase());
            newLst.push(s.toLowerCase());
        }
    }

    // See https://gomakethings.com/removing-duplicates-from-an-array-with-vanilla-javascript/
    newLst = newLst.filter((item, index) => {
        return newLst.indexOf(item) >= index;
    });

    return newLst;
}

// export function
