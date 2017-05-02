import * as UserVars from "./UserVars";
import * as Setup from "../Core/Setup";
import * as Core from "../Core/Core";

var jQuery;
declare var screenfull;

export function show() {
    // Add div 
    jQuery = PVRGlobals.jQuery;
    jQuery("body").append(`<div id="settings_panel"></div>`)
    let settingsPanel = jQuery("#settings_panel");

    // Styleize div
    settingsPanel.css("position", "absolute");
    settingsPanel.css("left", "0");
    settingsPanel.css("top", "0");
    settingsPanel.css("width", "100%");
    settingsPanel.css("height", "100%");
    settingsPanel.css("background-color", "Gainsboro");
    settingsPanel.css("z-index", "1000");
    settingsPanel.css("padding", "15px");
    settingsPanel.css("overflow-y", "scroll");

    // Make it fluid with bootstrap
    settingsPanel.addClass("container-fluid");

    // Add in html
    let html = panel(
        'ProteinVR 1.0', 
        `<div id="hardware-msg" class="alert alert-info">
            Select your hardware setup:
        </div>` + 
        panel(
            "Hardware", 
            row_thirds_split(
                [3,4,5],
                radioBoxes(
                    "Viewer",
                    ["Screen", "VR Headset"],  // must be same order as enum above
                    ['<i class="icon-imac"></i>', '<i class="icon-glassesalt"></i>']
                    // [85, 115]
                ),
                radioBoxes(
                    "Audio",
                    ["Speakers", "Headphones", "None"],  // must be same order as enum above
                    ['<i class="icon-speaker"></i>', '<i class="icon-headphones"></i>', '<span class="glyphicon glyphicon-volume-off" aria-hidden=true></span>']
                    // [100, 120, 75]
                ),
                radioBoxes(
                    "Device",
                    ["Mobile", "Laptop", "Desktop"],  // must be same order as enum above
                    ['<i class="icon-iphone"></i>', '<i class="icon-laptop"></i>', '<i class="icon-connectedpc"></i>']
                    // [100, 100, 100]
                )
            )
        ) + 
        panel(
            "Initial Performance Settings",
            `<div id="settings-msg" class="alert alert-info">
                Initial performance settings. ProteinVR will adjust in game to maintain 30 frames per second.
            </div>` +
            row_thirds_split(
                [4, 4, 4],
                radioBoxes(
                    "Textures",
                    ["Sharp", "Medium", "Grainy"],  // must be same order as enum above
                    // [70, 85, 80]
                ),
                radioBoxes(
                    "Objects",
                    ["Detailed", "Normal", "Simple"],  // must be same order as enum above
                    // [90, 85, 85]
                ),
                radioBoxes(
                    "Fog",
                    ["Clear", "Thin", "Thick"],  // must be same order as enum above
                    // [60, 55, 55]
                )
            ) + 
            row_thirds_split(
                [4, 4, 4],
                radioBoxes(
                    "Display",
                    ["Full Screen", "Windowed"],  // must be same order as enum above
                    // [70, 85, 80]
                ),
                "",
                ""
            )
        ) + 
        `<button id="start_game_button" type="button" class="btn btn-primary">Start</button>`
    );

    settingsPanel.html(html);

    addJavaScript();
}

function panel(title, html) {
    return `
        <div class="panel panel-primary">
            <div class="panel-heading"><h3 class="panel-title">${title}</h3></div>
            <div class="panel-body">${html}</div>
        </div>
    `;
}

function section(html) { // panel without header
    return `<div class="panel panel-default"><div class="panel-body">${html}</div></div>`;
    // return `<div class="well">${html}</div>`;
}

function row_even_split(html1, html2) {
    return `
        <div class="row">
            <div class="col-lg-6 col-xs-12">
                ${html1}
            </div>
            <div class="col-lg-6 col-xs-12">
                ${html2}
            </div>
        </div>                
    `;
}

