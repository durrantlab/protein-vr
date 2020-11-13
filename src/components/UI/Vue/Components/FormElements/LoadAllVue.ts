// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import { FormInputWrapperComponent } from "./InputWrapperComponent";
import { FormCheckboxComponent } from "./CheckboxComponent";
import { FormInputComponent } from "./InputComponent";
import { FormButtonComponent } from "./ButtonComponent";
import { FormOptionsComponent } from "./OptionsComponent";
import { TextAreaComponent } from "./TextAreaComponent";
declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    new FormInputWrapperComponent().load(Vue);
    new FormCheckboxComponent().load(Vue);
    new FormInputComponent().load(Vue);
    new FormOptionsComponent().load(Vue);
    new FormButtonComponent().load(Vue);
    new TextAreaComponent().load(Vue);
}
