// A place to store promises.

// After a certain amount of time, if a given promise hasn't been fulfilled,
// throw a warning.
const PROMISE_TIMEOUT_MILLISECONDS = 15000;

let promises = {
    "DeviceOrientationAuthorizedIfNeeded": null,
    "SceneLoaded": null,
    "InitVR": null,
    "SetupVRListeners": null,
    "LoadBabylonScene": null,
    "OptimizeScene": null,
    "SetupCamera": null,
    "SetupNavigation": null,
    "SetupPickables": null,
    "LoadMolecule": null,
    "SetupMenus": null,
    "FinalizeScene": null
};

let promiseStates = {};

const enum PromiseState {
    // Note: const enum needed for closure-compiler compatibility.
    PENDING = 1,
    FULFILLED = 2,
    IGNORE = 3
}

export function setPromise(name: string, dependencies: string[], promiseFunc: Function, ignoreIfNeverFulfilled = false): void {
    if (promises[name] === undefined) {
        throw new Error("Promise not registered: " + name);
    }
    const dependenciesLen = dependencies.length;
    for (let i = 0; i < dependenciesLen; i++) {
        const dependencyName = dependencies[i];
        if (promises[dependencyName] === undefined) {
            throw new Error("Promise not registered: " + dependencyName);
        }
    }

    promiseStates[name] = PromiseState.PENDING;

    promises[name] = waitFor(dependencies).then(() => {
        return new Promise((resolve, reject) => {
            promiseStates[name] = PromiseState.FULFILLED;
            promiseFunc(resolve);
        });
    });
}

export function waitFor(names: string[]): Promise<any> {
    let promisesToResolve = names.map(m => promises[m]);

    if (promisesToResolve.indexOf(null) !== -1) {
        throw new Error("Trying to wait for a promise that hasn't been defined yet! One of these: " + names.toString());
    }

    return Promise.all(promisesToResolve);
}

export function debug(): void {
    const name = Object.keys(promises);
    const nameLen = name.length;
    for (let i = 0; i < nameLen; i++) {
        const key = name[i];
        const val = promises[key];
        console.log(key, val);
    }
    // debugger;
}

/**
 * This fulfills a promise directly, without running associated code. When
 * running in WebRTC mode, you need to just fulfill promises like "InitVR"
 * without actually running anything.
 * @param  {string} promiseName  The name of the promise.
 * @returns void
 */
export function directlyFulfillPromise(promiseName: string): void {
    setPromise(
        promiseName, [],
        (resolve) => {
            resolve();
        }
    );
}

// Below is for debugging. Comment out in production code.
setTimeout(() => {
    const names = Object.keys(promises);
    const namesLen = names.length;
    for (let i = 0; i < namesLen; i++) {
        const name = names[i];
        const promiseState = promiseStates[name];
        let msg: string;
        switch(promiseState) {
            case undefined:
                msg = "Promise never set: " + name + ".";
                // throw new Error("Promise never set: " + name + ".");
                console.log(msg);
            case PromiseState.PENDING:
                // Comment out below when not in production. Very slow
                // connections could legitimately take a while to fulfill all
                // promises.
                msg = "Promise should be fulfilled by now: " + name;
                // throw new Error(msg);
                console.log(msg);
        }
    }
}, PROMISE_TIMEOUT_MILLISECONDS);
