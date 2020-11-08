import { FormInputWrapperComponent } from "./InputWrapperComponent";
import { FormCheckboxComponent } from "./CheckboxComponent";
import { FormInputComponent } from "./InputComponent";
import { FormButtonComponent } from "./ButtonComponent";
import { FormOptionsComponent } from "./OptionsComponent";
import { TextAreaComponent } from "./TextAreaComponent";
declare var Vue;  // import Vue from "vue";

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
