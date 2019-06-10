// Functions to create a protein visualization using 3DMol.js

import * as Optimizations from "../../Scene/Optimizations";
import * as Vars from "../../Vars";
import * as VRML from "./VRML";

declare var $3Dmol;

// A place to keep track of all the styles. List of [key, vals]
// let styles: any[] = [];

// Where the meshes generated from 3DMol.js get stored.
interface IStyleMesh {
    mesh: any;
    categoryKey: string;  // Everything but color. Obj key will include color (for lookup).
}
let styleMeshes: {[s: string]: IStyleMesh} = {};

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
    let keys = getKeys(filters, repName, colorScheme);

    // If it's "Hide", then just hide the mesh
    if (colorScheme === "Hide") {
        for (let fullKey in styleMeshes) {
            if (styleMeshes.hasOwnProperty(fullKey)) {
                let styleMesh = styleMeshes[fullKey];
                if (styleMesh.categoryKey === keys.categoryKey) {
                    styleMesh.mesh.isVisible = false;
                    console.log("Hiding existing mesh...");
                }
            }
        }
        return;
    }

    // Maybe the mesh has been generated previously. If so, just show that.
    if (styleMeshes[keys.fullKey] !== undefined) {
        styleMeshes[keys.fullKey].mesh.isVisible = true;
        console.log("showing existing mesh...");
        return;
    }

    // You'll need to use 3DMoljs to generate the mesh, since it's never been
    // generated before. First remove all representations from existing
    // 3Dmoljs.
    VRML.viewer.setStyle({});

    // Make the new representation.
    let colorSccheme = colorSchemeKeyWordTo3DMol[colorScheme];
    let sels = {"and": filters.map((i) => selKeyWordTo3DMolSel[i])};

    if (repName.toLowerCase() === "surface") {
        VRML.viewer.addSurface(
            $3Dmol.SurfaceType.MS,
            colorSccheme,
            sels,
            undefined,
            undefined,
            () => {
                toggleRepContinued(keys);
            },
        );
    } else {
        let rep = {};
        rep[repName.toLowerCase()] = colorSccheme;
        VRML.viewer.addStyle(sels, rep);
        toggleRepContinued(keys);
    }
}

/**
 * Continues the toggleRep function.
 * @param  {Object<string,*>} keys
 * @returns void
 */
function toggleRepContinued(keys: any): void {
    VRML.render(true, (newMesh) => {
        // Remove any other meshes that have the same category key (so could
        // be different color... that would be removed.)
        for (let i in styleMeshes) {
            if (styleMeshes.hasOwnProperty(i)) {
                let styleMesh = styleMeshes[i];
                if (styleMesh.categoryKey === keys.categoryKey) {
                    Optimizations.removeMeshEntirely(styleMesh.mesh);
                    delete styleMeshes[i];
                    console.log("deleting old mesh...");
                }
            }
        }

        // Add this new one.
        styleMeshes[keys.fullKey] = {
            categoryKey: keys.categoryKey,
            mesh: newMesh,
        };

        console.log("added new mesh");

        console.log(styleMeshes);
    });
}

function getKeys(filters: string[], repName: string, colorScheme: string) {
    filters.sort();
    return {
        categoryKey: filters.join("-") + "-" + repName,
        fullKey: filters.join("-") + "-" + repName + "-" + colorScheme,
    };
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
