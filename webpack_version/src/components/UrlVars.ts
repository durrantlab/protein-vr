import * as ThreeDMol from "./Mols/3DMol/ThreeDMol";
import * as Visualize from "./Mols/3DMol/Visualize";
import * as VRML from "./Mols/3DMol/VRML";
import * as Student from "./WebRTC/Student";
import * as Vars from "./Vars";
import * as CommonCamera from "./Cameras/CommonCamera";

declare var jQuery: any;
declare var BABYLON: any;

let stylesQueue: any[] = [];
export let webrtc: any = undefined;

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
    let obj = {};

    // if query string exists
    if (queryString) {

        // stuff after # is not part of query string, so get rid of it
        queryString = queryString.split("#")[0];

        // split our query string into its component parts
        let arr: string[] = queryString.split("&");

        let arrLen = arr.length;
        for (let i = 0; i < arrLen; i++) {
            let a = arr[i];
            // separate the keys and the values
            let keyValPair = a.split("=");

            // set parameter name and value (use 'true' if empty)
            let paramName = keyValPair[0];
            let paramValue = (keyValPair[1] === undefined) ? true : keyValPair[1];

            obj[paramName] = paramValue;
        }
    }

    return obj;
}

/**
 * Round a number and represent it as a string.
 * @param  {number} x  The number.
 * @returns string The rounded string.
 */
function round(x: number): string {
    return (Math.round(100000 * x) / 100000).toString();
}

/**
 * Set the browser url to reflect the latest styles and rotations.
 * @returns void
 */
export function setURL(): void {
    let params = [];

    // Get the rotations.
    /** @type {number} */
    let x = VRML.molRotation.x;
    if (x !== 0) {
        params.push("rx=" + round(x));
    }

    /** @type {number} */
    let y = VRML.molRotation.y;
    if (y !== 0) {
        params.push("ry=" + round(y));
    }

    /** @type {number} */
    let z = VRML.molRotation.z;
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
    let styles = [];
    let keys = Object.keys(Visualize.styleMeshes);
    let len = keys.length;
    for (let i2 = 0; i2 < len; i2++) {
        let key = keys[i2];
        if (Visualize.styleMeshes[key].mesh.isVisible) {
            styles.push("st" + i.toString() + "=" + key);
            i++;
        }
    }
    params = params.concat(styles);

    // Also get the camera position and rotation.
    let cameraPos = CommonCamera.getCameraPosition();
    let cameraRot = CommonCamera.getCameraRotationQuaternion();
    params.push("cx=" + round(cameraPos["x"]))
    params.push("cy=" + round(cameraPos["y"]))
    params.push("cz=" + round(cameraPos["z"]))
    params.push("crx=" + round(cameraRot["x"]))
    params.push("cry=" + round(cameraRot["y"]))
    params.push("crz=" + round(cameraRot["z"]))
    params.push("crw=" + round(cameraRot["w"]))

    // Update URL
    window.history.pushState(
        {
            // "html": response.html,
            // "pageTitle": response.pageTitle,
        },
        document.title,
        window.location.href.split("?")[0] + "?" + params.join("&"),
    );
}

/**
 * Gets info from the url parameters and saves/applies it, as appropriate.
 * Note that this gets what molecular styles need to be applied, but does not
 * apply them. It should only be run once (the initial read).
 * @returns void
 */
export function readUrlParams(): void {
    let params = getAllUrlParams(window.location.href);

    // Before anything, check if this is a webrtc session.
    webrtc = params["f"];
    if (webrtc !== undefined) {
        Student.startFollowing(webrtc);

        // Prevent the student from being able to change the view or anything.
        Vars.scene.activeCamera.inputs.clear();

        // Also hide/move some of the buttons.
        jQuery("#help-button").hide();
        jQuery("#follow-the-leader").hide();
        jQuery("#babylonVRiconbtn").hide();
        let fullscreenButton = jQuery("#fullscreen-button");
        let top = +fullscreenButton.css("bottom").replace(/px/g, "");
        fullscreenButton.css("bottom", (top - 60).toString() + "px");

        // Make sure clicking on the screen doesn't move either. Basically
        // disable all teleportation.
        jQuery("#capture-clicks").remove();
    }

    // Update the mesh rotations
    /** @type {number} */
    let rx = params["rx"];

    /** @type {number} */
    let ry = params["ry"];

    /** @type {number} */
    let rz = params["rz"];

    rx = (rx === undefined) ? 0 : +rx;
    ry = (ry === undefined) ? 0 : +ry;
    rz = (rz === undefined) ? 0 : +rz;
    VRML.setMolRotation(rx, ry, rz);

    // Set the protein model if it's present.
    /** @type {string} */
    let src = params["s"];
    if (src !== undefined) {
        if ((src.length === 4) && (src.indexOf(".") === -1)) {
            // Assume it's a pdb id
            src = "https://files.rcsb.org/view/" + src.toUpperCase() + ".pdb";
        }
        ThreeDMol.setModelUrl(src);
    }

    // Setup the styles as well.
    /** @type {Array<string>} */
    let keys = Object.keys(params);
    let len = keys.length;
    for (let i = 0; i < len; i++) {
        let key = keys[i];
        if (key.slice(0, 2) === "st") {
            let repInfo = extractRepInfoFromKey(params[key]);
            stylesQueue.push(repInfo);
        }
    }

    // If stylesQueue has nothing in it, set up a default rep.
    if (stylesQueue.length === 0) {
        stylesQueue.push([["Protein", "All"], "Cartoon", "Spectrum"]);
        stylesQueue.push([["Ligand", "All"], "Stick", "Element"]);
    }

    // Position the camera
    let cx = params["cx"]
    let cy = params["cy"]
    let cz = params["cz"]
    if ((cx !== undefined) && (cy !== undefined) && (cz !== undefined)) {
        CommonCamera.setCameraPosition(new BABYLON.Vector3(+cx, +cy, +cz));
    }

    let crx = params["crx"];
    let cry = params["cry"];
    let crz = params["crz"];
    let crw = params["crw"];
    if ((crx !== undefined) && (cry !== undefined) && (crz !== undefined) && (crw !== undefined)) {
        // TODO: ROTATION DOESN'T SEEM TO REALLY WORK...
        CommonCamera.setCameraRotationQuaternion(new BABYLON.Quaternion(+crx, +cry, +crz, +crw));
    }

    // Start updating the URL periodically. Because of camera changes.
    autoUpdateUrl();
}

/**
 * Takes a string like All--Ligand--Stick--Element and converts it to [["All",
 * "Ligand"], "Stick", "Element"].
 * @param  {string} key The srting.
 * @returns Array<*>
 */
export function extractRepInfoFromKey(key: string): any[] {
    let prts = key.split("--");
    let rep = decodeURIComponent(prts[prts.length - 2]);
    let colorScheme = decodeURIComponent(prts[prts.length - 1]);
    let sels = prts.slice(0, prts.length - 2).map(
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
        let style = stylesQueue.pop();
        Visualize.toggleRep(style[0], style[1], style[2], () => {
            // Try to get the next style.
            startLoadingStyles();
        });
    }
}

/**
 * Checks if "f=" in url (webrtc). This works even if UrlVars hasn't been set yet.
 * @returns boolean
 */
export function checkWebrtcInUrl(): boolean {
    return window.location.href.indexOf("f=") !== -1;
}

/**
 * Periodically update the url. This is because the camera can change, but I
 * don't want to update the url with every tick of the loop.
 * @returns void
 */
function autoUpdateUrl(): void {
    // TODO: Might be good to check if camera has moved.
    setInterval(() => {
        setURL();
    }, 1000);
}
