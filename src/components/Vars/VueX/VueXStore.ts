declare var Vue;  // import Vue from "vue";
declare var Vuex;  // import Vuex from "vuex";

// Vue.use(Vuex)

// declare var jQuery;

export interface IAddVueXStoreParam {
    state: any;
    mutations: any;
}

export const store = new Vuex.Store({
    "state": {},
    "mutations": {
        /**
         * Sets a VueX variable.
         * @param  {*} state    The VueX state.
         * @param  {*} payload  The payload containing the information used to
         *                      set the VueX variable.
         * @returns void
         */
        "setVar"(state: any, payload: any): void {
            if (payload.moduleName === undefined) {
                state[payload.varName] = payload.val;
            } else {
                state[payload.moduleName][payload.varName] = payload.val;
            }
        }
    },
});

// In case you need to access the store outside Vue.
export var storeOutsideVue;
/**
 * Makes the VueX store object accessible outside VueX components.
 * @param  {*} store  The VueX store.
 */
export function setStoreOutsideVue(store: any) {
    storeOutsideVue = store;
}

/**
 * Populates VueX store with values from the components (state, mutation,
 * etc.).
 * @param  {*} param  The parameters from the components. Of type
 *                    IAddVueXStoreParam.
 * @returns void
 */
export function addVueXStoreParam(param: IAddVueXStoreParam): void {
    let paramNames = Object.keys(param.state);
    let paramNameLen = paramNames.length;
    for (let i = 0; i < paramNameLen; i++) {
        const paramName = paramNames[i];
        const paramVal = param.state[paramName];
        store["state"][paramName] = paramVal;
    }

    paramNames = Object.keys(param.mutations);
    paramNameLen = paramNames.length;
    for (let i = 0; i < paramNameLen; i++) {
        const paramName = paramNames[i];
        const paramVal = param.mutations[paramName];
        store["mutations"][paramName] = paramVal;
    }
}

// For debugging.
window["store"] = store;
