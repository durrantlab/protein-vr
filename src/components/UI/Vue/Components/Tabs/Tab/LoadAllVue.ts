import { TabItemComponent } from "./TabItemComponent";
import { TabsComponent } from "./TabsComponent";

declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    new TabsComponent().load(Vue);
    new TabItemComponent().load(Vue);
}
