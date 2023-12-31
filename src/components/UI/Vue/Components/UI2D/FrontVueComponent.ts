// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as LoadAll from "../../../../Plugins/LoadSave/LoadAll";
import * as SimpleModalComponent from "../../../Vue/Components/OpenPopup/SimpleModalComponent";
import * as Vars from "../../../../Vars/Vars";
import * as Lecturer from "../../../../WebRTC/Lecturer";
import * as UrlVars from "../../../../Vars/UrlVars";
import {VueComponentParent} from "../VueComponentParent";
import {store} from "../../../../Vars/VueX/VueXStore";
import * as IsIOS from "../../../../System/IsIOS";

// @ts-ignore
import {templateHtml} from "./FrontVueComponent.template.htm.ts";
import { addMessage } from "../MessagesComponent";

interface I2DButton {
    svg: string;
    title: string;
    id: string;
    clickFunc: any;
    curBottom: any;
    showInFollowerMode: boolean;
}

export class FrontVueComponent extends VueComponentParent {
    public tag = "front";
    public methods = {};
    public vueXStore;

    public computed = {
        /**
         * Generate the css styles for this component.
         * @returns string  The css style string.
         */
        "btnsWrapperStyle"(): string {
            if (this.justResized === false) {
                return;
            }

            let curBottom = this.curBottomStart + (
                this["runModeButtons"].length * this.vertSeparationDist
            );

            let styles = "height:" + curBottom.toString() + "px;"

            if (this.justResized) {
                let scale = 1.0;
                if (window.innerHeight < curBottom) {
                    scale = window.innerHeight / curBottom;
                };
                styles += "transform: scale(" + scale.toString() + ");";
                this.justResized = false;
            }

            return styles;
        },

        /**
         * Adds the 2D button to the DOM, makes it clickable.
         * @returns void
         */
        "runModeButtons"(): I2DButton[] {
            // Create a list of the buttons, from the one on the top to the one on the
            // bottom. Doesn't include VR button, because that's added elsewhere.
            // Icons should fit within 80px x 50px.

            const dimen = "48";  // The icon dimensions (square).

            let btns: I2DButton[] = [];

            btns.push({
                "title": "Open Molecule",
                "id": "open-button",

                // https://pixabay.com/vectors/folder-directory-open-computer-26694/
                "svg": `<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
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
                "showInFollowerMode": false,
                "clickFunc": () => {
                    // Give them some time to admire nanokid... :)
                    store.commit("setVar", {
                        moduleName: "replaceWarning",
                        varName: "showWarning",
                        val: true
                    });
                    LoadAll.openLoadSaveModal();
                },
                "curBottom": undefined
            });

            btns.push({
                "title": "Menu",
                "id": "menu-button",

                // https://pixabay.com/vectors/menu-gui-interface-template-ui-303120/
                "svg": `<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        x="0px" y="0px" width="48px" height="48px" viewBox="0 0 48 48" xml:space="preserve">
                        <g>
                            <path id="rect9967" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M17.678,35.173h27.476
                                c1.434,0,2.598,1.136,2.598,2.539l0,0c0,1.4-1.164,2.538-2.598,2.538H17.678c-1.434,0-2.596-1.138-2.596-2.538l0,0
                                C15.082,36.309,16.244,35.173,17.678,35.173z"/>
                            <path id="rect9969" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M8.676,35.013H2.743
                                c-1.434,0-2.597,1.176-2.597,2.62l0,0c0,1.441,1.163,2.617,2.597,2.617h5.933c1.435,0,2.598-1.176,2.598-2.617l0,0
                                C11.274,36.188,10.11,35.013,8.676,35.013z"/>
                            <path id="svg_60" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M17.533,26.506H45.01
                                c1.434,0,2.597,1.134,2.597,2.538l0,0c0,1.406-1.163,2.542-2.597,2.542H17.533c-1.434,0-2.597-1.136-2.597-2.542l0,0
                                C14.936,27.64,16.099,26.506,17.533,26.506z"/>
                            <path id="svg_61" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M8.529,26.349H2.596
                                C1.162,26.349,0,27.52,0,28.966l0,0c0,1.445,1.162,2.62,2.596,2.62h5.933c1.434,0,2.598-1.175,2.598-2.62l0,0
                                C11.127,27.52,9.963,26.349,8.529,26.349z"/>
                            <path id="svg_63" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M17.533,17.049H45.01
                                c1.434,0,2.597,1.138,2.597,2.537l0,0c0,1.405-1.163,2.54-2.597,2.54H17.533c-1.434,0-2.597-1.135-2.597-2.54l0,0
                                C14.936,18.187,16.099,17.049,17.533,17.049z"/>
                            <path id="svg_64" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M8.529,16.891H2.596
                                C1.162,16.891,0,18.059,0,19.507l0,0c0,1.45,1.162,2.625,2.596,2.625h5.933c1.434,0,2.598-1.175,2.598-2.625l0,0
                                C11.127,18.059,9.963,16.891,8.529,16.891z"/>
                            <path id="svg_66" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M17.793,8.605h27.476
                                c1.435,0,2.598,1.136,2.598,2.54l0,0c0,1.402-1.163,2.54-2.598,2.54H17.793c-1.435,0-2.597-1.138-2.597-2.54l0,0
                                C15.196,9.742,16.358,8.605,17.793,8.605z"/>
                            <path id="svg_67" fill="none" stroke="#FFFFFF" stroke-width="1.75" stroke-miterlimit="10" d="M8.789,8.447H2.855
                                c-1.434,0-2.597,1.172-2.597,2.619l0,0c0,1.447,1.163,2.622,2.597,2.622h5.933c1.435,0,2.598-1.175,2.598-2.622l0,0
                                C11.387,9.619,10.224,8.447,8.789,8.447z"/>
                        </g>
                    </svg>`,
            //    `"svg" version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
            //               x="0px" y="0px" width="${dimen}px" height="${dimen}px" viewBox="0 0 ${dimen} ${dimen}" xml:space="preserve">
            //           <path id="rect9951" fill="none" stroke="#FFFFFF" stroke-width="2" d="M2.27,6.235h43.571c1.258,0,2.273,1.018,2.273,2.272v32.195
            //               c0,1.257-1.016,2.273-2.273,2.273H2.27c-1.256,0-2.273-1.017-2.273-2.273V8.508C-0.003,7.253,1.014,6.235,2.27,6.235z"/>
            //           <path id="rect9977" fill="none" stroke="#FFFFFF" stroke-width="2" d="M2.271,6.235h43.57c1.258,0,2.273,1.018,2.273,2.273v3.338
            //               c0,1.255-1.016,2.273-2.273,2.273H2.271c-1.256,0-2.273-1.018-2.273-2.273V8.509C-0.003,7.253,1.015,6.235,2.271,6.235z"/>
            //           <path id="rect9967" fill="#FFFFFF" d="M19.696,34.101h20.081c1.048,0,1.898,0.638,1.898,1.428l0,0c0,0.786-0.851,1.427-1.898,1.427
            //               H19.696c-1.048,0-1.898-0.641-1.898-1.427l0,0C17.798,34.738,18.648,34.101,19.696,34.101z"/>
            //           <path id="rect9969" fill="#FFFFFF" d="M13.117,34.012H8.78c-1.048,0-1.898,0.66-1.898,1.472l0,0c0,0.812,0.85,1.472,1.898,1.472
            //               h4.336c1.048,0,1.898-0.66,1.898-1.472l0,0C15.015,34.672,14.165,34.012,13.117,34.012z"/>
            //           <path id="svg_60" fill="#FFFFFF" d="M19.59,29.229h20.082c1.048,0,1.898,0.638,1.898,1.427l0,0c0,0.79-0.851,1.428-1.898,1.428
            //               H19.59c-1.048,0-1.898-0.638-1.898-1.428l0,0C17.692,29.867,18.542,29.229,19.59,29.229z"/>
            //           <path id="svg_61" fill="#FFFFFF" d="M13.009,29.141H8.673c-1.049,0-1.898,0.659-1.898,1.472l0,0c0,0.812,0.849,1.472,1.898,1.472
            //               h4.336c1.048,0,1.898-0.66,1.898-1.472l0,0C14.908,29.8,14.058,29.141,13.009,29.141z"/>
            //           <path id="svg_63" fill="#FFFFFF" d="M19.59,23.914h20.082c1.048,0,1.898,0.64,1.898,1.426l0,0c0,0.79-0.851,1.428-1.898,1.428H19.59
            //               c-1.048,0-1.898-0.638-1.898-1.428l0,0C17.692,24.554,18.542,23.914,19.59,23.914z"/>
            //           <path id="svg_64" fill="#FFFFFF" d="M13.009,23.825H8.673c-1.049,0-1.898,0.657-1.898,1.471l0,0c0,0.815,0.849,1.476,1.898,1.476
            //               h4.336c1.048,0,1.898-0.66,1.898-1.476l0,0C14.908,24.482,14.058,23.825,13.009,23.825z"/>
            //           <path id="svg_66" fill="#FFFFFF" d="M19.78,19.168h20.082c1.049,0,1.898,0.639,1.898,1.427l0,0c0,0.788-0.85,1.428-1.898,1.428
            //               H19.78c-1.048,0-1.898-0.64-1.898-1.428l0,0C17.882,19.807,18.731,19.168,19.78,19.168z"/>
            //           <path id="svg_67" fill="#FFFFFF" d="M13.199,19.08H8.863c-1.048,0-1.898,0.659-1.898,1.472l0,0c0,0.814,0.85,1.474,1.898,1.474
            //               h4.336c1.048,0,1.898-0.66,1.898-1.474l0,0C15.098,19.738,14.248,19.08,13.199,19.08z"/>
            //           </svg>`,
                "showInFollowerMode": false,
                "clickFunc": () => {
                    // Menu2D.open();
                    store.commit("setVar", {
                        moduleName: "menu2dModal",
                        varName: "showMenu2DModal",
                        val: true
                    });
                },
                "curBottom": undefined
            });

            btns.push({
                "title": "Help",
                "id": "help-button",

                "svg": `<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                        x="0px" y="0px" width="${dimen}px" height="${dimen}px" viewBox="0 0 ${dimen} ${dimen}" xml:space="preserve">
                            <path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="
                                M35.5,9.8c1.7,5.4-0.6,8-1.6,8.9c-1.9,1.9-4.5,4.7-5.8,7c-1.5,2.7-4.1,12-6.8,4.4c-3.2-9.1,1.3-11.6,3.5-13.4
                                c1.5-1.3,3.4-4.3,0.5-5.3c-4-1.3-6.1,5.3-10.7,4c-3-0.8-3.2-4.1-2.2-6.6C15.4,1.7,32.5,0.6,35.5,9.8L35.5,9.8z"/>
                            <path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" d="M28.3,39.6c0-5.5-8.5-5.5-8.5,0S28.3,45.1,28.3,39.6"/>
                    </svg>`,
                "showInFollowerMode": false,
                "clickFunc": () => {
                    SimpleModalComponent.openSimpleModal({
                        title: "Help: ProteinVR " + Vars.VERSION,
                        content: "pages/help.html",
                        hasCloseBtn: true,
                        showBackdrop: true,
                        unclosable: false
                    }, true);
                },
                "curBottom": undefined
            });

            // TODO: More sophisticated way to read from url params? Search
            // for other relevant TODO item... Actually, check out urlParams.
            if (window.location.href.indexOf("LOCALFILE") === -1) {
                btns.push({
                    "title": "Share (Leader)",
                    "id": "leader",
                    "svg": `<svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            x="0px" y="0px" width="${dimen}px" height="${dimen}px" viewBox="0 0 ${dimen} ${dimen}" xml:space="preserve">
                            <path fill="none" stroke="#FFFFFF" stroke-width="1.5" d="M35.4,4.6c-3.2,0-5.8,2.4-5.8,5.8l0,0c0,0.5,0.2,1.1,0.5,1.4l-13.4,7.8
                            c-1-1.4-2.6-1.8-4.1-1.8c-3.2,0-5.8,2.4-5.8,5.8l0,0c0,2.9,2.6,5.8,5.8,5.8l0,0c1.3,0,2.2-0.5,3.2-1.4l13.6,8.3
                            c-0.3,0.4-0.3,0.9-0.3,1.4c0,3.4,2.7,5.8,5.9,5.8l0,0c3.2,0,5.6-2.4,5.6-5.8l0,0c0-2.9-2.4-5.9-5.6-5.9l0,0c-1.7,0-3.2,1.1-4.4,2
                            l-13.1-7.3c0.5-0.9,0.7-2,0.7-2.9c0-0.5,0-1.4-0.2-2l13.3-7.3c1,0.9,2.5,1.5,4.1,1.5c3.2,0,5.9-2.5,5.9-5.4l0,0
                            C41.3,6.9,38.5,4.6,35.4,4.6L35.4,4.6L35.4,4.6z"/>
                        </svg>`,
                    "showInFollowerMode": false,
                    "clickFunc": () => {
                        Lecturer.startBroadcast();
                    },
                    "curBottom": undefined
                });
            }

            if (!IsIOS.iOS()) {
                btns.push({
                    "title": "Full Screen",
                    "id": "fullscreen-button",

                    // https://iconmonstr.com/fullscreen-thin-svg/
                    "svg": `<svg style="position:relative; left:0.5px;" width="${dimen}px" height="${dimen}px" xmlns="http://www.w3.org/2000/svg"
                            xmlns:svg="http://www.w3.org/2000/svg" clip-rule="evenodd">
                            <g class="layer">
                                <path d="m47.799999,43.649999l-47.699999,0l0,-39.749999l47.699999,0l0,39.749999zm-1.9875,-37.762499l-43.724999,0l0,35.774999l43.724999,0l0,-35.774999zm-7.95,13.9125l-1.9875,0l0,-6.441487l-22.341487,22.341487l6.441487,0l0,1.9875l-9.9375,0l0,-9.9375l1.9875,0l0,6.441487l22.341487,-22.341487l-6.441487,0l0,-1.9875l9.9375,0l0,9.9375z" fill="#ffffff" id="svg_1"/>
                            </g>
                        </svg>`,
                    "showInFollowerMode": true,
                    "clickFunc": () => {
                        Vars.engine.switchFullscreen(true);

                        // So keypress will work.
                        // Use ref to engine to get canvas' Tab Index and set it
                        Vars.canvas.tabIndex = Vars.engine.canvasTabIndex;  
                        Vars.canvas.focus();  
                    },
                    "curBottom": undefined
                });
            }

            // If needful, filter out the buttons should not be visible in
            // follower mode.
            if (UrlVars.checkIfWebRTCInUrl()) {
                // So you're in follower mode.
                btns = btns.filter(b => b.showInFollowerMode);

                // Also fix cursor (no grab).
                let canvas = document.getElementById("renderCanvas") as HTMLCanvasElement
                canvas.classList.remove("grab-icon");
                canvas.classList.add("no-grab");
            }

            // btns = [];  // For debugging

            // Reverse the buttons.
            let html = "";
            let curBottom = this.curBottomStart;
            for (const btn of btns.reverse()) {
                btn["curBottom"] = curBottom;
                curBottom += this.vertSeparationDist;
            }

            return btns;
        }
    };

