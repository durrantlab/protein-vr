// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import {VueComponentParent} from "../VueComponentParent";

// @ts-ignore
import {templateHtml} from "./TabsContainerComponent.template.htm.ts";

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

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
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

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {}
}
