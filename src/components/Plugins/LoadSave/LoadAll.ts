// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import { LoadRemoteFile } from "./LoadRemoteFile/LoadRemoteFile";
import { LoadLocalFile } from "./LoadLocalFile/LoadLocalFile";
import { LoadPdbSdfText } from "./LoadPdbSdfText/LoadPdbSdfText";
import { SaveSceneFile } from "./SaveSceneFile/SaveSceneFile";
import { SaveQRCode } from "./QRCode/QRCode";
import { SaveModel } from "./SaveModel/SaveModel";

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
    plugins.push(new LoadRemoteFile());
    plugins.push(new LoadLocalFile());
    plugins.push(new LoadPdbSdfText());
    plugins.push(new New());
    plugins.push(new SaveSceneFile());
    plugins.push(new SaveQRCode());
    plugins.push(new SaveModel());

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
        // let pluginVueComponentClass = plugin.vuePanelComponent();
        // new pluginVueComponentClass().load(Vue);
        plugin.load(Vue);
    }

    // Also register the common comments used to support the various load/save
    // components.
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

    // Virtually click on tab header of selected tab. This is important for
    // regenerating the QR code if the URL has changed, for example.
    let currentTabPlugin = store.state["loadSaveModal"]["currentTabPlugin"];
    if (currentTabPlugin !== undefined) {
        currentTabPlugin.methods.onTabHeaderClick();
    }
}
