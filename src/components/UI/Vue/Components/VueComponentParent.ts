// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import { IAddVueXStoreParam, addVueXStoreParam } from "../../../Vars/VueX/VueXStore";
import { store } from "../../../Vars/VueX/VueXStore";

export abstract class VueComponentParent {
    abstract tag;
    abstract methods;
    abstract props;
    abstract computed;
    abstract template;
    abstract watch;
    abstract vueXStore: IAddVueXStoreParam;
    abstract data();
    abstract mounted(): void;

    /**
     * Loads the Vue-component specification into Vue. "Translates" my format
     * to the official Vue format.
     * @param  {any} Vue  The Vue object.
     * @returns void
     */
    load(Vue: any): void {
        let This = this;
        Vue.component(This.tag, {
            "template": This.template,
            "methods": This.methods,
            "props": This.props,
            "computed": This.computed,
            "watch": This.watch,
            "data": This.data,
            "mounted": This.mounted,

            /** Runs before vue component displayed. */
            // "beforeCreate"() {
                // if (This.vueXStore !== undefined) {
                //     if (This.tag.indexOf("-") !== -1) {
                //         let prts = This.tag.split("-");
                //         This.tag = prts[0] + prts.slice(1).map(
                //             s => s.slice(0,1).toUpperCase() + s.slice(1)
                //         ).join("");
                //     }
                //     if (!this.$store.state[This.tag]) {
                //         this.$store.registerModule(This.tag, {
                //             "namespaced": true,
                //             "state": This.vueXStore.state,
                //             "mutations": This.vueXStore.mutations
                //         });
                //     }
                // }
            // }
        });

        if (This.vueXStore !== undefined) {
            if (This.tag.indexOf("-") !== -1) {
                let prts = This.tag.split("-");
                This.tag = prts[0] + prts.slice(1).map(
                    s => s.slice(0,1).toUpperCase() + s.slice(1)
                ).join("");
            }
            if (!store.state[This.tag]) {
                store.registerModule(This.tag, {
                    "namespaced": true,
                    "state": This.vueXStore.state,
                    "mutations": This.vueXStore.mutations
                });
            }
        }

    }
}
