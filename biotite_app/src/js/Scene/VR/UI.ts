// Sets up tweaks to the UI.

import * as Vars from "./Vars";

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
          id="fullscreen-button"
          style="color:white;
                 width:80px;
                 right:20px;
                 position:absolute;
                 height:50px;
                 bottom:80px;
                 background-color:rgba(51,51,51,0.7);
                 border:none;
                 outline:none;">
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
    `);

    const fullScreenButton = jQuery("#fullscreen-button");
    fullScreenButton.click(() => {
        Vars.vars.engine.switchFullscreen(true);
        jQuery("canvas").focus();  // So keypress will work.
    });
}
