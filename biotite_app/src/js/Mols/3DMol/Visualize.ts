// Functions to create a protein visualization using 3DMol.js

import * as Optimizations from "../../Scene/Optimizations";
import * as Menu3D from "../../UI/Menu3D/Menu3D";
import * as UrlVars from "../../UrlVars";
import * as Vars from "../../Vars";
import * as PositionInScene from "./PositionInScene";
import * as VRML from "./VRML";

declare var $3Dmol;

// A place to keep track of all the styles. List of [key, vals]
// let styles: any[] = [];

let currentSurface = undefined;

// Where the meshes generated from 3DMol.js get stored.
interface IStyleMesh {
    mesh: any;
    categoryKey: string;  // Everything but color. Obj key will include color (for lookup).
}
export let styleMeshes: {[s: string]: IStyleMesh} = {};

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
    "Amino Acid": {"colorscheme": "amino"},
    "Blue": {"color": "blue"},
    "Chain": {"colorscheme": "chain"},
    "Element": {"colorscheme": "default"},
    "Green": {"color": "green"},
    "Nucleic": {"colorscheme": "nucleic"},
    "Orange": {"color": "orange"},
    "Purple": {"color": "purple"},
    "Red": {"color": "red"},
    "Spectrum": {"color": "spectrum"},
    "White": {"color": "white"},
    "Yellow": {"color": "yellow"},
};

// Ligand?

// All residus? Chains? Elements? Others here... https://3dmol.csb.pitt.edu/doc/types.html#AtomSpec

/**
 * The toggleRep function. Starts the mesh-creation proecss.
 * @param  {Array<*>}            filters        Can include strings (lookup
 *                                              sel in selKeyWordTo3DMolSel).
 *                                              Or a 3DMoljs selection object.
 * @param  {string}              repName        The representative name. Like
 *                                              "Surface".
 * @param  {string}              colorScheme    The name of the color scheme.
 * @param  {Function|undefined}  finalCallback  Callback to run once the mesh
 *                                              is entirely done.
 * @returns void
 */
export function toggleRep(filters: any[], repName: string, colorScheme: string, finalCallback= undefined): void {
    // Get the key of this rep request.
    let keys = getKeys(filters, repName, colorScheme);

    if (finalCallback === undefined) {
        finalCallback = () => { return; };
    }

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

        // Still need to position the meshes (hiding some reps could make others bigger).
        PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));

        // Update the URL
        UrlVars.setURL();

        // Recalculate the menu
        Menu3D.setup();

        return;
    }

    // Maybe the mesh has been generated previously. If so, just show that.
    if (styleMeshes[keys.fullKey] !== undefined) {
        styleMeshes[keys.fullKey].mesh.isVisible = true;
        console.log("showing existing mesh...");

        // Still need to position the meshes (hiding some reps could make others bigger).
        PositionInScene.positionAll3DMolMeshInsideAnother(undefined, Vars.scene.getMeshByName("protein_box"));

        // Update the URL
        UrlVars.setURL();

        // Recalculate the menu
        Menu3D.setup();

        return;
    }

    // You'll need to use 3DMoljs to generate the mesh, since it's never been
    // generated before. First remove all representations from existing
    // 3Dmoljs.
    // let viewer = VRML.viewer;
    // VRML.removeAllSurfaces();
    // VRML.setStyle({}, undefined);
    // console.log("Abovee causes an error...");
    VRML.resetAll();
    // VRML.viewer.render();

    // Make the new representation.
    let colorSccheme = colorSchemeKeyWordTo3DMol[colorScheme];
    let sels = {"and": filters.map((i) => {
        // "i" can be a keyword or a selection json itself.
        return (selKeyWordTo3DMolSel[i] !== undefined) ? selKeyWordTo3DMolSel[i] : i;
    })};

    if (repName.toLowerCase() === "surface") {
        VRML.addSurface(colorSccheme, sels, () => {
            toggleRepContinued(keys, repName, finalCallback);
        });
    } else {
        let rep = {};
        rep[repName.toLowerCase()] = colorSccheme;
        VRML.setStyle(sels, rep);
        toggleRepContinued(keys, repName, finalCallback);
    }
}

/**
 * Continues the toggleRep function.
 * @param  {Object<string,*>}    keys
 * @param  {string}              repName        The representative name. Like
 *                                              "Surface".
 * @param  {Function|undefined}  finalCallback  Callback to run once the mesh
 *                                              is entirely done.
 * @returns void
 */
function toggleRepContinued(keys: any, repName: string, finalCallback): void {
    VRML.render(true, repName, (newMesh) => {
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

        // If the new mesh is a surface, make it so each triangle is two sided
        // and delete the surface from 3Dmoljs instance (cleanup).
        if (repName === "Surface") {
            newMesh.material.backFaceCulling = false;

            // if (currentSurface !== undefined) {
                // debugger;
                // VRML.viewer.removeSurface(currentSurface["surfid"]);
                // currentSurface = undefined;
            // }
        }

        // Add this new one.
        styleMeshes[keys.fullKey] = {
            categoryKey: keys.categoryKey,
            mesh: newMesh,
        };

        // Update the URL
        UrlVars.setURL();

        // Recalculate the menu
        Menu3D.setup();

        finalCallback();

        console.log("added new mesh");
    });
}

/**
 * Get keys to uniquelty describe a given representations.
 * @param  {Array<string|Object>} filters      Selections. Can be keywords or
 *                                             3dmoljs selection objects.
 * @param  {string}               repName      The name of the representation,
 *                                             e.g., "Cartoon".
 * @param  {string}               colorScheme  The color style keyword.
 */
function getKeys(filters: string[], repName: string, colorScheme: string) {
    filters.sort();
    let filtersStr = filters.map((f) => {
        if (typeof f === "string") {
            return f;
        } else {
            return JSON.stringify(f);
        }
    });  // In case some JSON selections.

    return {
        categoryKey: filtersStr.join("--") + "--" + repName,
        fullKey: filtersStr.join("--") + "--" + repName + "--" + colorScheme,
    };
}

/**
 * Also adds upper and lower versions of elements in a list.
 * @param  {Array<string>} lst  The original list.
 * @returns string  The list with uppercase and lowercase items also added.
 */
function lAndU(lst: string[]): string[] {
    let newLst = lst.map((s) => s);
    for (let s of lst) {
        newLst.push(s.toUpperCase());
        newLst.push(s.toLowerCase());
    }

    // See https://gomakethings.com/removing-duplicates-from-an-array-with-vanilla-javascript/
    newLst = newLst.filter((item, index) => {
        return newLst.indexOf(item) >= index;
    });

    return newLst;
}

// export function
