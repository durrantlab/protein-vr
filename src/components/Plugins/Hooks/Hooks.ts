// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

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

/**
 * Sets up the hooks.
 * @returns void
 */
export function setupHooks(): void {
    for (let i = 0; i < numHooks; i++) {
        hookFuncs[i] = [];
    }
}

/**
 * Registers a hook. Used by plugins.
 * @param  {*}         hookType  The type of hook.
 * @param  {Function}  hookFunc  The function to run.
 * @returns void
 */
export function registerHook(hookType: HookTypes, hookFunc: Function): void {
    hookFuncs[hookType].push(hookFunc);
}

/**
 * Runs all the functions associated with a given hook.
 * @param  {*} hookType             The hook type.
 * @param  {*} [payload=undefined]  Parameters relevant to the hook, that get
 *                                  passed to the assocaited functions.
 * @returns void
 */
export function runHooks(hookType: HookTypes, payload?: IRunHooksParams): void {
    let funcs = hookFuncs[hookType];
    const funcsLen = funcs.length;
    for (let i = 0; i < funcsLen; i++) {
        const func = funcs[i];
        func(payload);
    }
}
