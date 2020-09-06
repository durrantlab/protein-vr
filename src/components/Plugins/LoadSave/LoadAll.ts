import { PDBUrl } from "./PDBUrl/PDBUrl";
import { LoadPdbSdfFile } from "./LoadPdbSdfFile/LoadPdbSdfFile";
import { LoadPdbSdfText } from "./LoadPdbSdfText/LoadPdbSdfText";
import { LoadSceneFile } from "./LoadSceneFile/LoadSceneFile";
import { SaveSceneFile } from "./SaveSceneFile/SaveSceneFile";
import { New } from "./New/New";
import { LoadSaveParent } from "./LoadSaveParent";
import { store } from "../../Vars/VueX/VueXStore";
import { getLoadSaveCommonComponents } from "./VueComponentsCommon/LoadSaveCommonComponents";

declare var Vue;

/**
 * Returns a list of all LoadSave plugin clases
 * @returns any[]  The list of plugin classes (not objects).
 */
export function getPlugins(): LoadSaveParent[] {
    let plugins = [];
    plugins.push(new PDBUrl());
    plugins.push(new LoadPdbSdfFile());
    plugins.push(new LoadPdbSdfText());
    plugins.push(new New());
    plugins.push(new LoadSceneFile());
    plugins.push(new SaveSceneFile());

    loadVuePlugins(plugins);

    return plugins;
}

/**
 * Loads the LoadSave Vue plugins into Vue.
 * @param  {any[]} plugins
 * @returns void
 */
function loadVuePlugins(plugins: any[]): void {
    // The loadSave plugins also produce Vue components that need to be
    // registered.
    // let loadSavePlugins = getPluginsOfType("loadSave");
    for(let plugin of plugins) {
        let pluginVueComponentClass = plugin.vuePanelComponent();
        new pluginVueComponentClass().load(Vue);
    }

    for (let component of getLoadSaveCommonComponents()) {
        new component().load(Vue);
    }
}

/**
 * Opens the LoadSave modal.
 * @returns void
 */
export function openLoadSaveModal(): void {
    store.commit("setVar", {
        moduleName: "loadSaveModal",
        varName: "showLoadSaveModal",
        val: true
    });

    // let modalObj = jQuery('#load-save-modal');
    // modalObj["modal"]();
}
