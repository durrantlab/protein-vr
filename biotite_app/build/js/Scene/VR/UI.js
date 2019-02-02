// Sets up tweaks to the UI.
define(["require", "exports", "./Vars"], function (require, exports, Vars) {
    "use strict";
    exports.__esModule = true;
    function setup() {
        addRunModeButtons();
    }
    exports.setup = setup;
    function addRunModeButtons() {
        // Adds some additional buttons to the UI. Source:
        // https://iconmonstr.com/fullscreen-thin-svg/
        jQuery("body").append("\n        <button\n          id=\"fullscreen-button\"\n          style=\"color:white;\n                 width:80px;\n                 right:20px;\n                 position:absolute;\n                 height:50px;\n                 bottom:80px;\n                 background-color:rgba(51,51,51,0.7);\n                 border:none;\n                 outline:none;\">\n            <svg\n              style=\"position:relative; left:0.5px;\"\n              width=\"48\" height=\"48\"\n              xmlns=\"http://www.w3.org/2000/svg\"\n              xmlns:svg=\"http://www.w3.org/2000/svg\"\n              clip-rule=\"evenodd\">\n                <g class=\"layer\">\n                    <path d=\"m47.799999,43.649999l-47.699999,0l0,-39.749999l47.699999,0l0,39.749999zm-1.9875,-37.762499l-43.724999,0l0,35.774999l43.724999,0l0,-35.774999zm-7.95,13.9125l-1.9875,0l0,-6.441487l-22.341487,22.341487l6.441487,0l0,1.9875l-9.9375,0l0,-9.9375l1.9875,0l0,6.441487l22.341487,-22.341487l-6.441487,0l0,-1.9875l9.9375,0l0,9.9375z\" fill=\"#ffffff\" id=\"svg_1\"/>\n                </g>\n            </svg>\n        </button>\n    ");
        var fullScreenButton = jQuery("#fullscreen-button");
        fullScreenButton.click(function () {
            Vars.vars.engine.switchFullscreen(true);
            jQuery("canvas").focus(); // So keypress will work.
        });
    }
});
