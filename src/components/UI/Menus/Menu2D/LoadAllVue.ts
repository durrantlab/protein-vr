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
