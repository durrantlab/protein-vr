// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import {VueComponentParent} from "../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./FrontButtonVueComponent.template.htm.ts";

export class FrontButtonVueComponent extends VueComponentParent {
    public tag = "front-button";
    public methods = {};
    public computed = {
        /**
         * Generates the css styles for this button.
         * @returns string  The css styles string.
         */
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

    public props = {
        "title": {"default": ""},
        "id": {"default": ""},
        "curBottom": {"default": 0},
        "svg": {"default": ""}
    };

    public watch = {};

    public template = templateHtml;
    public vueXStore;

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data(): any {
        return {};
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted(): void {};
}
