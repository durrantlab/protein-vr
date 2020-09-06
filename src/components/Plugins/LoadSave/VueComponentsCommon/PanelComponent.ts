import {VueComponentParent} from "../../../UI/Vue/Components/VueComponentParent";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";

declare var jQuery;

export class PanelComponent extends VueComponentParent {
    public tag = "panel";
    public methods = {};

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

    public template = templateHtml;

    public vueXStore;

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
