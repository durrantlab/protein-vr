// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

// On iOS, you must get user's permission to use device orientation sensor.

import * as PromiseStore from "../PromiseStore";
import * as SplashScreen from "./SplashScreen";

/**
 * Request access to the device orientation sensor.
 * @returns void
 */
export function requestDeviceOrientation(): void {
    PromiseStore.setPromise(
        "DeviceOrientationAuthorizedIfNeeded", [],
        (resolve) => {
            // See
            // https://medium.com/flawless-app-stories/how-to-request-device-motion-and-orientation-permission-in-ios-13-74fc9d6cd140
            if (typeof DeviceMotionEvent["requestPermission"] === "function") {
                SplashScreen.showSplashScreen(() => {
                    // iOS 13+.
                    DeviceOrientationEvent["requestPermission"]()
                    .then(response => {
                        if (response == 'granted') {
                            // window.addEventListener('deviceorientation', (e) => {});
                            resolve();
                        }
                    })
                    .catch(console.error)
                });
            } else {
                // not on iOS 13+
                resolve();
            }
        }
    );
}
