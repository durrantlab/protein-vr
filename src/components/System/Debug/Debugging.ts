// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Functions for debugging.

import * as Vars from "../../Vars/Vars";

declare var VConsole;

/**
 * Enables debugging. Comment out entirely when not in use.
 * @returns Promise  A promise that is fulfilled when debugging ready.
 */
export function enableDebugging(): Promise<any> {
    //////// Comment out below if block when not testing. ///////

    // if (true) {  // (window.location.href.indexOf("pvr_do_debug") !== -1) {
    //     // debugging enabbled
    //     return new Promise((resolve: Function, reject: Function) => {
    //         window["debugMode"] = debugMode;

    //         window["remote"] = function() {
    //             let lastCmd = "";
    //             let fetching = false;
    //             setInterval(
    //                 () => {
    //                     if (fetching) {
    //                         return;
    //                     }

    //                     // See
    //                     // https://stackoverflow.com/questions/43262121/trying-to-use-fetch-and-pass-in-mode-no-cors
    //                     var proxyUrl = '',  // 'https://cors-anywhere.herokuapp.com/',
    //                     targetUrl = 'https://durrantlab.pitt.edu/tmp/cmd.txt'
    //                     fetching = true;
    //                     fetch(proxyUrl + targetUrl + "?" + new Date().getTime().toString()).then(response => {
    //                         response.text().then((text) => {
    //                             if (lastCmd !== text) {
    //                                 try {
    //                                     eval(text);  // TODO: DANGEROUS! DON'T USE IN PRODUCTION!!!
    //                                 } catch {
    //                                     console.log("ERROR: " + text);
    //                                 }
    //                                 lastCmd = text;
    //                             }
    //                             fetching = false;
    //                         });
    //                     }).catch(e => {
    //                         // console.log(e);
    //                         fetching = false;
    //                         return e;
    //                     });
    //                 },
    //                 2500
    //             );
    //         }
    //         window["remote"]();

    //         // For debugging
    //         // See https://stackoverflow.com/questions/14521108/dynamically-load-js-inside-js
    //         var script = document.createElement('script');
    //         script.src = 'https://cdnjs.cloudflare.com/ajax/libs/vConsole/3.3.4/vconsole.min.js';
    //         document.head.appendChild(script);
    //         script.onload = function () {
    //             var vConsole = new VConsole();
    //             resolve();
    //         };
    //     });
    // }

    // No debugging (leave commented in always, even in production)
    return Promise.resolve();
}

// TODO: Comment this out for build time! Slows things down a lot.

// /**
//  * A function to activate debug mode (babylonjs)
//  * @returns void
//  */
// function debugMode(): void {
//     import(
//         /* webpackChunkName: "debugLayer" */
//         /* webpackMode: "lazy" */
//         "@babylonjs/core/Debug/debugLayer"
//     ).then(() => {
//         return import(
//             /* webpackChunkName: "inspector" */
//             /* webpackMode: "lazy" */
//             "@babylonjs/inspector"
//         )
//     }).then(() => {
//         Vars.scene.debugLayer.show().then(() => {
//             document.getElementById("inspector-host").style.zIndex = "15";
//             document.getElementById("scene-explorer-host").style.zIndex = "15";
//         });
//     })
// }

// window["debugMode"] = debugMode;
