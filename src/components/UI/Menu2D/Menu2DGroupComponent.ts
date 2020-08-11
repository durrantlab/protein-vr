import {VueComponentParent} from "../Vue/VueComponentParent";
import {getSubMenuItemsFromMenu} from "./Utils";
import * as Menu3D from "../Menu3D/Menu3D";

// @ts-ignore
import templateHtml from "./Menu2DGroupComponent.template.htm";

export class Menu2DGroupComponent extends VueComponentParent {
    public tag = "menu-2d-group";
    public methods = {};

    public computed = {
        "subMenuItemKeys"(): string[] {
            // return Object.keys(this["subMenuItems"])
            return Object.keys(
                getSubMenuItemsFromMenu(
                    this["breadcrumbs"],
                    this.$store.state["menu2d"]["menuInf"]
                )
            );
        }
    };

    public props = {
        // "subMenuItems": {"required": true},
        "breadcrumbs": {"required": true}  // , "default": () => {return []}},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        "state": {},
        "mutations": {}
    };

    public data = function(): any {
        return {};
    }

    public mounted = function(): void {}
}