function row_thirds_split(widths, html1, html2, html3) {
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

function formGroup(label, html) {
    return `
    <div class="input-group">
        <div class="form-group">
            <!-- <label class="col-xs-2">${label}:</label> -->
            <!-- <div class="col-xs-10">${html}</div> -->
            ${html}
        </div>
    </div>
    `;
}

function radioBoxes(label, values, icons_if_phone = undefined) {
    let id = label.toLowerCase().replace(/ /g, '');
    let html = `<div class="form-group">
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
        // Label: width:${widths_in_pixels[i]}px; 
        // input: <div class="glyphicon glyphicon-ok" style="display: none; margin-right: 3px; margin-left: -4px;" aria-hidden=true></div> 
        html +=         `<label class="btn btn-default ${id}-labels proteinvr-radio-label" data-description="${label}: ${value}" style="padding-left: 0; padding-right: 0; left:-${i+1}px;">
                            <input type="radio" name="${id}" id="${id}${i}" autocomplete="off" value="${value.replace(/ /g, '')}"><span class="the-icon visible-xs">${iconHtml}</span><span class="hidden-xs">${value}</span>
                        </label>`;
    }
    html +=         `</div>
                </div>`;
    return html;
}


// function radioBoxes(label, values, widths_in_pixels) {
//     let id = label.toLowerCase();
//     let html = `<div class="input-group">
//                     <div class="input-group-addon" style="width: 20%; min-width: 50px;">${label}:</div>
//                     <div class="btn-group btn-group-justified" data-toggle="buttons">`;
    
//     for (let i = 0; i < values.length; i++) {
//         let value = values[i];
//         let labelStyle = '';
//         if (i == 0) {
//             labelStyle = 'border-top-left-radius: 0; border-bottom-left-radius: 0;';
//         }

//         labelStyle += "padding-left: 0; padding-right: 0;"

//         html +=         `<label class="btn btn-default ${id}-labels proteinvr-radio-label" style="width:${widths_in_pixels[i]}px; ${labelStyle}">
//                             <input type="radio" name="${id}" id="${id}${i}" autocomplete="off" value="${value.replace(/ /g, '')}"><div class="glyphicon glyphicon-ok" style="display: none; margin-right: 3px; margin-left: -4px;" aria-hidden=true></div> ${value}
//                         </label>`;
//     }
//     html +=         `</div>
//                 </div>`;
//     return html;
// }

function toggle(text: string, checked: boolean, width_in_pixels: number = 41) {
    let doCheck = "";
    let styles = "display: none;";
    if (checked) {
        doCheck = " checked";
        styles = "display: inline-block;";
    }
    // styles += "display: inline-block;"; // position: absolute; top: 8px; left: 15px;";

    let html =`
        <div class="btn-group" data-toggle="buttons">
            <label class="btn btn-primary active toggle_box" style="width:${width_in_pixels}px;"> <!-- style="padding-left: 35px; padding-right: 35px;"> -->
                <input type="checkbox" autocomplete="off"${doCheck}><div class="glyphicon glyphicon-ok" style="${styles}" aria-hidden=true></div> &nbsp;${text}
            </label>
        </div>
    `;
    return html;
}

function setRadioState(id, varsToUse) {
    setTimeout(function() {
        // Get all the labels and make them default colored, no checkboxes.
        let labels = jQuery(`.${id}-labels`);
        labels.removeClass("btn-primary");
        labels.addClass("btn-default");
        // labels.find(".glyphicon-ok").hide();
        labels.removeClass("active");  // these don't look so great IMHO
        labels.removeClass("focus");

        // Now find the one that should be checked.
        let labelToUse = labels.find(`#${id}${varsToUse[id]}`).closest("label");
        labelToUse.removeClass('btn-default');
        labelToUse.addClass("btn-primary");
        // labelToUse.find(".glyphicon-ok").show();

        // Also make sure associated radio input is checked.
        let inputToUse = labelToUse.find('input');
        inputToUse.prop("checked", "checked");
    }, 0);
}

export function setGUIState() {
    let varsToUse = jQuery.parseJSON(localStorage.getItem("proteinvr_params"));
    
    // Set the viewer field
    setRadioState("viewer", varsToUse);

    // Set the audio field
    setRadioState("audio", varsToUse);

    // Set the device field
    setRadioState("device", varsToUse);
    
    // Set the textures field
    setRadioState("textures", varsToUse);

    // Set the fog field
    setRadioState("fog", varsToUse);

    // Set the fog field
    setRadioState("objects", varsToUse);

    // Set the fog field
    setRadioState("display", varsToUse);
}

function addJavaScript() {
    // Make toggle boxes clickable.
    jQuery(".toggle_box").mouseup(function() {
        setTimeout(function() {
            // This to move it to bottom of stack.
            let This = jQuery(this);
            // let checked = This.find("input").prop("checked");
            // if (checked) {
            //     This.find('.glyphicon-ok').show(); //css("opacity", 1);
            // } else {
            //     This.find('.glyphicon-ok').hide(); //css("opacity", 0);
            // }

            This.removeClass("focus");

        }.bind(this));
    });

    // Make radio buttons clickable
    jQuery(".proteinvr-radio-label").mouseup(function() {
        let This = jQuery(this);
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

    // start button. Wrapped in screenful in case you want to go full screen
    // when you press the start button.
    jQuery.getScript( "js/screenfull.min.js" ).done(function( script, textStatus ) {
        // This does need to be registered on the window. If you do it
        // through a click in babylonjs, browsers will reject the
        // full-screen request.
        jQuery("#start_game_button").click(function() {
            jQuery("#settings_panel").fadeOut(1000);
            Setup.continueSetupAfterSettingsPanelClosed();

            if ((UserVars.getParam("display") === UserVars.displays.FullScreen) && (screenfull.enabled)) {
                screenfull.request();
            }
        });
    

        // debugger;

        // for (var index = 0; index < PVRGlobals.scene.textures.length; index++) {
        //     var texture = PVRGlobals.scene.textures[index];
            
        //     // if (!texture.canRescale) {
        //     //     continue;
        //     // }

        //     var currentSize = texture.getSize();
        //     var maxDimension = Math.max(currentSize.width, currentSize.height);
        //     var scale = 128.0 / maxDimension;
        //     // if (maxDimension > 128) {
        //     if (scale < 1.0) {
        //         texture.scale(scale);
        //     }
        //     // }
        // }


    });
}