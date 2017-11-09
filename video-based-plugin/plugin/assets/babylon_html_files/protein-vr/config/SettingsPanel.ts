import * as UserVars from "./UserVars";
import * as Globals from "./Globals";

declare var PVRGlobals;

export function allowUserToModifySettings() { //: any {
    /*
    Setup and show the settings panel.
    */

    if (Globals.delayExec(allowUserToModifySettings,
                          ["DefaultUserVarsSet"], 
                          "allowUserToModifySettings", 
                          this)) {
        return;
    }

    let jQuery = Globals.get("jQuery");

    // Add div to contain all settings.
    jQuery("body").append(`<div id="settings_panel"></div>`)
    let settingsPanel = jQuery("#settings_panel");

    // Make the settings panel fluid using bootstrap class
    settingsPanel.addClass("container-fluid");

    // Create the panel html
    let html = panel(
        'ProteinVR 1.0', 
        `<div id="hardware-msg" class="alert alert-info">
            Select your hardware setup:
        </div>` + 
        panel(
            "Hardware", 
            //row_even_split(
                // [3,4,5],
                radioBoxes(
                    "Viewer",
                    UserVars.paramNames["viewer"],
                    ['<i class="icon-imac"></i>', '<i class="icon-glassesalt"></i>']
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
        ) */ + 
        `<button id="user_settings_continue_button" type="button" class="btn btn-primary">Continue</button>`
        // <button id="broadcast_game_button" style="display: none;" type="button" class="btn btn-primary">Broadcast</button>`
    );

    // Add that HTML to the DOM.
    settingsPanel.html(html);

    // ???
    addJavaScript(() => {
        Globals.milestone("UserSettingsSpecifiedDialogClosed", true);
    });
    
    // Set default or previously saved values on the GUI.
    this.setGUIState();
}

function panel(title: string, html: string): string {
    /*
    Return the HTML for a simple bootstrap panel.

    :param string title: The title of the panel.

    :param string html: The html contained in the panel.

    :returns: The panel HTML.
    :rtype: :class:`string`
    */
    
    return `
        <div class="panel panel-primary">
            <div class="panel-heading">
                <h3 class="panel-title">
                    ${title}
                </h3>
            </div>
            <div class="panel-body">${html}</div>
        </div>
    `;
}

function panelCollapsible(title: string, html: string): string {
    /*
    Return the HTML for a simple collapsible bootstrap panel.

    :param string title: The title of the panel.

    :param string html: The html contained in the panel.

    :returns: The panel HTML.
    :rtype: :class:`string`
    */

    let rnd = Math.floor(Math.random() * 1000000).toString();
    return `
        <div class="panel panel-primary">
            <div class="panel-heading" onclick="jQuery('#collapse-${rnd}-href').get(0).click();" style="cursor: pointer;">
                <h3 class="panel-title">
                    <a data-toggle="collapse" id="collapse-${rnd}-href" href="#collapse-${rnd}"></a>${title}
                    <i class="indicator glyphicon glyphicon-chevron-up pull-right"></i>
                </h3>
            </div>
            <div id="collapse-${rnd}" class="panel-collapse collapse">
                <div class="panel-body">${html}</div>
            </div>
        </div>
    `;
}

function section(html: string): string { // panel without header
    /*
    Return the HTML for a simple section (panel without header).

    :param string html: The html contained in the section.

    :returns: The section HTML.
    :rtype: :class:`string`
    */

    return `
        <div class="panel panel-default">
            <div class="panel-body">${html}</div>
        </div>
    `;
}

function row_even_split(html1: string, html2: string): string {
    /*
    Return a row with two columns.

    :param string html1: The html contained in the first column.

    :param string html2: The html contained in the second column.

    :returns: The row HTML.
    :rtype: :class:`string`
    */

    return `
        <div class="row">
            <div class="col-sm-6 col-xs-12">
                ${html1}
            </div>
            <div class="col-sm-6 col-xs-12">
                ${html2}
            </div>
        </div>                
    `;
}

function row_thirds_split(widths, html1: string, html2: string, html3: string) {
    /*
    Return a row with three columns.

    :param number[] widths: The widths of the columns (should sum to 12).

    :param string html1: The html contained in the first column.

    :param string html2: The html contained in the second column.

    :param string html3: The html contained in the third column.

    :returns: The row HTML.
    :rtype: :class:`string`
    */

    return `
        <div class="row">
            <div class="col-lg-${widths[0]} col-xs-12">
                ${html1}
            </div>
            <div class="col-lg-${widths[1]} col-xs-12">
                ${html2}
            </div>
            <div class="col-lg-${widths[2]} col-xs-12">
                ${html3}
            </div>
        </div>                
    `;
}

function radioBoxes(label, values: any, icons_if_phone = undefined) {
    /* TODO: Docstring needed here! */

    let id = label.toLowerCase().replace(/ /g, '');
    let html = `<div class="form-group buttonbar-${id}">
                    <div class="btn-group btn-group-justified" data-toggle="buttons">
                        <div class="btn disabled btn-default" style="background-color: #eeeeee; opacity: 1;">${label}</div>`;
    
    for (let i = 0; i < values.length; i++) {
        let value = values[i];
        let iconHtml = "";
        if (icons_if_phone !== undefined) {
            iconHtml = icons_if_phone[i];
        } else {
            iconHtml = value;
        }

        let valueNoSpaces = value.replace(/ /g, '');

        html +=         `<label class="btn btn-default ${id}-labels proteinvr-radio-label ${valueNoSpaces.toLowerCase()}-label" data-description="${label}: ${value}" style="padding-left: 0; padding-right: 0; left:-${i+1}px;">
                            <input type="radio" name="${id}" id="${id}${i}" autocomplete="off" value="${valueNoSpaces}"><span class="the-icon visible-xs">${iconHtml}</span><span class="hidden-xs">${value}</span>
                        </label>`;
    }
    html +=         `</div>
                </div>`;
    return html;
}

function setRadioState(id, varsToUse) {
    /* TODO: Docstring needed here! */

    setTimeout(() => {
        // Get all the labels and make them default colored, no checkboxes.
        let labels = Globals.get("jQuery")(`.${id}-labels`);
        labels.removeClass("btn-primary");
        labels.addClass("btn-default");
        labels.removeClass("active");  // these don't look so great IMHO
        labels.removeClass("focus");

        // Now find the one that should be checked.
        let labelToUse = labels.find(`#${id}${varsToUse[id]}`).closest("label");
        labelToUse.removeClass('btn-default');
        labelToUse.addClass("btn-primary");

        // Also make sure associated radio input is checked.
        let inputToUse = labelToUse.find('input');
        inputToUse.prop("checked", "checked");
    }, 0);
}

export function setGUIState() {
    /* TODO: Docstring needed here! */

    let jQuery = Globals.get("jQuery");
    let varsToUse = jQuery.parseJSON(localStorage.getItem("proteinvr_params"));
    // Set the various radio states
    for (var key in UserVars.paramNames) {
        if (UserVars.paramNames.hasOwnProperty(key)) {
            let key2 = key.toLowerCase();
            setRadioState(key2, varsToUse);
        }
    }
}

function addJavaScript(onSettingsPanelClosed: any): void {
    /*
    Sets up all the javascript required to make the settings panel work (i.e.,
    when buttons pressed).

    :param func onSettingsPanelClosed: A callback function to run when
                settings panel is closed.
    */

    let jQuery = Globals.get("jQuery");
    let engine = Globals.get("engine");

    // Make toggle boxes clickable.
    jQuery(".toggle_box").mouseup(function() {
        setTimeout(function() {
            // This to move it to bottom of stack.
            let This = jQuery(this);
            This.removeClass("focus");
        }.bind(this));
    });

    // Make radio buttons clickable
    jQuery(".proteinvr-radio-label").mouseup(function() {
        setTimeout(function() {  // This to move it to bottom of stack.
            let This = jQuery(this);
            let associatedInput = This.find("input");
            let key = associatedInput.attr("name");
            let val = associatedInput.val();
            let valNum = UserVars.stringToEnumVal(val);
            UserVars.updateLocalStorageParams(key, valNum);
            setGUIState();

            let description = This.data("description");
            jQuery("#hardware-msg").html(description);

        }.bind(this));
    });

    // The Device radio buttons are special. They don't control the program,
    // but rather the settings. So add another click to them.
    jQuery(".device-labels").mouseup(function() {
        let This = jQuery(this);
        let msg = jQuery("#settings-msg");
        msg.html(`Performance set to ${This.find("input").val().toLowerCase()} default.`);
        msg.removeClass("alert-info");
        msg.addClass("alert-warning");
    });

    function toggleChevron(e) {
        jQuery(e.target)
            .prev('.panel-heading')
            .find("i.indicator")
            .toggleClass('glyphicon-chevron-down glyphicon-chevron-right');
    }
    let collapsibles = jQuery('.panel-collapse');
    collapsibles.on('hidden.bs.collapse', toggleChevron);
    collapsibles.on('shown.bs.collapse', toggleChevron);

    // start button. Wrapped in screenful in case you want to go full screen
    // when you press the start button.
    // This does need to be registered on the window. If you do it
    // through a click in babylonjs, browsers will reject the
    // full-screen request.
    jQuery("#user_settings_continue_button").click(function() {
        figureOutWhichCameraToUse();
        jQuery("#settings_panel").fadeOut(() => {
            jQuery("#loading_panel").fadeIn();
        });
        this.onSettingsPanelClosed();            
    }.bind({
        onSettingsPanelClosed: onSettingsPanelClosed,
        // engine: engine
    }));
}

function figureOutWhichCameraToUse(): void {
    /*
    Figures out what kind of camera to use based on hardware and user
    settings. Shows appropriate instructions in loading panel for that camera.
    */

    let isMobile = Globals.get("isMobile");
    let jQuery = Globals.get("jQuery");

    // Figure out which kind of camera to use.
    let cameraTypeToUse = "";
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
    jQuery("head").append(`
        <style>
            .show-mobile-virtual-joystick, .show-mobile-vr, .show-desktop-screen, .show-desktop-vr {
                display: none;
            }
            .${cameraTypeToUse} {
                display: inline-block; 
            }
        </style>
    `);

    if (cameraTypeToUse === "show-mobile-vr") {
        // Make sure no guide line shown.
        jQuery("#vr_overlay2").show();
    }
                        
    Globals.set("cameraTypeToUse", cameraTypeToUse);
}

function addBroadcastModal() {
    /* TODO: Not currently implemented in this version of ProteinVR! */
    
    let jQuery = Globals.get("jQuery");

    let broadcastURL: string = window.location.href + '?id=' + PVRGlobals.broadcastID;

    jQuery("body").append(`
        <div class="modal fade" id="broadcast_modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">Broadcast ProteinVR Session</h4>
                    </div>
                    <div class="modal-body">
                        <div id="hardware-msg" class="alert alert-info">
                            Give your students the URL below so they can accompany you in the virtual-reality world. Then click the "Start" button to enter the world yourself.
                        </div>
                        <div class="input-group">
                            <span class="input-group-addon" id="url_text">URL:</span>
                            <input type="text" value="${broadcastURL}" class="form-control" id="broadcast-url" aria-describedby="url_text">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
                        <button id="start_game_from_modal" type="button" class="btn btn-primary">Start</button>
                    </div>
                </div>
            </div>
        </div>`
    );

    jQuery("#start_game_from_modal").click(function() {
        jQuery('#broadcast_modal').modal('hide');
        PVRGlobals.teacherBroadcasting = true;
        jQuery("#user_settings_continue_button").click();
    });

    jQuery('#broadcast_modal').on('shown.bs.modal', function () {
        jQuery('#broadcast-url').focus()
    });

    // Start trying to get a tinyurl link instead
    jQuery.ajax({
        url: "js/url-shortener/shortener.php?url=" + broadcastURL,
        dataType: 'text',
    }).done(function(newUrl) {
        jQuery("#broadcast-url").val(newUrl);
    });
}