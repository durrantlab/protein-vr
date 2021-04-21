// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Functions to create a protein visualization using 3DMol.js

import * as Optimizations from "../../Scene/Optimizations";
import * as Menu3D from "../../UI/Menus/Menu3D/Menu3D";
import * as Styles from "../../UI/Menus/Menu3D/Styles";
import * as UrlVars from "../../Vars/UrlVars";
import * as Vars from "../../Vars/Vars";
import * as PositionInScene from "./PositionInScene";
import * as VRML from "./VRML";
import * as Lecturer from "../../WebRTC/Lecturer";
import { HookTypes, runHooks } from "../../Plugins/Hooks/Hooks";

declare var $3Dmol;

// Where the meshes generated from 3DMol.js get stored.
interface IStyleMesh {
    mesh: any;
    categoryKey: string;  // Everything but color. Obj key will include color (for lookup).
}
export let styleMeshes: {[s: string]: IStyleMesh} = {};

const selKeyWordTo3DMolSel = {
    // See VMD output TCL files for good ideas. You may nee to look at
    // Styles.ts too.
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
                                   "T", "URA", "U", "DA", "DG", "DC", "DT"])},
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

// Add in all within ligand
selKeyWordTo3DMolSel["Ligand Context"] = {
    "byres": true,
    "within": {
        "distance": 4.0,
        "sel": selKeyWordTo3DMolSel["Ligand"],
    },
};

