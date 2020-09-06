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
