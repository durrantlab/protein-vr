// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import { FrontVueComponent } from "./FrontVueComponent";
import { FrontButtonVueComponent } from "./FrontButtonVueComponent";
declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    new FrontVueComponent().load(Vue);
    new FrontButtonVueComponent().load(Vue);
}
