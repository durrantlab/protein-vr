import * as LoadSavePDBUurl from "./LoadSave/PDBUrl";
import * as LoadSaveSceneFile from "./LoadSave/SceneFile";

// An object where loaded plugins are stored.
export let loadedPlugins: any = {};

/**
 * Loads all plugins. If you add a new plugin, you must load it from here.
 * @returns void
 */
export function loadAll(): void {
    let plugins = [];
    plugins.push(LoadSavePDBUurl.PDBUrl);
    plugins.push(LoadSaveSceneFile.SceneFile);

    const pluginsLen = plugins.length;
    for (let i = 0; i < pluginsLen; i++) {
        const plugin = new plugins[i]();
        if (loadedPlugins[plugin._type] === undefined) {
            loadedPlugins[plugin._type] = [];
        }
        loadedPlugins[plugin._type].push(plugin);
    }
}

export function getPluginsOfType(type: string): any[] {
    return loadedPlugins[type];
}
