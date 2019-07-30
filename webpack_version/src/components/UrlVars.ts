import * as ThreeDMol from "./Mols/3DMol/ThreeDMol";
import * as Visualize from "./Mols/3DMol/Visualize";
import * as VRML from "./Mols/3DMol/VRML";
import * as Student from "./WebRTC/Student";
import * as Vars from "./Vars";

declare var jQuery: any;

let stylesQueue: any[] = [];
let webrtc: any;

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
        params.push("x=" + round(x));
    }

    /** @type {number} */
    let y = VRML.molRotation.y;
    if (y !== 0) {
        params.push("y=" + round(y));
    }

    /** @type {number} */
    let z = VRML.molRotation.z;
    if (z !== 0) {
        params.push("z=" + round(z));
    }

    // Set the url.
    params.push("src=" + ThreeDMol.modelUrl);

    if (webrtc !== undefined) {
        params.push("webrtc=" + webrtc);
    }

    // Also get all the representations
    let i = 0;
    let styles = [];
    let keys = Object.keys(Visualize.styleMeshes);
    let len = keys.length;
    for (let i2 = 0; i2 < len; i2++) {
        let key = keys[i2];
        if (Visualize.styleMeshes[key].mesh.isVisible) {
            styles.push("style" + i.toString() + "=" + key);
            i++;
        }
    }
    params = params.concat(styles);

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
 * apply them.
 * @returns void
 */
export function readUrlParams(): void {
    let params = getAllUrlParams(window.location.href);

    // Before anything, check if this is a webrtc session.
    webrtc = params["webrtc"];
    if (webrtc !== undefined) {
        Student.startFollowing(webrtc);

        // Prevent the student from being able to change the view or anything.
        Vars.scene.activeCamera.inputs.clear();

        // Also hide some of the buttons.
        jQuery("#help-button").hide();
        jQuery("#follow-the-leader").hide();
        jQuery("#babylonVRiconbtn").hide();
        let fullscreenButton = jQuery("#fullscreen-button");
        let top = +fullscreenButton.css("bottom").replace(/px/g, "");
        fullscreenButton.css("bottom", (top - 60).toString() + "px");
    }

    // Update the mesh rotations
    /** @type {number} */
    let x = params["x"];

    /** @type {number} */
    let y = params["y"];

    /** @type {number} */
    let z = params["z"];

    x = (x === undefined) ? 0 : +x;
    y = (y === undefined) ? 0 : +y;
    z = (z === undefined) ? 0 : +z;
    VRML.setMolRotation(x, y, z);

    // Set the url if it's present.
    /** @type {string} */
    let src = params["src"];
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
        if (key.slice(0, 5) === "style") {
            let repInfo = extractRepInfoFromKey(params[key]);
            stylesQueue.push(repInfo);
        }
    }

    // If stylesQueue has nothing in it, set up a default rep.
    if (stylesQueue.length === 0) {
        stylesQueue.push([["Protein", "All"], "Cartoon", "Spectrum"]);
        stylesQueue.push([["Ligand", "All"], "Stick", "Element"]);
    }
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
