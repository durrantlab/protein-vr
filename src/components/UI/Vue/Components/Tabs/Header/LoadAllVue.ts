import { TabsHeaderComponent } from "./TabsHeaderComponent";
import { TabsHeaderItemComponent } from "./TabsHeaderItemComponent";
declare var Vue;  // import Vue from "vue";

/**
 * Load the vue components.
 */
export function load(): void {
    new TabsHeaderComponent().load(Vue);
    new TabsHeaderItemComponent().load(Vue);
}
