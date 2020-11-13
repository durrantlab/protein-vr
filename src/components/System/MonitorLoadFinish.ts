// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import * as SimpleModalComponent from "../UI/Vue/Components/OpenPopup/SimpleModalComponent"

export const enum LoadAttemptStatus {
    // Note: const enum needed for closure-compiler compatibility.
    SUCCESS = 1,  // Do nothing
    ONE_FAILURE = 2,  // Shadows off
    MULTIPLE_FAILURES = 3,  // Reset entirely
    RESET_SCENE = 4
}

export var status = LoadAttemptStatus.SUCCESS;

let numLoadAttempts = 0;
let alreadyIncremented = false;
let alreadyLoadedSuccessful = false;

/**
 * Increments the number of times load has been attempted in sessionStorage.
 * Also sets the status, redirects using "?reset" if necessary, etc.
 * @returns void
 */
export function incrementLoadCounter(): void {
    // Make sure only runs once.
    if (alreadyIncremented) {
        return;
    }
    alreadyIncremented = true;

    // Get the number of previous load attempts.
    let numLoadAttemptsSS = sessionStorage.getItem("loadAttempts");
    numLoadAttempts = (numLoadAttemptsSS === null) ? 0 : parseInt(numLoadAttemptsSS);

    // Set the status.
    switch (numLoadAttempts) {
        case 0:
            status = LoadAttemptStatus.SUCCESS;
            break;
        case 1:
            status = LoadAttemptStatus.ONE_FAILURE;
            break;
        default:
            status = LoadAttemptStatus.MULTIPLE_FAILURES;
    }

    // Update the attempts counter (sessionStorage).
    sessionStorage.setItem("loadAttempts", (numLoadAttempts + 1).toString());

    if (window.location.href.indexOf("?reset") !== -1) {
        status = LoadAttemptStatus.RESET_SCENE;
    }

    // If you're on many attmpts, reset the whole scene.
    if (status === LoadAttemptStatus.MULTIPLE_FAILURES) {
        loadSuccessful(false);
        window.location.href = window.location.href.split("?")[0] + "?reset";
        return;
    }
}

/**
 * Runs if the load succeeds.
 * @param  {boolean} [showMsg=true]  Whether to show a message showing what
 *                                   happened on multiple load failures.
 * @returns void
 */
export function loadSuccessful(showMsg = true): void {
    // Make sure only runs once.
    if (alreadyLoadedSuccessful) {
        return;
    }
    alreadyLoadedSuccessful = true;

    sessionStorage.removeItem("loadAttempts");

    let msg = "";

    switch (status) {
        case LoadAttemptStatus.SUCCESS:
            // Do nothing
            break;
        case LoadAttemptStatus.ONE_FAILURE:
            // Shadows were disabled.
            msg = "Deactivated shadows to boost performance.";
            break;
        case LoadAttemptStatus.RESET_SCENE:
            // Restart
            msg = "Reset scene to recover. Sorry for the inconvenience!";
            break;
    }

    if ((showMsg) && (msg !== "")) {
        SimpleModalComponent.openSimpleModal({
            title: "Unexplained Error",
            content: msg,
            hasCloseBtn: true,
            unclosable: false
        }, false);
    }
}
