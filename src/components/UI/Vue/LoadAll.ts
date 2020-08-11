// import Vue from "Vue";
// import BootstrapVue from "bootstrap-vue";
import { FrontVueComponent } from "../UI2D/FrontVueComponent";
import { FrontButtonVueComponent } from "../UI2D/FrontButtonVueComponent";
import { ModalComponent } from "./Components/OpenPopup/ModalComponent";
// import { LoadSaveModalComponent } from "../../Plugins/LoadSave/VueComponents/LoadSaveModalComponent";
import { SuperFileComponent } from "./Components/SuperFileComponent";
import { TabsContainerComponent } from "./Components/Tabs/TabsContainerComponent";
import { TabItemComponent } from "./Components/Tabs/Tab/TabItemComponent";
import { TabsComponent } from "./Components/Tabs/Tab/TabsComponent";
import { TabsHeaderComponent } from "./Components/Tabs/Header/TabsHeaderComponent";
import { TabsHeaderItemComponent } from "./Components/Tabs/Header/TabsHeaderItemComponent";
import { FormInputWrapperComponent } from "./Components/FormElements/InputWrapperComponent";
import { FormCheckboxComponent } from "./Components/FormElements/CheckboxComponent";
import { FormInputComponent } from "./Components/FormElements/InputComponent";
import { FormButtonComponent } from "./Components/FormElements/ButtonComponent";
import { FormOptionsComponent } from "./Components/FormElements/OptionsComponent";
import { SimpleModalComponent } from "../Vue/Components/OpenPopup/SimpleModalComponent";
import { LoadSaveModalComponent } from "../Vue/Components/OpenPopup/LoadSaveModalComponent";
import { Menu2DComponent } from "../Vue/Components/OpenPopup/Menu2DComponent";
import { Menu2DGroupComponent } from "../Menu2D/Menu2DGroupComponent";
import { Menu2DItemComponent } from "../Menu2D/Menu2DItemComponent";
import { store, setStoreOutsideVue } from "./VueX/VueXStore";
import { getPluginsOfType } from "../../Plugins/Plugins";
import { getLoadSaveCommonComponents } from "../../Plugins/LoadSave/VueComponentsCommon/LoadSaveCommonComponents";

declare var Vue;
declare var Vuex;

// @ts-ignore
// import UI2DButton from "./UI2D/UI2DButton";

// @ts-ignore
// import Front from './UI2D/Front.vue';

export function load(): void {
    // @ts-ignore
    // Vue.use(BootstrapVue);
    // debugger;
    // Vue.use(Vuex)
    new FormInputWrapperComponent().load(Vue);
    new FormCheckboxComponent().load(Vue);
    new FormInputComponent().load(Vue);
    new FrontVueComponent().load(Vue);
    new FrontButtonVueComponent().load(Vue);
    new FormOptionsComponent().load(Vue);
    new TabsHeaderComponent().load(Vue);
    new TabsHeaderItemComponent().load(Vue);
    new TabsComponent().load(Vue);
    new TabItemComponent().load(Vue);
    new SuperFileComponent().load(Vue);
    new TabsContainerComponent().load(Vue);
    new SimpleModalComponent().load(Vue);
    new LoadSaveModalComponent().load(Vue);
    new Menu2DComponent().load(Vue);
    new Menu2DItemComponent().load(Vue);
    new Menu2DGroupComponent().load(Vue);

    // The loadSave plugins also produce Vue components that need to be
    // registered.
    let loadSavePlugins = getPluginsOfType("loadSave");
    for(let plugin of loadSavePlugins) {
        let pluginVueComponentClass = plugin.vuePanelComponent();
        new pluginVueComponentClass().load(Vue);
    }

    for (let component of getLoadSaveCommonComponents()) {
        new component().load(Vue);
    }

    new ModalComponent().load(Vue);
    new FormButtonComponent().load(Vue);


    // @ts-ignore
    // new Vue({
    //     "el": "#menu2d",
    //     // "render": (h) => h(Front)
    // });

    new Vue({
        "el": '#menu2d',
        // "store": Store.store,
        "template": `
            <div style="height:0;">
                <front></front>
                <load-save-modal></load-save-modal>
                <menu-2d></menu-2d>
                <simple-modal></simple-modal>
            </div>
        `,
        "store": store,
        "mounted"() {
            setStoreOutsideVue(this.$store);
        }
    });
}
