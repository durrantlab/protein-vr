import { TabsHeaderComponent } from "./TabsHeaderComponent";
import { TabsHeaderItemComponent } from "./TabsHeaderItemComponent";

declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    new TabsHeaderComponent().load(Vue);
    new TabsHeaderItemComponent().load(Vue);
}
