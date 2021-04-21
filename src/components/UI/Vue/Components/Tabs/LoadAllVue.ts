// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as TabLoadAll from "./Tab/LoadAllVue";
import * as HeaderLoadAll from "./Header/LoadAllVue";
import { TabsContainerComponent } from "./TabsContainerComponent";

declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    TabLoadAll.load();
    HeaderLoadAll.load();
    new TabsContainerComponent().load(Vue);
}
