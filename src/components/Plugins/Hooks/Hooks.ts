let numHooks = 2;
export const enum HookTypes {
    ON_ADD_OR_REMOVE_MOL_MESH,
    ON_ROTATE,
}

// Params for every hook type, all together.
export interface IRunHooksParams {
    mesh?: any;
    position?: any;  // Vector3
    scaling?: any;  // Vector3
    rotation?: any;  // Quaternion
}

export let hookFuncs: {[key: string]: any} = {};

export function setupHooks() {
    for (let i = 0; i < numHooks; i++) {
        hookFuncs[i] = [];
    }
}

export function registerHook(hookType: HookTypes, hookFunc: Function): void {
    hookFuncs[hookType].push(hookFunc);
}

export function runHooks(hookType: HookTypes, payload?: IRunHooksParams) {
    let funcs = hookFuncs[hookType];
    const funcsLen = funcs.length;
    for (let i = 0; i < funcsLen; i++) {
        const func = funcs[i];
        func(payload);
    }
}