const colorSchemeKeyWordTo3DMol = {
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
    "B Factor": {"colorscheme": {"prop": "b", "gradient": undefined, "min": undefined, "max": undefined, "mid": undefined}},
    "Atom Index": {"colorscheme": {"prop": "serial", "gradient": undefined, "min": undefined, "max": undefined, "mid": undefined}},
    "Secondary Structure": {"colorscheme": {"prop":'ss', "map":$3Dmol["ssColors"]['Jmol']}}
    // "Secondary Structure": {"colorscheme": {"prop":'ss', "map":$3Dmol["ssColors"]['pyMol']}}
};

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
export function toggleRep(filters: any[], repName: string, colorScheme: string, finalCallback: any = undefined): void {
    if (Lecturer.isLecturerBroadcasting) {
        // Let the student know about this change...
        Lecturer.sendToggleRepCommand(filters, repName, colorScheme);
    }

    // Get the key of this rep request.
    /** @type {Object<string,*>} */
    const keys = getKeys(filters, repName, colorScheme);

    if (finalCallback === undefined) {
        finalCallback = () => { return; };
    }

    // If it's "Hide", then just hide the mesh
    if (colorScheme === "Hide") {
        const fullKeys = Object.keys(styleMeshes);
        const len = fullKeys.length;
        for (let i = 0; i < len; i++) {
            const fullKey = fullKeys[i];
            const styleMesh = styleMeshes[fullKey];
            if (styleMesh.categoryKey === keys.categoryKey) {
                styleMesh.mesh.isVisible = false;
                console.log("Hiding existing mesh...");
            }
        }

        // Still need to position the meshes (hiding some reps could make
        // others bigger).
        PositionInScene.positionAll3DMolMeshInsideAnother(
            undefined, Vars.scene.getMeshByName("protein_box")
        );

        visChanged();

        return;
    }

    // Maybe the mesh has been generated previously. If so, just show that.
    if (styleMeshes[keys.fullKey] !== undefined) {
        styleMeshes[keys.fullKey].mesh.isVisible = true;
        console.log("showing existing mesh...");

        // Still need to position the meshes (hiding some reps could make
        // others bigger).
        PositionInScene.positionAll3DMolMeshInsideAnother(
            undefined, Vars.scene.getMeshByName("protein_box")
        );

        visChanged();

        return;
    }

    // You'll need to use 3DMoljs to generate the mesh, since it's never been
    // generated before. First remove all representations from existing
    // 3Dmoljs.
    VRML.resetAll();

    // Make the new representation.
    /** @type {string} */
    const repParams = colorSchemeKeyWordTo3DMol[colorScheme];
    const sels = {"and": filters.map((i: number) => {
        // "i" can be a keyword or a selection json itself.
        return (selKeyWordTo3DMolSel[i] !== undefined) ? selKeyWordTo3DMolSel[i] : i;
    })};

    // Custom tweaks to representations go here.
    let range, gradient;
    switch (colorScheme) {
        case "B Factor":
            // rescale based on b factor range.
            // new $3Dmol["Gradient"]["Sinebow"](0,50)
            range = $3Dmol["getPropertyRange"](
                VRML.viewer["selectedAtoms"](), 'b'
            );
            // let gradient = $3Dmol["Gradient"]["RWB"](range);  // range[0], range[1]); // , 0.5 * (range[0] + range[1]))
            gradient = "rwb" // {'gradient':'rwb','min':1,'max':-1,'mid':0}
            // let gradient = new $3Dmol["Gradient"]["Sinebow"](range);
            repParams["colorscheme"]["gradient"] = gradient;
            repParams["colorscheme"]["min"] = range[0];
            repParams["colorscheme"]["max"] = range[1];
            repParams["colorscheme"]["mid"] = 0.5 * (range[0] + range[1]);
            break;
        case "Atom Index":
            range = $3Dmol["getPropertyRange"](
                VRML.viewer["selectedAtoms"](), 'serial'
            );
            // let gradient = $3Dmol["Gradient"]["RWB"](range);  // range[0], range[1]); // , 0.5 * (range[0] + range[1]))
            gradient = "rwb" // {'gradient':'rwb','min':1,'max':-1,'mid':0}
            // let gradient = new $3Dmol["Gradient"]["Sinebow"](range);
            repParams["colorscheme"]["gradient"] = gradient;
            repParams["colorscheme"]["min"] = range[0];
            repParams["colorscheme"]["max"] = range[1];
            repParams["colorscheme"]["mid"] = 0.5 * (range[0] + range[1]);
            break;
    }

    switch (repName) {
        case "Cartoon":
            // Make this look better than default rectangle?
            repParams["style"] = "oval";
            // repParams["thickness"] = "0.5";  // Seems to degrade quality
            repParams["arrows"] = true;
            break;
        case "Trace":
            repName = "Cartoon";
            repParams["style"] = "trace";
            break;
        case "Ribbon":
            repName = "Cartoon";
            repParams["ribbon"] = true;
            break;
        case "Tubes":
            repName = "Cartoon";
            repParams["tubes"] = true;
            break;
        }

    if (repName.toLowerCase() === "surface") {
        VRML.addSurface(repParams, sels, () => {
            toggleRepContinued(keys, repName, finalCallback);
        });
    } else {
        const rep = {};
        rep[repName.toLowerCase()] = repParams;
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
function toggleRepContinued(keys: any, repName: string, finalCallback: any): void {
    VRML.render(true, repName, (newMesh: any) => {
        // Remove any other meshes that have the same category key (so could
        // be different color... that would be removed.)
        const ks = Object.keys(styleMeshes);
        const len = ks.length;
        for (let i = 0; i < len; i++) {
            const key = ks[i];
            const styleMesh = styleMeshes[key];
            if (styleMesh.categoryKey === keys.categoryKey) {
                Optimizations.removeMeshEntirely(styleMesh.mesh);
                delete styleMeshes[key];
                console.log("deleting old mesh...");
            }
        }

        if (newMesh !== undefined) {
            // newMesh is undefined if you tried to select something not
            // present in the scene (e.g., trying to select nucleic when there
            // is no nucleic in the model).

            // If the new mesh is a surface, make it so each triangle is two
            // sided and delete the surface from 3Dmoljs instance (cleanup).
            if (repName === "Surface") {
                newMesh.material.backFaceCulling = false;
            }

            // Add this new one.
            styleMeshes[keys.fullKey] = {
                categoryKey: keys.categoryKey,
                mesh: newMesh,
            };
        }

        visChanged();

        finalCallback();
    });
}

/**
 * Get keys to uniquely describe a given representations.
 * @param  {Array<string|Object>} filters      Selections. Can be keywords or
 *                                             3dmoljs selection objects.
 * @param  {string}               repName      The name of the representation,
 *                                             e.g., "Cartoon".
 * @param  {string}               colorScheme  The color style keyword.
 * @returns {Object<string,*>}
 */
function getKeys(filters: string[], repName: string, colorScheme: string): any {
    filters.sort();
    const filtersStr = filters.map((f: any) => {
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
 * @returns {Array<string>}  The list with uppercase and lowercase items also added.
 */
function lAndU(lst: string[]): string[] {
    let newLst = lst.map((s) => s);
    const len = lst.length;
    for (let i = 0; i < len; i++) {
        const s = lst[i];
        newLst.push(s.toUpperCase());
        newLst.push(s.toLowerCase());
    }

    // See https://gomakethings.com/removing-duplicates-from-an-array-with-vanilla-javascript/
    newLst = newLst.filter((item: any, index: number) => {
        return newLst.indexOf(item) >= index;
    });

    return newLst;
}

/**
 * This runs whenever a visualization changes, no matter how it changes.
 * @returns void
 */
function visChanged(): void {
        // Update the URL
        UrlVars.setURL();

        // Recalculate the past-styles section of the menu.
        Styles.updatePastStylesInMenu(Menu3D.menuInf);

        runHooks(HookTypes.ON_ADD_OR_REMOVE_MOL_MESH);
}
