// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import {VueComponentParent} from "../../../UI/Vue/Components/VueComponentParent";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";

export class PanelComponent extends VueComponentParent {
    public tag = "panel";
    public methods = {};

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore;

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {};
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
