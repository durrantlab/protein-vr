import { ModalComponent } from "./ModalComponent";
import { SimpleModalComponent } from "./SimpleModalComponent";
import { LoadSaveModalComponent } from "./LoadSaveModalComponent";

declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    new SimpleModalComponent().load(Vue);
    new LoadSaveModalComponent().load(Vue);
    new ModalComponent().load(Vue);
}
