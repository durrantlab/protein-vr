import { TabItemComponent } from "./TabItemComponent";
import { TabsComponent } from "./TabsComponent";
declare var Vue;  // import Vue from "vue";

/**
 * Load the vue components.
 */
export function load(): void {
    new TabsComponent().load(Vue);
    new TabItemComponent().load(Vue);
}