    public props = {};

    public watch = {};

    public template = templateHtml;

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            curBottomStart: 60,
            vertSeparationDist: 55,
            justResized: true
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {
        // On resize, reposition the 2D buttons if the screen height is too small.
        window.addEventListener("resize", () => {
            // Resize the buttons if the screen isn't high enough (e.g.,
            // phones).
            this.justResized = true;
        });

        window.addEventListener("orientationchange", () => {
            this.justResized = true;
        });

        jQuery(() => {
            let msToWaitForReady = 10000;

            // Start checking if babylonVRiconbtn exists.
            let babylonVRIconBtnPromise = new Promise((resolve, reject) => {
                let startTime = new Date().getTime();
                let interId = setInterval(() => {
                    // After 10 seconds give up looking.
                    if (new Date().getTime() - startTime > msToWaitForReady) {
                        clearInterval(interId);
                        reject();
                    }

                    // Check if button exists.
                    const babylonVRIconBtns = document.getElementsByClassName("babylonVRicon");
                    if (babylonVRIconBtns.length > 0) {
                        clearInterval(interId);
                        resolve(babylonVRIconBtns[0]);
                    }
                }, 500);
            });

            // Start checking if btnsWrapper exists.
            let btnsWrapperPromise = new Promise((resolve, reject) => {
                let startTime = new Date().getTime();
                let interId = setInterval(() => {
                    // After 10 seconds give up looking.
                    if (new Date().getTime() - startTime > msToWaitForReady) {
                        clearInterval(interId);
                        reject();
                    }

                    // Need to move babylonVRiconbtn into #btnsWrapper, which
                    // should be rendered by now.
                    let btnsWrapper = document.getElementById("btnsWrapper");
                    if (btnsWrapper) {
                        clearInterval(interId);
                        resolve(btnsWrapper);

                        // Resize because button added, so need to resize
                        // other buttons to make room in some cases.
                        this.justResized = true;
                    }
                }, 500);
            });

            Promise.all([babylonVRIconBtnPromise, btnsWrapperPromise]).then((vals: any[]) => {
                let babylonVRIconBtn = vals[0];
                let btnsWrapper = vals[1];
                btnsWrapper.appendChild(babylonVRIconBtn);

                // Also make VR button visible.
                if (babylonVRIconBtn !== null) {
                    // @ts-ignore
                    babylonVRIconBtn.style.opacity = "1.0";  // Non IE;

                    // @ts-ignore
                    babylonVRIconBtn.style.filter = "alpha(opacity=1.0)";  // IE;
                }

                // Deal with VR button on iOS (annoying).
                showVRButtonPerOrientation();
                if (IsIOS.iOS()) {
                    setInterval(() => {
                        // On iOS keep checking periodically to make sure VR
                        // button hidden unless in portrait mode.
                        showVRButtonPerOrientation();
                    }, 1000);

                    if (!IsIOS.isIOSLandscape()) {
                        SimpleModalComponent.openSimpleModal({
                            title: "Warning",
                            content: "VR mode is only available when the phone is in landscape orientation.",
                            hasCloseBtn: true,
                            unclosable: false
                        }, false);
                    }
                }
            }).catch(() => {
                console.log("Warning: Could not activate VR!");
                if (!UrlVars.checkIfWebRTCInUrl()) {
                    addMessage("VR headset not detected! Navigate using click/tap, drag, and/or keyboard (e.g., arrow keys) instead.");
                }
            });
        });
    };
}

let babylonVRIconBtn;

/**
 * Hides the VR button on iOS if not in landscape mode.
 * @returns void
 */
export function showVRButtonPerOrientation(): void {
    if (babylonVRIconBtn === undefined) {
        babylonVRIconBtn = document.getElementsByClassName("babylonVRicon")[0];
    }

    switch (IsIOS.isIOSLandscape()) {
        case undefined:
            // Not iOS, so always visible.
            if (babylonVRIconBtn) {
                babylonVRIconBtn.style.display = "";
            }
            break;
        case true:
            // Landscape
            if (babylonVRIconBtn) {
                babylonVRIconBtn.style.display = "";
            }
            break;
        case false:
            // Portrait
            if (babylonVRIconBtn) {
                babylonVRIconBtn.style.display = "none";
            }
            break;
    }
}
