// Sets up tweaks to the UI.

// import { jQuery } from "../jQuery";
import * as Vars from "../Vars";

declare var jQuery;

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
    // Adds some additional buttons to the UI. Source:
    // https://iconmonstr.com/fullscreen-thin-svg/
    jQuery("body").append(`
        <button
          title="Click to switch to full screen"
          id="fullscreen-button"
          class="ui-button"
          style="color:white;
                 width:80px;
                 right:20px;
                 position:absolute;
                 height:50px;
                 bottom:80px;
                 background-color:rgba(51,51,51,0.7);
                 border:none;
                 outline:none;
                 cursor:pointer;">
            <svg
              style="position:relative; left:0.5px;"
              width="48" height="48"
              xmlns="http://www.w3.org/2000/svg"
              xmlns:svg="http://www.w3.org/2000/svg"
              clip-rule="evenodd">
                <g class="layer">
                    <path d="m47.799999,43.649999l-47.699999,0l0,-39.749999l47.699999,0l0,39.749999zm-1.9875,-37.762499l-43.724999,0l0,35.774999l43.724999,0l0,-35.774999zm-7.95,13.9125l-1.9875,0l0,-6.441487l-22.341487,22.341487l6.441487,0l0,1.9875l-9.9375,0l0,-9.9375l1.9875,0l0,6.441487l22.341487,-22.341487l-6.441487,0l0,-1.9875l9.9375,0l0,9.9375z" fill="#ffffff" id="svg_1"/>
                </g>
            </svg>
        </button>

        <button
          title="Click for help"
          id="help-button"
          class="ui-button"
          style="color:white;
                 width:80px;
                 right:20px;
                 position:absolute;
                 height:50px;
                 bottom:140px;
                 background-color:rgba(51,51,51,0.7);
                 border:none;
                 outline:none;
                 cursor:pointer;">
                 <svg version="1.2" baseProfile="tiny" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
	 x="0px" y="0px" width="48px" height="48px" viewBox="0 0 48 48" xml:space="preserve">
<path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" d="
	M35.5,9.8c1.7,5.4-0.6,8-1.6,8.9c-1.9,1.9-4.5,4.7-5.8,7c-1.5,2.7-4.1,12-6.8,4.4c-3.2-9.1,1.3-11.6,3.5-13.4
	c1.5-1.3,3.4-4.3,0.5-5.3c-4-1.3-6.1,5.3-10.7,4c-3-0.8-3.2-4.1-2.2-6.6C15.4,1.7,32.5,0.6,35.5,9.8L35.5,9.8z"/>
<path fill="none" stroke="#FFFFFF" stroke-width="2" stroke-miterlimit="10" d="M28.3,39.6c0-5.5-8.5-5.5-8.5,0S28.3,45.1,28.3,39.6
	"/>
</svg>

        </button>
    `);

    const fullScreenButton = jQuery("#fullscreen-button");
    fullScreenButton.click(() => {
        Vars.engine.switchFullscreen(true);
        jQuery("#renderCanvas").focus();  // So keypress will work.
    });

    const helpButton = jQuery("#help-button");
    helpButton.click(() => {
        window.open("help/index.html", "_blank");
    });

    // Also make VR button visible.
    document.getElementById("babylonVRiconbtn").style.opacity = "1.0";  // Non IE;
    document.getElementById("babylonVRiconbtn").style.filter = "alpha(opacity=1.0)";  // IE;
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
window["debugMode"] = debugMode;