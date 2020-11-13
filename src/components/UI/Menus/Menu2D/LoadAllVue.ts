// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import { Menu2DDisplayComponent } from "./Menu2DDisplayComponent";
import { Menu2DModalComponent } from "./Menu2DModalComponent";
declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    new Menu2DDisplayComponent().load(Vue);
    new Menu2DModalComponent().load(Vue);
}
