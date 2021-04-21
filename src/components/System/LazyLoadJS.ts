// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Some javascript should be lazy loaded, but doesn't support Webpack dynamnic
// imports.

let alreadyLoaded = new Set([]);

export function lazyLoadJS(path: string): Promise<any> {
    if (alreadyLoaded.has(path)) {
        return Promise.resolve();
    }

    // See
    // https://stackoverflow.com/questions/14521108/dynamically-load-js-inside-js
    return new Promise<void>((resolve, reject) => {
        var script = document.createElement("script");
        script.onload = () => {
            alreadyLoaded.add(path);
            resolve();
        };
        script.src = path;
        document.head.appendChild(script);
    });
}
