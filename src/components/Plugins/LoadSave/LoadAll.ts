import { PDBUrl } from "./PDBUrl/PDBUrl";
import { SceneFile } from "./SceneFile/SceneFile";
import { LoadSaveParent } from "./Parent";
import { store } from "../../UI/Vue/VueX/VueXStore";

/**
 * Returns a list of all LoadSave plugin clases
 * @returns any[]  The list of plugin classes (not objects).
 */
export function getPlugins(): LoadSaveParent[] {
    let plugins = [];
    plugins.push(new PDBUrl());
    plugins.push(new SceneFile());

    return plugins;
}

export function openLoadSaveModal(): void {
    store.commit("setVar", {
        moduleName: "loadSaveModal",
        varName: "showLoadSaveModal",
        val: true
    });

    // let modalObj = jQuery('#load-save-modal');
    // modalObj["modal"]();
}
