// // import FrontButton from "./FrontButton.vue";
// import * as LoadSave from "./LoadSave";
// import * as Menu2D from "../Menu2D";
// import * as OpenPopup from "./OpenPopup";
// import * as Vars from "../../Vars/Vars";
// import * as Lecturer from "../../WebRTC/Lecturer";
// import * as UrlVars from "../../Vars/UrlVars";
import {VueComponentParent} from "../../../VueComponentParent";

// @ts-ignore
import templateHtml from "./TabsHeaderItemComponent.template.htm";

export class TabsHeaderItemComponent extends VueComponentParent {
    public tag = "tabs-header-item";
    public methods = {};

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

    public vueXStore;

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {
    }
}
