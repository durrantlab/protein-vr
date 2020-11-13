// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import * as FormElementsLoadAll from "./FormElements/LoadAllVue";
import * as OpenPopupLoadAll from "./OpenPopup/LoadAllVue";
import * as TabsLoadAll from "./Tabs/LoadAllVue";
import * as UI2DLoadAll from "./UI2D/LoadAllVue";
import { StatusComponent } from "./StatusComponent";
import { SuperFileComponent } from "./SuperFileComponent";
declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    FormElementsLoadAll.load();
    OpenPopupLoadAll.load();
    TabsLoadAll.load();
    UI2DLoadAll.load();
    new SuperFileComponent().load(Vue);
    new StatusComponent().load(Vue);
}
