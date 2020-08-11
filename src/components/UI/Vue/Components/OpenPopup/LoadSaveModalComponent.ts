import {VueComponentParent} from "../../../Vue/VueComponentParent";
import {getPluginsOfType} from "../../../../Plugins/Plugins";
import * as LoadSavePlugin from "../../../../Plugins/LoadSave/Parent";

// @ts-ignore
import templateHtml from "./LoadSaveModalComponent.template.htm";

export class LoadSaveModalComponent extends VueComponentParent {
    public tag = "load-save-modal";
    public methods = {
        "onReady"(): void {
            // Now that it's open, trigger all the onUserInterfaceDone
            // functions from the plugins.
            let plugins: LoadSavePlugin.LoadSaveParent[] = getPluginsOfType("loadSave");
            const pluginsLen = plugins.length;
            for (let i = 0; i < pluginsLen; i++) {
                plugins[i]._onUserInterfaceDone();
                plugins[i].onUserInterfaceDone();
            }
        },
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

    public props = {
        // "title": {"default": ""},
        // // "content": {"default": ""},
        // "isUrl": {"default": false},
        // "hasCloseBtn": {"default": false},
        // "unclosable": {"default": false},
        // "showBackdrop": {"default": false},
        // "skinny": {"default": false},
        // "btnText": {"default": ""},
        // "onCloseCallback": {"default": undefined},
        // "onReadyCallBack": {"default": undefined}
    };

    public watch = {};

    private makeTemplate = function(): any {
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

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {};
}
