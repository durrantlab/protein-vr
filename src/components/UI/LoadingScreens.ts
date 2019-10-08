// Copyright 2019 Jacob D. Durrant

import * as Vars from "../Vars/Vars";

let intervalID: any;

/**
 * Removes the initial loading screen, to let the user know that the initial
 * javascript file is loading.
 * @returns void
 */
export function removeLoadingJavascriptScreen(): void {
    // Remove the initial loading javascript screen (not the babylonjs loading
    // screen... That's to come).
    document.getElementById("loadingContainer").outerHTML = "";
}

/**
 * Update the text displayed on the babylonjs loading scene.
 * @param  {string} msg  The text to update.
 * @returns void
 */
export function babylonJSLoadingMsg(msg: string): void {
    // Just to make sure there isn't a fight between the two ways of showing
    // babylonjs loading messages.
    stopFakeLoading();

    Vars.engine.displayLoadingUI();  // Keep it up while progressing...
    Vars.engine.loadingUIText = msg;
}

/**
 * Starts the fake loading screen, to give the impression that things are
 * loading.
 * @param  {number} initialVal  The initial fake value (%).
 * @returns void
 */
export function startFakeLoading(initialVal: number): void {
    let fakeVal = initialVal;
    clearInterval(intervalID);
    intervalID = setInterval(() => {
        fakeVal = fakeVal + 0.02 * (99 - fakeVal);
        Vars.engine.displayLoadingUI();  // Keep it up while progressing...
        Vars.engine.loadingUIText = "Loading the main scene... " + fakeVal.toFixed(0) + "%<br /><br />(Loading too slow? Reload page, use Incognito<br />mode, or clear browser cache.)";
    }, 100);
}

/**
 * Stop the fake-loading splash screen.
 * @returns void
 */
export function stopFakeLoading(): void {
    clearInterval(intervalID);
}
