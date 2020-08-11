import {VueComponentParent} from "../../../UI/Vue/VueComponentParent";

// @ts-ignore
import templateHtml from "./PanelFooterComponent.template.htm";

declare var jQuery;

export class PanelFooterComponent extends VueComponentParent {
    public tag = "panel-footer";
    public methods = {};

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {};
}
