// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import {VueComponentParent} from "../../VueComponentParent";
import {getPluginsOfType} from "../../../../../Plugins/Plugins";
import * as LoadSavePlugin from "../../../../../Plugins/LoadSave/LoadSaveParent";
import {store} from "../../../../../Vars/VueX/VueXStore";

// @ts-ignore
import {templateHtml} from "./TabsHeaderItemComponent.template.htm.ts";

export class TabsHeaderItemComponent extends VueComponentParent {
    public tag = "tabs-header-item";
    public methods = {
        "tabHeaderClick"(): void {
            let plugins: LoadSavePlugin.LoadSaveParent[] = getPluginsOfType("loadSave");
            const pluginName = Object.keys(plugins);
            const pluginNameLen = pluginName.length;
            let plugin = undefined;
            for (let i = 0; i < pluginNameLen; i++) {
                const name = pluginName[i];
                plugin = plugins[name];
                if (plugin.pluginSlug === this["pluginSlug"]) {
                    break;
                }
            }

            // Save the plugin associated with this clicked tab too.
            store.commit("setVar",{
                moduleName: "loadSaveModal",
                varName: "currentTabPlugin",
                val: plugin
            });

            if (plugin !== undefined) {
                let func = plugin.methods.onTabHeaderClick.bind(plugin);
                func();
            }
        }
    };

    public computed = {};

    public props = {
        "activeClass": {
            "type": Boolean,
            "default": false

        },
        "pluginSlug": {"required": true},
        // "pluginTitle": {"required": true},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "currentTabPluginSlug": undefined,
        },
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {};
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {}
}
