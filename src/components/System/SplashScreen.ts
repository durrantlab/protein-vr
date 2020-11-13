// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

// On some devices like iOS13, you'll need the user to specifically authorize
// the device orientation sensors. We can do this through a simple "splash
// screen".

// import * as OpenPopup from "../UI/OpenPopup/OpenPopup";
import * as SimpleModalComponent from "../UI/Vue/Components/OpenPopup/SimpleModalComponent";
import * as Vars from "../Vars/Vars";
import * as StatusComponent from "../UI/Vue/Components/StatusComponent";

/**
 * Shows a splash screen. Mostly to get the user to authorize device
 * orientation sensor.
 * @param  {Function} onClick  The function to run when you click the modal.
 * @returns void
 */
export function showSplashScreen(onClick: any): void {
    let msg = `
    <div class="media">
        <img src="icon-512.png" style="max-width: 25%;" class="mr-3" alt="ProtienVR Logo">
        <div class="media-body">
            <h5 class="mt-0">Welcome to ProteinVR ${Vars.VERSION}</h5>
            <p>Brought to you by the <a rel="noopener" href="http://durrantlab.com" target="_blank">Durrant Lab</a>.</p>
            <p>Please authorize access to your device's orientation sensors to continue.</p>
        </div>
    </div>`;

    SimpleModalComponent.openSimpleModal({
        title: "Welcome",
        content: msg,
        hasCloseBtn: true,
        // showBackdrop: true,
        // unclosable: false,
        btnText: "Authorize",
    }, false, () => {
        if (window.location.href.indexOf("testdosplash") !== -1)  {
            // For testcafe
            StatusComponent.setStatus("splash screen loaded");
        } else {
            onClick();
        }

    });
}
