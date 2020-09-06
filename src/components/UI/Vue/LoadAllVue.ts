import * as ComponentsLoadAll from "./Components/LoadAllVue";
import * as Menu2DLoadAll from "../Menus/Menu2D/LoadAllVue";
import { store, setStoreOutsideVue } from "../../Vars/VueX/VueXStore";
import { loadInitialPartialMenuData } from "../Menus/Menu2D/Menu2DDisplayComponent";

declare var Vuex;
declare var Vue;

/**
 * Load the vue components.
 */
export function load(): void {
    ComponentsLoadAll.load();
    Menu2DLoadAll.load();

    new Vue({
        "el": '#vue-app',
        // "store": Store.store,
        "template": `
            <div style="height:0;">
                <front></front>
                <load-save-modal></load-save-modal>
                <menu-2d-modal></menu-2d-modal>
                <simple-modal></simple-modal>
            </div>
        `,
        "store": store,

        /**
         * Function that runs when Vue component loaded.
         */
        "mounted"() {
            setStoreOutsideVue(this.$store);
        }
    });

    // Populate partial 2D data. Here because it needs to be done after new
    // Vue above.
    loadInitialPartialMenuData();
}
