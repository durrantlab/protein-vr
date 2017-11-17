"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var UserVars = require("../config/UserVars");
var Globals = require("../config/Globals");
function allowUserToModifySettings() {
    /*
    Setup and show the settings panel.
    */
    if (Globals.delayExec(allowUserToModifySettings, ["DefaultUserVarsSet"], "allowUserToModifySettings", this)) {
        return;
    }
    var jQuery = Globals.get("jQuery");
    // Add div to contain all settings.
    jQuery("body").append("<div id=\"settings_panel\"></div>");
    var settingsPanel = jQuery("#settings_panel");
    // Make the settings panel fluid using bootstrap class
    settingsPanel.addClass("container-fluid");
    // Create the panel html
    var html = panel('ProteinVR 1.0', "<div id=\"hardware-msg\" class=\"alert alert-info\">\n            Select your hardware setup:\n        </div>" +
        panel("Hardware", 
        //row_even_split(
        // [3,4,5],
        radioBoxes("Viewer", UserVars.paramNames["viewer"], ['<i class="icon-imac"></i>', '<i class="icon-glassesalt"></i>']
        // [85, 115]
        )
        /* radioBoxes(
            "Audio",
            UserVars.paramNames["audio"],
            ['<i class="icon-speaker"></i>', '<i class="icon-headphones"></i>', '<span class="glyphicon glyphicon-volume-off" aria-hidden=true></span>']
            // [100, 120, 75]
        )*/
        /*) +
        row_even_split(
            radioBoxes(
                "Device",
                UserVars.paramNames["device"],
                ['<i class="icon-iphone"></i>', '<i class="icon-laptop"></i>', '<i class="icon-connectedpc"></i>']
                // [100, 100, 100]
            ), "" */ /*,
        radioBoxes(
            "Moving",
            UserVars.paramNames["moving"],
            ['<i class="icon-upright"></i>', '<i class="icon-manalt"></i>', '<i class="icon-lightning"></i>'] //, '<i class="icon-connectedpc"></i>']
            // [100, 100, 100]
        )  + radioBoxes(  // commented out because of simplified UI
            "Looking",
            UserVars.paramNames["looking"],
            ['<i class="icon-mouse"></i>', '<i class="icon-hand-up"></i>'] //, '<i class="icon-connectedpc"></i>']
            // [100, 100, 100]
        ) */ /*,
    )*/
        ) /* +
    panelCollapsible(
        "Initial Performance Settings",
        `<div id="settings-msg" class="alert alert-info">
            Initial performance settings. ProteinVR will adjust in game to maintain 30 frames per second.
        </div>` +
        row_thirds_split(
            [4, 4, 4],
            radioBoxes(
                "Textures",
                UserVars.paramNames["textures"],
                // [70, 85, 80]
            ),
            radioBoxes(
                "Objects",
                UserVars.paramNames["objects"],
                // [90, 85, 85]
            ),
            radioBoxes(
                "Fog",
                UserVars.paramNames["fog"],
                // [60, 55, 55]
            )
        ) +
        row_thirds_split(
            [4, 4, 4],
            radioBoxes(
                "Display",
                UserVars.paramNames["display"],
                // [70, 85, 80]
            ),
            radioBoxes(
                "Animations",
                UserVars.paramNames["animations"],
                // [70, 85, 80]
            ),
            ""
        )
    ) */
        +
            "<button id=\"user_settings_continue_button\" type=\"button\" class=\"btn btn-primary\">Continue</button>"
    // <button id="broadcast_game_button" style="display: none;" type="button" class="btn btn-primary">Broadcast</button>`
    );
    // Add that HTML to the DOM.
    settingsPanel.html(html);
    // ???
    addJavaScript(function () {
        Globals.milestone("UserSettingsSpecifiedDialogClosed", true);
    });
    // Set default or previously saved values on the GUI.
    this.setGUIState();
}
exports.allowUserToModifySettings = allowUserToModifySettings;
function panel(title, html) {
    /*
    Return the HTML for a simple bootstrap panel.

    :param string title: The title of the panel.

    :param string html: The html contained in the panel.

    :returns: The panel HTML.
    :rtype: :class:`string`
    */
    return "\n        <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\">\n                <h3 class=\"panel-title\">\n                    " + title + "\n                </h3>\n            </div>\n            <div class=\"panel-body\">" + html + "</div>\n        </div>\n    ";
}
function panelCollapsible(title, html) {
    /*
    Return the HTML for a simple collapsible bootstrap panel.

    :param string title: The title of the panel.

    :param string html: The html contained in the panel.

    :returns: The panel HTML.
    :rtype: :class:`string`
    */
    var rnd = Math.floor(Math.random() * 1000000).toString();
    return "\n        <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\" onclick=\"jQuery('#collapse-" + rnd + "-href').get(0).click();\" style=\"cursor: pointer;\">\n                <h3 class=\"panel-title\">\n                    <a data-toggle=\"collapse\" id=\"collapse-" + rnd + "-href\" href=\"#collapse-" + rnd + "\"></a>" + title + "\n                    <i class=\"indicator glyphicon glyphicon-chevron-up pull-right\"></i>\n                </h3>\n            </div>\n            <div id=\"collapse-" + rnd + "\" class=\"panel-collapse collapse\">\n                <div class=\"panel-body\">" + html + "</div>\n            </div>\n        </div>\n    ";
}
function section(html) {
    /*
    Return the HTML for a simple section (panel without header).

    :param string html: The html contained in the section.

    :returns: The section HTML.
    :rtype: :class:`string`
    */
    return "\n        <div class=\"panel panel-default\">\n            <div class=\"panel-body\">" + html + "</div>\n        </div>\n    ";
}
function row_even_split(html1, html2) {
    /*
    Return a row with two columns.

    :param string html1: The html contained in the first column.

    :param string html2: The html contained in the second column.

    :returns: The row HTML.
    :rtype: :class:`string`
    */
    return "\n        <div class=\"row\">\n            <div class=\"col-sm-6 col-xs-12\">\n                " + html1 + "\n            </div>\n            <div class=\"col-sm-6 col-xs-12\">\n                " + html2 + "\n            </div>\n        </div>                \n    ";
}
function row_thirds_split(widths, html1, html2, html3) {
    /*
    Return a row with three columns.

    :param number[] widths: The widths of the columns (should sum to 12).

    :param string html1: The html contained in the first column.

    :param string html2: The html contained in the second column.

    :param string html3: The html contained in the third column.

    :returns: The row HTML.
    :rtype: :class:`string`
    */
    return "\n        <div class=\"row\">\n            <div class=\"col-lg-" + widths[0] + " col-xs-12\">\n                " + html1 + "\n            </div>\n            <div class=\"col-lg-" + widths[1] + " col-xs-12\">\n                " + html2 + "\n            </div>\n            <div class=\"col-lg-" + widths[2] + " col-xs-12\">\n                " + html3 + "\n            </div>\n        </div>                \n    ";
}
function radioBoxes(label, values, icons_if_phone) {
    /* TODO: Docstring needed here! */
    if (icons_if_phone === void 0) { icons_if_phone = undefined; }
    var id = label.toLowerCase().replace(/ /g, '');
    var html = "<div class=\"form-group buttonbar-" + id + "\">\n                    <div class=\"btn-group btn-group-justified\" data-toggle=\"buttons\">\n                        <div class=\"btn disabled btn-default\" style=\"background-color: #eeeeee; opacity: 1;\">" + label + "</div>";
    for (var i = 0; i < values.length; i++) {
        var value = values[i];
        var iconHtml = "";
        if (icons_if_phone !== undefined) {
            iconHtml = icons_if_phone[i];
        }
        else {
            iconHtml = value;
        }
        var valueNoSpaces = value.replace(/ /g, '');
        html += "<label class=\"btn btn-default " + id + "-labels proteinvr-radio-label " + valueNoSpaces.toLowerCase() + "-label\" data-description=\"" + label + ": " + value + "\" style=\"padding-left: 0; padding-right: 0; left:-" + (i + 1) + "px;\">\n                            <input type=\"radio\" name=\"" + id + "\" id=\"" + id + i + "\" autocomplete=\"off\" value=\"" + valueNoSpaces + "\"><span class=\"the-icon visible-xs\">" + iconHtml + "</span><span class=\"hidden-xs\">" + value + "</span>\n                        </label>";
    }
    html += "</div>\n                </div>";
    return html;
}
function setRadioState(id, varsToUse) {
    /* TODO: Docstring needed here! */
    setTimeout(function () {
        // Get all the labels and make them default colored, no checkboxes.
        var labels = Globals.get("jQuery")("." + id + "-labels");
        labels.removeClass("btn-primary");
        labels.addClass("btn-default");
        labels.removeClass("active"); // these don't look so great IMHO
        labels.removeClass("focus");
        // Now find the one that should be checked.
        var labelToUse = labels.find("#" + id + varsToUse[id]).closest("label");
        labelToUse.removeClass('btn-default');
        labelToUse.addClass("btn-primary");
        // Also make sure associated radio input is checked.
        var inputToUse = labelToUse.find('input');
        inputToUse.prop("checked", "checked");
    }, 0);
}
function setGUIState() {
    /* TODO: Docstring needed here! */
    var jQuery = Globals.get("jQuery");
    var varsToUse = jQuery.parseJSON(localStorage.getItem("proteinvr_params"));
    // Set the various radio states
    for (var key in UserVars.paramNames) {
        if (UserVars.paramNames.hasOwnProperty(key)) {
            var key2 = key.toLowerCase();
            setRadioState(key2, varsToUse);
        }
    }
}
exports.setGUIState = setGUIState;
function addJavaScript(onSettingsPanelClosed) {
    /*
    Sets up all the javascript required to make the settings panel work (i.e.,
    when buttons pressed).

    :param func onSettingsPanelClosed: A callback function to run when
                settings panel is closed.
    */
    var jQuery = Globals.get("jQuery");
    var engine = Globals.get("engine");
    // Make toggle boxes clickable.
    jQuery(".toggle_box").mouseup(function () {
        setTimeout(function () {
            // This to move it to bottom of stack.
            var This = jQuery(this);
            This.removeClass("focus");
        }.bind(this));
    });
    // Make radio buttons clickable
    jQuery(".proteinvr-radio-label").mouseup(function () {
        setTimeout(function () {
            var This = jQuery(this);
            var associatedInput = This.find("input");
            var key = associatedInput.attr("name");
            var val = associatedInput.val();
            var valNum = UserVars.stringToEnumVal(val);
            UserVars.updateLocalStorageParams(key, valNum);
            setGUIState();
            var description = This.data("description");
            jQuery("#hardware-msg").html(description);
        }.bind(this));
    });
    // The Device radio buttons are special. They don't control the program,
    // but rather the settings. So add another click to them.
    jQuery(".device-labels").mouseup(function () {
        var This = jQuery(this);
        var msg = jQuery("#settings-msg");
        msg.html("Performance set to " + This.find("input").val().toLowerCase() + " default.");
        msg.removeClass("alert-info");
        msg.addClass("alert-warning");
    });
    function toggleChevron(e) {
        jQuery(e.target)
            .prev('.panel-heading')
            .find("i.indicator")
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-right');
    }
    var collapsibles = jQuery('.panel-collapse');
    collapsibles.on('hidden.bs.collapse', toggleChevron);
    collapsibles.on('shown.bs.collapse', toggleChevron);
    // start button. Wrapped in screenful in case you want to go full screen
    // when you press the start button.
    // This does need to be registered on the window. If you do it
    // through a click in babylonjs, browsers will reject the
    // full-screen request.
    jQuery("#user_settings_continue_button").click(function () {
        figureOutWhichCameraToUse();
        jQuery("#settings_panel").fadeOut(function () {
            jQuery("#loading_panel").fadeIn();
        });
        this.onSettingsPanelClosed();
    }.bind({
        onSettingsPanelClosed: onSettingsPanelClosed,
    }));
}
function figureOutWhichCameraToUse() {
    /*
    Figures out what kind of camera to use based on hardware and user
    settings. Shows appropriate instructions in loading panel for that camera.
    */
    var isMobile = Globals.get("isMobile");
    var jQuery = Globals.get("jQuery");
    // Figure out which kind of camera to use.
    var cameraTypeToUse = "";
    switch (UserVars.getParam("viewer")) {
        case UserVars.viewers["Screen"]:
            // On a screen (not VR headset)
            switch (isMobile) {
                case true:
                    // VR joy camera
                    cameraTypeToUse = "show-mobile-virtual-joystick";
                    break;
                case false:
                    // For example, laptop screns.
                    cameraTypeToUse = "show-desktop-screen";
                    break;
            }
            break;
        case UserVars.viewers["VRHeadset"]:
            // On a VR headset
            switch (isMobile) {
                case true:
                    // google cardboard, for example.
                    cameraTypeToUse = "show-mobile-vr";
                    break;
                case false:
                    // Oculus rift or HTC vive.
                    cameraTypeToUse = "show-desktop-vr";
                    break;
            }
    }
    // Show the instructions relevant to that camera.
    jQuery("head").append("\n        <style>\n            .show-mobile-virtual-joystick, .show-mobile-vr, .show-desktop-screen, .show-desktop-vr {\n                display: none;\n            }\n            ." + cameraTypeToUse + " {\n                display: inline-block; \n            }\n        </style>\n    ");
    if (cameraTypeToUse === "show-mobile-vr") {
        // Make sure no guide line shown.
        jQuery("#vr_overlay2").show();
    }
    Globals.set("cameraTypeToUse", cameraTypeToUse);
}
function addBroadcastModal() {
    /* TODO: Not currently implemented in this version of ProteinVR! */
    var jQuery = Globals.get("jQuery");
    var broadcastURL = window.location.href + '?id=' + PVRGlobals.broadcastID;
    jQuery("body").append("\n        <div class=\"modal fade\" id=\"broadcast_modal\" tabindex=\"-1\" role=\"dialog\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n                        <h4 class=\"modal-title\">Broadcast ProteinVR Session</h4>\n                    </div>\n                    <div class=\"modal-body\">\n                        <div id=\"hardware-msg\" class=\"alert alert-info\">\n                            Give your students the URL below so they can accompany you in the virtual-reality world. Then click the \"Start\" button to enter the world yourself.\n                        </div>\n                        <div class=\"input-group\">\n                            <span class=\"input-group-addon\" id=\"url_text\">URL:</span>\n                            <input type=\"text\" value=\"" + broadcastURL + "\" class=\"form-control\" id=\"broadcast-url\" aria-describedby=\"url_text\">\n                        </div>\n                    </div>\n                    <div class=\"modal-footer\">\n                        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n                        <button id=\"start_game_from_modal\" type=\"button\" class=\"btn btn-primary\">Start</button>\n                    </div>\n                </div>\n            </div>\n        </div>");
    jQuery("#start_game_from_modal").click(function () {
        jQuery('#broadcast_modal').modal('hide');
        PVRGlobals.teacherBroadcasting = true;
        jQuery("#user_settings_continue_button").click();
    });
    jQuery('#broadcast_modal').on('shown.bs.modal', function () {
        jQuery('#broadcast-url').focus();
    });
    // Start trying to get a tinyurl link instead
    jQuery.ajax({
        url: "js/url-shortener/shortener.php?url=" + broadcastURL,
        dataType: 'text',
    }).done(function (newUrl) {
        jQuery("#broadcast-url").val(newUrl);
    });
}
//# sourceMappingURL=SettingsPanel.js.map