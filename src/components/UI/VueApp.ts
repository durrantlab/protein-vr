import Vue from "Vue";
import BootstrapVue from "bootstrap-vue";

// @ts-ignore
import UI2DButton from "./UI2D/UI2DButton";

// @ts-ignore
import Front from './UI2D/Front.vue';

export function setup(): void {
    // @ts-ignore
    Vue.use(BootstrapVue);

    console.log(Front);
    debugger;

    // @ts-ignore
    new Vue({
        "el": "#menu2d",
        "render": (h) => h(Front)
    });
}
