import * as FormElementsLoadAll from "./FormElements/LoadAllVue";
import * as OpenPopupLoadAll from "./OpenPopup/LoadAllVue";
import * as TabsLoadAll from "./Tabs/LoadAllVue";
import * as UI2DLoadAll from "./UI2D/LoadAllVue";
import { SuperFileComponent } from "./SuperFileComponent";

declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    FormElementsLoadAll.load();
    OpenPopupLoadAll.load();
    TabsLoadAll.load();
    UI2DLoadAll.load();
    new SuperFileComponent().load(Vue);
}
