// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

import * as ThreeDMol from "../Mols/3DMol/ThreeDMol";
import * as VisStyles from "../Mols/3DMol/VisStyles";
import * as VRML from "../Mols/3DMol/VRML";
import * as Student from "../WebRTC/Student";
import * as Vars from "./Vars";
import * as CommonCamera from "../Cameras/CommonCamera";

declare var jQuery: any;
declare var BABYLON: any;

const stylesQueue: any[] = [];
export let webrtc: any = undefined;
export let shadows = false;
let urlParams: any;
let autoUpdateUrlEnabled = true;

/**
 * Whether to periodically update the URL with information re. the scene and
 * camera position.
 * @param  {boolean} val  True if the url should be updated. False otherwise.
 * @returns void
 */
export function enableAutoUpdateUrl(val: boolean): void {
    autoUpdateUrlEnabled = val;
}

/**
 * Get all the url parameters from a url string.
 * @param  {string} url  The url srtring.
 * @returns Object<string,*> The parameters.
 */
function getAllUrlParams(url: string): any {
    // Adapted from
    // https://www.sitepoint.com/get-url-parameters-with-javascript/

    // get query string from url (optional) or window
    let queryString = url ? url.split("?")[1] : window.location.search.slice(1);

    // we'll store the parameters here
    const obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split("#")[0];

        // split our query string into its component parts
        const arr: string[] = queryString.split("&");

        const arrLen = arr.length;
        for (let i = 0; i < arrLen; i++) {
            const a = arr[i];
            // separate the keys and the values
            const keyValPair = a.split("=");

            // set parameter name and value (use 'true' if empty)
            const paramName = keyValPair[0];
            const paramValue = (keyValPair[1] === undefined) ? true : keyValPair[1];

            obj[paramName] = paramValue;
        }
    }

    return obj;
}

/**
 * Round a number and represent it as a string.
 * @param  {number} x  The number.
 * @returns string  The rounded string.
 */
function round(x: number): string {
    return (Math.round(100000 * x) / 100000).toString();
}

/**
 * Set the browser url to reflect the latest styles and rotations.
 * @returns void
 */
export function setURL(): void {
    if (autoUpdateUrlEnabled === false) {
        return;
    }

    let params = [];

    // Get the rotations.
    /** @type {number} */
    const x = VRML.molRotation.x;
    if (x !== 0) {
        params.push("rx=" + round(x));
    }

    /** @type {number} */
    const y = VRML.molRotation.y;
    if (y !== 0) {
        params.push("ry=" + round(y));
    }

    /** @type {number} */
    const z = VRML.molRotation.z;
    if (z !== 0) {
        params.push("rz=" + round(z));
    }

    // Set the url of molecular model.
    params.push("s=" + ThreeDMol.modelUrl);

    if (webrtc !== undefined) {
        console.log("setting webrtc...");
        params.push("f=" + webrtc);
    }

    // Also get all the representations
    let i = 0;
    const styles = [];
    const keys = Object.keys(VisStyles.styleMeshes);
    const len = keys.length;
    for (let i2 = 0; i2 < len; i2++) {
        const key = keys[i2];
        if (VisStyles.styleMeshes[key].mesh.isVisible) {
            styles.push("st" + i.toString() + "=" + key);
            i++;
        }
    }
    params = params.concat(styles);

    // Also get the camera position and rotation.
    const cameraPos = CommonCamera.getCameraPosition();
    const cameraRot = CommonCamera.getCameraRotationQuaternion();
    params.push("cx=" + round(cameraPos["x"]));
    params.push("cy=" + round(cameraPos["y"]));
    params.push("cz=" + round(cameraPos["z"]));
    params.push("crx=" + round(cameraRot["x"]));
    params.push("cry=" + round(cameraRot["y"]));
    params.push("crz=" + round(cameraRot["z"]));
    params.push("crw=" + round(cameraRot["w"]));

    // Also get the environment
    params.push("e=" + Vars.sceneName);

    if (shadows === undefined) { shadows = false; }

    params.push("sh=" + shadows.toString());

    // Update URL. Note that if you change the url while waiting for the user
    // to authorize VR, it will throw an error. So make sure that's not what's
    // going on.
    window.history.pushState(
        {
            // "html": response.html,
            // "pageTitle": response.pageTitle,
        },
        document.title,
        window.location.href.split("?")[0] + "?" + params.join("&")
    );
}

/**
 * This function gets the environment name. It's separated from
 * readUrlParams() because you need th environment name earlier in the
 * loadding process.
 * @returns void
 */
export function readEnvironmentNameParam(): void {
    urlParams = getAllUrlParams(window.location.href);

    // Get the environment.
    const environ = urlParams["e"];
    if (environ !== undefined) {
        Vars.setSceneName(environ);
    }
}

/**
 * Gets info from the url parameters and saves/applies it, as appropriate.
 * Note that this gets what molecular styles need to be applied, but does not
 * apply them. It should only be run once (the initial read).
 * @returns void
 */
