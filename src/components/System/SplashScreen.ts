// On some devices like iOS13, you'll need the user to specifically authorize
// the device orientation sensors. We can do this through a simple "splash
// screen".

import * as OpenPopup from "../UI/OpenPopup/OpenPopup";
import * as Vars from "../Vars/Vars";

export function showSplashScreen(onClick: any): void {
    let msg = `
    <div class="media">
        <img src="icon-512.png" style="max-width: 25%;" class="mr-3" alt="ProtienVR Logo">
        <div class="media-body">
            <h5 class="mt-0">Welcome to ProteinVR ${Vars.VERSION}</h5>
            <p>Brought to you by the <a href="http://durrantlab.com" target="_blank">Durrant Lab</a>.</p>
            <p>Please authorize access to your device's orientation sensors to continue.</p>
        </div>
    </div>`;
    OpenPopup.openModal({
        title: "Welcome",
        content: msg,
        isUrl: false,
        btnText: "Authorize",
        onCloseCallback: () => {
            onClick();
        }
    });
}
