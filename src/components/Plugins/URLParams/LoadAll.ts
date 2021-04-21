import { getAllUrlParams } from '../../Vars/UrlVars';
import { LabelsPlugin } from './LabelsPlugin';
import { URLParamsParent } from "./URLParamsParent";

let pluginsCache: URLParamsParent[] = undefined;

/**
 * Returns a list of all URLParam plugins.
 * @returns any[]  The list of plugins.
 */
 function getURLPlugins(): URLParamsParent[] {
    if (pluginsCache !== undefined) {
        return pluginsCache;
    }

    pluginsCache = [];
    pluginsCache.push(new LabelsPlugin());

    return pluginsCache;
}

export function runURLPlugins(urlParams?: Map<string, any>) {
    if (urlParams === undefined) {
        urlParams = getAllUrlParams(window.location.href);
    }

    // Also loop through all the URL plugins.
    let urlPlugins = getURLPlugins();
    const urlPluginsLen = urlPlugins.length;
    for (let i = 0; i < urlPluginsLen; i++) {
        const urlPlugin = urlPlugins[i];
        urlPlugin.run(urlParams);
    }
}
