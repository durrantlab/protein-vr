import {VueComponentParent} from "../Vue/VueComponentParent";

// @ts-ignore
import templateHtml from "./FrontButtonVueComponent.template.htm";

export class FrontButtonVueComponent extends VueComponentParent {
    public tag = "front-button";
    public methods = {};
    public computed = {
        "styles"(): string {
            return `color:white;
                width:80px;
                height:50px;
                right:5px;
                position:absolute;
                bottom:` + this["curBottom"].toString() + `px;
                background-color:rgba(51,51,51,0.7);
                border:none;
                outline:none;
                cursor:pointer;"`.replace("\n", "");
        }
    };

    public props = [
        "title", "id", "curBottom", "svg"
    ];

    public watch = {};

    public template = templateHtml;
    public vueXStore;
    public data(): any {
        return {};
    }
    public mounted(): void {};
}
