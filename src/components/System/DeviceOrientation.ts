import * as PromiseStore from "../PromiseStore";
import * as SplashScreen from "./SplashScreen";

export function requestDeviceOrientation() {
    PromiseStore.setPromise(
        "DeviceOrientationAuthorizedIfNeeded", [],
        (resolve) => {
            // See
            // https://medium.com/flawless-app-stories/how-to-request-device-motion-and-orientation-permission-in-ios-13-74fc9d6cd140
            if (typeof DeviceMotionEvent["requestPermission"] === 'function') {
                SplashScreen.showSplashScreen(() => {
                    // iOS 13+.
                    DeviceOrientationEvent["requestPermission"]()
                    .then(response => {
                        if (response == 'granted') {
                            // window.addEventListener('deviceorientation', (e) => {
                            //     // do something with e
                            // });
                            resolve();
                        }
                    })
                    .catch(console.error)
                });
            } else {
                // non iOS 13+
                resolve();
            }
        }
    );
}
