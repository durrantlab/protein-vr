import {VueComponentParent} from "./VueComponentParent";
import * as VueXStore from "../../../Vars/VueX/VueXStore";

// This allows proteinvr to provide info to help with testcafe tests.

// @ts-ignore
import {templateHtml} from "./StatusComponent.template.htm.ts";

export class StatusComponent extends VueComponentParent {
    public tag = "status";
    public methods = {};

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "status": ""
        },
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {};
    }

    mounted() {}
}

/**
 * Sets a value to the status div. For communicating with testcafe.
 * @param  {string} val  The new value.
 * @returns void
 */
export function setStatus(val: string): void {
    VueXStore.storeOutsideVue.commit("setVar", {
        moduleName: "status",
        varName: "status",
        val: val
    });
}
