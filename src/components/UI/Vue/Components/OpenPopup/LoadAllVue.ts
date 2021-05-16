// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import { ModalComponent } from "./ModalComponent";
import { SimpleModalComponent } from "./SimpleModalComponent";
import { LoadSaveModalComponent } from "./LoadSaveModalComponent";
import { MessagesComponent } from "../MessagesComponent";
declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    new SimpleModalComponent().load(Vue);
    new LoadSaveModalComponent().load(Vue);
    new ModalComponent().load(Vue);
    new MessagesComponent().load(Vue);
}
