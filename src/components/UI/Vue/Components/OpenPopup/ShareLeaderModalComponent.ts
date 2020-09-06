import {VueComponentParent} from "../VueComponentParent";
import {getPluginsOfType} from "../../../../Plugins/Plugins";
import * as LoadSavePlugin from "../../../../Plugins/LoadSave/LoadSaveParent";

// @ts-ignore
import {templateHtml} from "./ShareLeaderModalComponent.template.htm.ts";

export class ShareLeaderModalComponent extends VueComponentParent {
    public tag = "share-leader-modal";
    public methods = {
        "onReady"(): void {},
        "onClose"(): void {}
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {},
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
