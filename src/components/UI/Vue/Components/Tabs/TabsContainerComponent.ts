// // import FrontButton from "./FrontButton.vue";
// import * as LoadSave from "./LoadSave";
// import * as Menu2D from "../Menu2D";
// import * as OpenPopup from "./OpenPopup";
// import * as Vars from "../../Vars/Vars";
// import * as Lecturer from "../../WebRTC/Lecturer";
// import * as UrlVars from "../../Vars/UrlVars";
import {VueComponentParent} from "../../VueComponentParent";

// @ts-ignore
import templateHtml from "./TabsContainerComponent.template.htm";

export class TabsContainerComponent extends VueComponentParent {
    public tag = "tabs-container";
    public methods = {};

    public computed = {};

    public props = {
        "name": {"required": true},  // : {"default": "msgModal"},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    public data = function(): any {
        return {
            "tabInfo": [
                {
                    "activeClass": "moo1",
                    "pluginSlug": "moo1",
                    "pluginTitle": "moo1",
                },
                {
                    "activeClass": "moo2",
                    "pluginSlug": "moo2",
                    "pluginTitle": "moo2",
                }
            ]
        };
    }

    public mounted = function(): void {
    }
}
