import { FrontVueComponent } from "./FrontVueComponent";
import { FrontButtonVueComponent } from "./FrontButtonVueComponent";
declare var Vue;  // import Vue from "vue";

/**
 * Load the vue components.
 */
export function load(): void {
    new FrontVueComponent().load(Vue);
    new FrontButtonVueComponent().load(Vue);
}
