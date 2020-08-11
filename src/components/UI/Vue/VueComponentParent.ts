import { IAddVueXStoreParam, addVueXStoreParam } from "../../UI/Vue/VueX/VueXStore";

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

    load(Vue: any): void {
        // Add to VueX store.
        // if (this.vueXStore !== undefined) {
        //     addVueXStoreParam(this.vueXStore);
        // }
        let This = this;
        Vue.component(This.tag, {
            "template": This.template,
            "methods": This.methods,
            "props": This.props,
            "computed": This.computed,
            "watch": This.watch,
            "data": This.data,
            "mounted": This.mounted,
            "beforeCreate"() {
                if (This.vueXStore !== undefined) {
                    if (This.tag.indexOf("-") !== -1) {
                        let prts = This.tag.split("-");
                        This.tag = prts[0] + prts.slice(1).map(
                            s => s.slice(0,1).toUpperCase() + s.slice(1)
                        ).join("");
                    }
                    if (!this.$store.state[This.tag]) {
                        this.$store.registerModule(This.tag, {
                            "namespaced": true,
                            "state": This.vueXStore.state,
                            "mutations": This.vueXStore.mutations
                        });
                    }
                }
            }
        });

        // Vue.component('button-counter', {
        //     data: function () {
        //         return {
        //             count: 0
        //         }
        //     },
        //     template: '<button v-on:click="count++">You clicked me {{ count }} times.</button>'
        // });
    }
}
