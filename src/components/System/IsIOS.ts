// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

// To check if it is iOS mobile.

/**
 * Determines whether running on iOS.
 * @returns boolean  true if on iOS, false otherwise.
 */
export function iOS(): boolean {
    // See https://stackoverflow.com/questions/9038625/detect-if-device-is-ios
    // Not sure how long this will continue to work...
    return [
        'iPad Simulator',
        'iPhone Simulator',
        'iPod Simulator',
        'iPad',
        'iPhone',
        'iPod'
    ].includes(navigator.platform)

    // iPad on iOS 13 detection
    || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
}

/**
 * Determines whether in iOS and landscape mode.
 * @returns *  undefined if not iOS, true if iOS and landscape, false if iOS
 *             and portrait.
 */
export function isIOSLandscape(): any {
    if (!iOS()) {
        // Not iOS, so undefined
        return undefined;
    }

    // It is iOS.
    return window.innerHeight < window.innerWidth;
}
