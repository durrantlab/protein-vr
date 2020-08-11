import {VueComponentParent} from "../../VueComponentParent";
import * as Menu3D from "../../../Menu3D/Menu3D";

// @ts-ignore
import templateHtml from "./Menu2DComponent.template.htm";

export class Menu2DComponent extends VueComponentParent {
    public tag = "menu-2d";
    public methods = {
        "onReady"(): void {
            // Now that it's open, pull the Menu2D information into the VueX
            // store so it becomes reactive. Note that you're only pulling the
            // top-level stuff here, because the rest will be populated as you
            // click on the elements in the 2D menu. Menu3D.
            let menuInfToUse = {}
            for (var key in Menu3D.menuInf) {
                if (Menu3D.menuInf.hasOwnProperty(key)) {
                    menuInfToUse[key] = {};
                }
            }

            this.$store.commit("setVar", {
                moduleName: "menu2d",
                varName: "menuInf",
                val: menuInfToUse
            });
        },
        "onClose"(): void {
            // You need to update the store now that it's closed. There must
            // be a more elegant way of doing this...
            this.$store.commit("setVar", {
                moduleName: "menu2d",
                varName: "showMenu2DModal",
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

    public template = templateHtml;

    public vueXStore = {
        state: {
            "showMenu2DModal": false,
            "menuInf": {}
        },
        mutations: {}
    }

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {};
}
