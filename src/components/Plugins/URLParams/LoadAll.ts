// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

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

/**
 * Runs all the plugins that process url parameters.
 * @param  {*} [urlParams=]  The url parameters. If not given, they will be
 *                           taken from the actual browser url.
 * @returns void
 */
export function runURLPlugins(urlParams?: Map<string, any>): void {
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
