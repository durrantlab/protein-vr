declare var Vuex;
// declare var jQuery;

export interface IAddVueXStoreParam {
    state: any;
    mutations: any;
}

export const store = new Vuex.Store({
    "state": {},
    "mutations": {
        "setVar"(state: any, payload: any) {
            state[payload.moduleName][payload.varName] = payload.val;
        }
    },
});

// In case you need to access the store outside Vue.
export var storeOutsideVue;
export function setStoreOutsideVue(store: any) {
    storeOutsideVue = store;
}

// Add in state, mutation, etc.
export function addVueXStoreParam(param: IAddVueXStoreParam) {
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
