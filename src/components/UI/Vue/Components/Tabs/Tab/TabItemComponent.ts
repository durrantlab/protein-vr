// // import FrontButton from "./FrontButton.vue";
// import * as LoadSave from "./LoadSave";
// import * as Menu2D from "../Menu2D";
// import * as OpenPopup from "./OpenPopup";
// import * as Vars from "../../Vars/Vars";
// import * as Lecturer from "../../WebRTC/Lecturer";
// import * as UrlVars from "../../Vars/UrlVars";
import {VueComponentParent} from "../../../VueComponentParent";

// @ts-ignore
import templateHtml from "./TabItemComponent.template.htm";

export class TabItemComponent extends VueComponentParent {
    public tag = "tab-item";
    public methods = {};

    public computed = {};

    public props = {
        "pluginSlug": {"required": true},
        "activeClass": {
            "type": Boolean,
            "default": false
        },
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
