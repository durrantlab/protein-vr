import {VueComponentParent} from "../../../UI/Vue/VueComponentParent";
// import {ParentLoadSaveVueComponent} from "../NOUSE.ParentLoadSaveVueComponent";

// @ts-ignore
import templateHtml from "./PanelComponent.template.htm";

export class PanelComponent extends VueComponentParent {
    public tag = "proteinvr-scene-panel";
    public methods = {};

    public computed = {};

    public props = {
        // "title": {"default": ""},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {};
}
