import * as Vars from "../Vars";

let intervalID;

/**
 * Removes the initial loading screen, to let the user know that the initial
 * javascript file is loading.
 * @returns void
 */
export function removeLoadingJavascriptScreen(): void {
    // Remove the initial loading javascript screen (not the babylonjs loading
    // screen... That's to come).
    document.getElementById("loading-container").outerHTML = "";
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

export function startFakeLoading(initialVal: number): void {
    let fakeVal = initialVal;
    clearInterval(intervalID);
    intervalID = setInterval(() => {
        fakeVal = fakeVal + 0.02 * (99 - fakeVal);
        Vars.engine.displayLoadingUI();  // Keep it up while progressing...
        Vars.engine.loadingUIText = "Loading the main scene... " + fakeVal.toFixed(0) + "%";
    }, 100);
}

export function stopFakeLoading(): void {
    clearInterval(intervalID);
}
