import {VueComponentParent} from "../../../UI/Vue/VueComponentParent";

// @ts-ignore
import templateHtml from "./PanelComponent.template.htm";

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

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {};
}
