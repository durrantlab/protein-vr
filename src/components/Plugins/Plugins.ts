import * as LoadSaveAll from "./LoadSave/LoadAll";
declare var Vue;  // import Vue from "vue";

// import { getPluginsOfType } from "./Plugins";

// An object where loaded plugins are stored.
export let registeredPlugins: any = {};

/**
 * Loads all plugins. If you add a new plugin, you must load it from here.
 * @returns void
 */
export function loadAll(): void {
    let plugins = [];
    plugins.push(...LoadSaveAll.getPlugins());

    const pluginsLen = plugins.length;
    for (let i = 0; i < pluginsLen; i++) {
        const plugin = plugins[i];
        if (registeredPlugins[plugin.type] === undefined) {
            registeredPlugins[plugin.type] = [];
        }
        registeredPlugins[plugin.type].push(plugin);
    }
}

/**
 * Get all the registered plugins of a given type.
 * @param  {string} type  The name of the type.
 * @returns any[]  The list of registered plugins.
 */
export function getPluginsOfType(type: string): any[] {
    return registeredPlugins[type];
}