export function readUrlParams(): void {
    // Before anything, check if this is a webrtc session.
    webrtc = urlParams["f"];
    if (webrtc !== undefined) {
        Student.startFollowing(webrtc);

        // Prevent the student from being able to change the view or anything.
        Vars.scene.activeCamera.inputs.clear();

        // Also hide/move some of the buttons.
        jQuery("#help-button").hide();
        jQuery("#leader").hide();
        jQuery("#babylonVRiconbtn").hide();
        jQuery("#open-button").hide();
        const fullscreenButton = jQuery("#fullscreen-button");
        const bottom = fullscreenButton.css("bottom");
        if (bottom !== undefined) {
            const top = +bottom.replace(/px/g, "");
            fullscreenButton.css("bottom", (top - 60).toString() + "px");
        }

        // Make sure clicking on the screen doesn't move either. Basically
        // disable all teleportation.
        jQuery("#capture-clicks").remove();

        // Show a warning message.
        let followerModeWarning = jQuery("#followerModeWarning");
        followerModeWarning.fadeIn(500);

        setTimeout(() => {
            followerModeWarning.fadeOut(500);
        }, 8000);
    }

    // Update the mesh rotations
    /** @type {number} */
    let rx = urlParams["rx"];

    /** @type {number} */
    let ry = urlParams["ry"];

    /** @type {number} */
    let rz = urlParams["rz"];

    rx = (rx === undefined) ? 0 : +rx;
    ry = (ry === undefined) ? 0 : +ry;
    rz = (rz === undefined) ? 0 : +rz;
    VRML.setMolRotation(rx, ry, rz);

    // Set the protein model if it's present.
    /** @type {string} */
    let src = urlParams["s"];
    if ((src !== undefined) && (src !== "")) {
        if ((src.length === 4) && (src.indexOf(".") === -1)) {
            // Assume it's a pdb id
            src = "https://files.rcsb.org/view/" + src.toUpperCase() + ".pdb";
        }
        ThreeDMol.setModelUrl(src);
    }

    // Setup the styles as well.
    /** @type {Array<string>} */
    const keys = Object.keys(urlParams);
    const len = keys.length;
    for (let i = 0; i < len; i++) {
        const key = keys[i];
        if (key.slice(0, 2) === "st") {
            const repInfo = extractRepInfoFromKey(urlParams[key]);
            stylesQueue.push(repInfo);
        }
    }

    // If stylesQueue has nothing in it, set up a default rep.
    if (stylesQueue.length === 0) {
        stylesQueue.push([["Protein", "All"], "Cartoon", "Spectrum"]);
        stylesQueue.push([["Nucleic", "All"], "Stick", "Element"]);
        stylesQueue.push([["Ligand", "All"], "Stick", "Element"]);
    }

    // Position the camera
    const cx = urlParams["cx"];
    const cy = urlParams["cy"];
    const cz = urlParams["cz"];
    if ((cx !== undefined) && (cy !== undefined) && (cz !== undefined)) {
        CommonCamera.setCameraPosition(new BABYLON.Vector3(+cx, +cy, +cz));
    }

    const crx = urlParams["crx"];
    const cry = urlParams["cry"];
    const crz = urlParams["crz"];
    const crw = urlParams["crw"];
    if ((crx !== undefined) && (cry !== undefined) && (crz !== undefined) && (crw !== undefined)) {
        CommonCamera.setCameraRotationQuaternion(new BABYLON.Quaternion(+crx, +cry, +crz, +crw));
    }

    // Determine if shadows or not.
    shadows = urlParams["sh"];

    // Start updating the URL periodically. Because of camera changes.
    autoUpdateUrl();
}

/**
 * Takes a string like All--Ligand--Stick--Element and converts it to [["All",
 * "Ligand"], "Stick", "Element"].
 * @param  {string} key  The srting.
 * @returns Array<*>
 */
export function extractRepInfoFromKey(key: string): any[] {
    const prts = key.split("--");
    const rep = decodeURIComponent(prts[prts.length - 2]);
    const colorScheme = decodeURIComponent(prts[prts.length - 1]);
    const sels = prts.slice(0, prts.length - 2).map(
        (i: string) => {
            i = decodeURIComponent(i);
            if (i.slice(0, 1) === "{") {
                i = JSON.parse(i);
            }
            return i;
        },
    );
    return [sels, rep, colorScheme];
}

/**
 * Start loading all the molecular styles described in the url. A recursive
 * function.
 * @returns void
 */
export function startLoadingStyles(): void {
    if (stylesQueue.length > 0) {
        // There are some styles to still run.
        const style = stylesQueue.pop();
        VisStyles.toggleRep(style[0], style[1], style[2], () => {
            // Try to get the next style.
            startLoadingStyles();
        });
    }
}

/**
 * Checks if "f=" in url (webrtc). This works even if UrlVars hasn't been set yet.
 * @returns boolean
 */
export function checkIfWebRTCInUrl(): boolean {
    return window.location.href.indexOf("f=") !== -1;
}

/**
 * Checks if "sh=" in url (shadows). This works even if UrlVars hasn't been
 * set yet.
 * @returns boolean
 */
export function checkShadowInUrl(): boolean {
    return window.location.href.indexOf("sh=t") !== -1;
}

/**
 * Periodically update the url. This is because the camera can change, but I
 * don't want to update the url with every tick of the loop.
 * @returns void
 */
function autoUpdateUrl(): void {
    setInterval(() => {
        // As long as the modal isn't open, update the url. Important to only
        // do it when modal is closed. Otherwise firefox mobile environment
        // select auto closes. TODO: Could use OpenPopup.modalCurrentlyOpen
        // instead. Would be better.
        if (jQuery("#msgModal").css("display") !== "block") {
            setURL();
        }
    }, 1000);
}
