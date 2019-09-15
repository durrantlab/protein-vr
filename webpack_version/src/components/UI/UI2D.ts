// Sets up tweaks to the UI.

import * as OpenPopup from "./OpenPopup/OpenPopup";
import * as Vars from "../Vars/Vars";
import * as Lecturer from "../WebRTC/Lecturer";

declare var jQuery: any;

interface I2DButton {
    svg: string;
    title: string;
    id: string;
    clickFunc: any;
}

/**
 * Sets up the 2D button that can be used to launch VR.
 * @returns void
 */
export function setup(): void {
    addRunModeButtons();
}

/**
 * Adds the 2D button to the DOM, makes it clickable.
 * @returns void
 */
function addRunModeButtons(): void {
    // Create a list of the buttons, from the one on the top to the one on the
    // bottom. Doesn't include VR button, because that's added elsewhere.
    // Icons should fit within 80px x 50px.

    const dimen = "48";  // The icon dimensions (square).

    const btns: I2DButton[] = [
        {
            // https://pixabay.com/vectors/folder-directory-open-computer-26694/
            svg: `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
                    width="${dimen}px" height="${dimen}px" viewBox="0 0 ${dimen} ${dimen}" enable-background="new 0 0 48 48" xml:space="preserve">
                    <g>
                        <path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round" d="M41.99,17.573v-5.209
                            c0-0.588-0.717-1.092-1.615-1.092H25.123V8.92c0-0.336-0.449-0.672-0.987-0.672H1.077C0.449,8.248,0,8.583,0,8.92v3.444
                            c0,0,0,0,0,0.084v25.877c0,0.588,0.717,1.092,1.615,1.092h38.671"/>
                        <path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linejoin="round" d="M7.985,17.573h38.67
                            c0.898,0,1.526,0.504,1.347,1.008l-5.295,19.744c-0.089,0.588-0.985,1.092-1.884,1.092H2.064c-0.898,0-1.526-0.504-1.347-1.008
                            l5.294-19.744C6.19,18.077,7.088,17.573,7.985,17.573L7.985,17.573"/>
                    </g>
                    </svg>`,
            title: "open",
            id: "open-button",
            clickFunc: () => {
                // Give them some time to admire nanokid... :)
                OpenPopup.openModal("Load Molecule", "pages/load.html?warning");
            }
        },
        {
            svg: `<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px" y="0px" width="${dimen}px" height="${dimen}px" viewBox="0 0 ${dimen} ${dimen}" xml:space="preserve">
                        <path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="
                            M35.5,9.8c1.7,5.4-0.6,8-1.6,8.9c-1.9,1.9-4.5,4.7-5.8,7c-1.5,2.7-4.1,12-6.8,4.4c-3.2-9.1,1.3-11.6,3.5-13.4
                            c1.5-1.3,3.4-4.3,0.5-5.3c-4-1.3-6.1,5.3-10.7,4c-3-0.8-3.2-4.1-2.2-6.6C15.4,1.7,32.5,0.6,35.5,9.8L35.5,9.8z"/>
                        <path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" d="M28.3,39.6c0-5.5-8.5-5.5-8.5,0S28.3,45.1,28.3,39.6"/>
                  </svg>`,
            title: "Help",
            id: "help-button",
            clickFunc: () => { OpenPopup.openModal("Help", "pages/index.html", true, true); }
        },
        {
            svg: `<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
             	    x="0px" y="0px" width="${dimen}px" height="${dimen}px" viewBox="0 0 ${dimen} ${dimen}" xml:space="preserve">
                    <path fill="none" stroke="#FFFFFF" stroke-width="1.5" d="M35.4,4.6c-3.2,0-5.8,2.4-5.8,5.8l0,0c0,0.5,0.2,1.1,0.5,1.4l-13.4,7.8
             	    c-1-1.4-2.6-1.8-4.1-1.8c-3.2,0-5.8,2.4-5.8,5.8l0,0c0,2.9,2.6,5.8,5.8,5.8l0,0c1.3,0,2.2-0.5,3.2-1.4l13.6,8.3
             	    c-0.3,0.4-0.3,0.9-0.3,1.4c0,3.4,2.7,5.8,5.9,5.8l0,0c3.2,0,5.6-2.4,5.6-5.8l0,0c0-2.9-2.4-5.9-5.6-5.9l0,0c-1.7,0-3.2,1.1-4.4,2
             	    l-13.1-7.3c0.5-0.9,0.7-2,0.7-2.9c0-0.5,0-1.4-0.2-2l13.3-7.3c1,0.9,2.5,1.5,4.1,1.5c3.2,0,5.9-2.5,5.9-5.4l0,0
             	    C41.3,6.9,38.5,4.6,35.4,4.6L35.4,4.6L35.4,4.6z"/>
                 </svg>`,
            title: "Share (Leader)",
            id: "leader",
            clickFunc: () => {
                Lecturer.startBroadcast();
            }
        },
        {
            // https://iconmonstr.com/fullscreen-thin-svg/
            svg: `<svg style="position:relative; left:0.5px;" width="${dimen}px" height="${dimen}px" xmlns="http://www.w3.org/2000/svg"
                    xmlns:svg="http://www.w3.org/2000/svg" clip-rule="evenodd">
                    <g class="layer">
                        <path d="m47.799999,43.649999l-47.699999,0l0,-39.749999l47.699999,0l0,39.749999zm-1.9875,-37.762499l-43.724999,0l0,35.774999l43.724999,0l0,-35.774999zm-7.95,13.9125l-1.9875,0l0,-6.441487l-22.341487,22.341487l6.441487,0l0,1.9875l-9.9375,0l0,-9.9375l1.9875,0l0,6.441487l22.341487,-22.341487l-6.441487,0l0,-1.9875l9.9375,0l0,9.9375z" fill="#ffffff" id="svg_1"/>
                    </g>
                  </svg>`,
            title: "Full Screen",
            id: "fullscreen-button",
            clickFunc: () => {
                Vars.engine.switchFullscreen(true);
                jQuery("#renderCanvas").focus();  // So keypress will work.
            }
        }
    ];

    // Reverse the buttons.
    let html = "";
    let curBottom = 60;
    for (const btn of btns.reverse()) {
        html += `
            <button
                title="${btn.title}"
                id="${btn.id}"
                class="ui-button"
                style="color:white;
                    width:80px;
                    height:50px;
                    right:5px;
                    position:absolute;
                    bottom:${curBottom.toString()}px;
                    background-color:rgba(51,51,51,0.7);
                    border:none;
                    outline:none;
                    cursor:pointer;">
                    ${btn.svg}
            </button>`;
        curBottom += 55;
    }

    // Add to DOM.
    jQuery("body").append(html);

    // Make buttons clickable
    for (const btn of btns) {
        jQuery("#" + btn.id).click(() => {
            btn.clickFunc();
        });
    }

    // Also make VR button visible.
    const babylonVRiconbtn = document.getElementById("babylonVRiconbtn");
    if (babylonVRiconbtn !== null) {
        babylonVRiconbtn.style.opacity = "1.0";  // Non IE;
        babylonVRiconbtn.style.filter = "alpha(opacity=1.0)";  // IE;
    }
}

/**
 * A function to activate debug mode.
 * @returns void
 */
function debugMode(): void {
    Vars.scene.debugLayer.show();
    setTimeout(() => {
        document.getElementById("inspector-host").style.zIndex = "15";
        document.getElementById("scene-explorer-host").style.zIndex = "15";
    }, 500);
}

// For debugging...
// window["debugMode"] = debugMode;
