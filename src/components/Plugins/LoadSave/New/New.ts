import * as Parent from "../LoadSaveParent";
// import { PanelComponent, setAssociatedPlugin } from "./PanelComponent.ts.delme";
// import { store } from "../../../Vars/VueX/VueXStore";
import * as LoadSaveUtils from "../LoadSaveUtils";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";

export class New extends Parent.LoadSaveParent {
    public pluginTitle = "New<div class='emoji'>📂</div>";
    public pluginSlug = "new";
    public tag = "new-panel";

    public methods = {
        /**
         * Starts the new-scene process on button click.
         * @returns void
         */
        "submitNew"(): void {
            this.startLoadOrSave();
        },

        /**
         * Runs when the user starts the load process.
         * @param  {*} [data=undefined]  Any data to pass to the load/save
         *                               process.
         * @returns void
         */
        startLoadOrSave(data: any = undefined): void {
            LoadSaveUtils.shadowsHardwareScalingVueXToLocalStorage();
            window.location.href = LoadSaveUtils.makeUrl({});
        }

    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {},
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {};
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
