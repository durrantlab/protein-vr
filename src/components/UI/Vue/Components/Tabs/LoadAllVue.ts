import * as TabLoadAll from "./Tab/LoadAllVue";
import * as HeaderLoadAll from "./Header/LoadAllVue";
import { TabsContainerComponent } from "./TabsContainerComponent";
declare var Vue;  // import Vue from "vue";

/**
 * Load the vue components.
 */
export function load(): void {
    TabLoadAll.load();
    HeaderLoadAll.load();
    new TabsContainerComponent().load(Vue);
}