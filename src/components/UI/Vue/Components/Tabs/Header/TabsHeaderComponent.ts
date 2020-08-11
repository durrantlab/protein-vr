// // import FrontButton from "./FrontButton.vue";
// import * as LoadSave from "./LoadSave";
// import * as Menu2D from "../Menu2D";
// import * as OpenPopup from "./OpenPopup";
// import * as Vars from "../../Vars/Vars";
// import * as Lecturer from "../../WebRTC/Lecturer";
// import * as UrlVars from "../../Vars/UrlVars";
import {VueComponentParent} from "../../../VueComponentParent";

// @ts-ignore
import templateHtml from "./TabsHeaderComponent.template.htm";

export class TabsHeaderComponent extends VueComponentParent {
    public tag = "tabs-header";
    public methods = {};

    public computed = {};

    public props = {
        "name": {"required": true},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {
    }
}
