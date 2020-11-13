// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import {VueComponentParent} from "../VueComponentParent";
import {getPluginsOfType} from "../../../../Plugins/Plugins";
import * as LoadSavePlugin from "../../../../Plugins/LoadSave/LoadSaveParent";
import * as LoadSaveUtils from "../../../../Plugins/LoadSave/LoadSaveUtils";

// @ts-ignore
import {templateHtml} from "./LoadSaveModalComponent.template.htm.ts";

export class LoadSaveModalComponent extends VueComponentParent {
    public tag = "load-save-modal";
    public methods = {
        /**
         * Runs once the modal has opened.
         * @returns void
         */
        "onReady"(): void {
            // Now that it's open, trigger all the onUserInterfaceDone
            // functions from the plugins.
            let plugins: LoadSavePlugin.LoadSaveParent[] = getPluginsOfType("loadSave");
            const pluginsLen = plugins.length;
            // for (let i = 0; i < pluginsLen; i++) {
                // plugins[i].shadowsHardwareScalingLocalStorageToVueX();
            // }
            LoadSaveUtils.shadowsHardwareScalingLocalStorageToVueX();
        },

        /**
         * Runs once the modal has closed.
         * @returns void
         */
        "onClose"(): void {
            // You need to update the store now that it's closed. There must
            // be a more elegant way of doing this...
            this.$store.commit("setVar", {
                moduleName: "loadSaveModal",
                varName: "showLoadSaveModal",
                val: false
            });
        }
    };

    public computed = {};

    public props = {};

    public watch = {};

    /**
     * Makes the template for the associated tab.
     * @returns string  The template html.
     */
    private makeTemplate = function(): string {
        let plugins = getPluginsOfType("loadSave");

        let headers = "";
        let content = "";
        let first = true;
        for (let plugin of plugins) {
            headers += `<tabs-header-item :activeClass="${first.toString()}" pluginSlug="${plugin.pluginSlug}">${plugin.pluginTitle}</tabs-header-item>`;
            content += `<tab-item :activeClass="${first.toString()}" pluginSlug="${plugin.pluginSlug}"><${plugin.pluginSlug}-panel></${plugin.pluginSlug}-panel></tab-item>`;
            first = false;
        }

        return templateHtml.replace("{{HEADERS}}", headers).replace("{{CONTENTS}}", content);
    }

    public template = this.makeTemplate();

    public vueXStore = {
        state: {
            "showLoadSaveModal": false
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
    public mounted = function(): void {};
}
