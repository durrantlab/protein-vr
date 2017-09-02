define(["require", "exports", "./UserVars"], function (require, exports, UserVars) {
    "use strict";
    exports.__esModule = true;
    // import * as PointerLock from "./PointerLock";
    // import * as Setup from "../Core/Setup";
    // import * as Core from "../Core/Core";
    // import { PointerLock } from "../Environment";
    var jQuery;
    function show(params) {
        var jQuery = params.jQuery;
        // Add div 
        // jQuery = PVRGlobals.jQuery;
        jQuery("body").append("<div id=\"settings_panel\"></div>");
        var settingsPanel = jQuery("#settings_panel");
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
        var html = panel('ProteinVR 1.0', "<div id=\"hardware-msg\" class=\"alert alert-info\">\n            Select your hardware setup:\n        </div>" +
            panel("Hardware", row_even_split(
            // [3,4,5],
            radioBoxes("Viewer", UserVars.paramNames["viewer"], ['<i class="icon-imac"></i>', '<i class="icon-glassesalt"></i>']
            // [85, 115]
            ), radioBoxes("Audio", UserVars.paramNames["audio"], ['<i class="icon-speaker"></i>', '<i class="icon-headphones"></i>', '<span class="glyphicon glyphicon-volume-off" aria-hidden=true></span>']
            // [100, 120, 75]
            )) +
                row_even_split(radioBoxes("Device", UserVars.paramNames["device"], ['<i class="icon-iphone"></i>', '<i class="icon-laptop"></i>', '<i class="icon-connectedpc"></i>']
                // [100, 100, 100]
                ), radioBoxes("Moving", UserVars.paramNames["moving"], ['<i class="icon-upright"></i>', '<i class="icon-manalt"></i>', '<i class="icon-lightning"></i>'] //, '<i class="icon-connectedpc"></i>']
                // [100, 100, 100]
                ) + "<!--" + radioBoxes(// commented out because of simplified UI
                "Looking", UserVars.paramNames["looking"], ['<i class="icon-mouse"></i>', '<i class="icon-hand-up"></i>'] //, '<i class="icon-connectedpc"></i>']
                // [100, 100, 100]
                ) + "-->")) /* +
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
                "<button id=\"start_game_button\" type=\"button\" class=\"btn btn-primary\">Start</button>"
        // <button id="broadcast_game_button" style="display: none;" type="button" class="btn btn-primary">Broadcast</button>`
        );
        settingsPanel.html(html);
        addJavaScript(params.onSettingsPanelClosed, params.engine, jQuery);
    }
    exports.show = show;
    function panel(title, html) {
        return "\n        <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\">\n                <h3 class=\"panel-title\">\n                    " + title + "\n                </h3>\n            </div>\n            <div class=\"panel-body\">" + html + "</div>\n        </div>\n    ";
    }
    function panelCollapsible(title, html) {
        var rnd = Math.floor(Math.random() * 1000000).toString();
        return "\n        <div class=\"panel panel-primary\">\n            <div class=\"panel-heading\" onclick=\"jQuery('#collapse-" + rnd + "-href').get(0).click();\" style=\"cursor: pointer;\">\n                <h3 class=\"panel-title\">\n                    <a data-toggle=\"collapse\" id=\"collapse-" + rnd + "-href\" href=\"#collapse-" + rnd + "\"></a>" + title + "\n                    <i class=\"indicator glyphicon glyphicon-chevron-up pull-right\"></i>\n                </h3>\n            </div>\n            <div id=\"collapse-" + rnd + "\" class=\"panel-collapse collapse\">\n                <div class=\"panel-body\">" + html + "</div>\n            </div>\n        </div>\n    ";
    }
    function section(html) {
        return "<div class=\"panel panel-default\"><div class=\"panel-body\">" + html + "</div></div>";
    }
    function row_even_split(html1, html2) {
        return "\n        <div class=\"row\">\n            <div class=\"col-sm-6 col-xs-12\">\n                " + html1 + "\n            </div>\n            <div class=\"col-sm-6 col-xs-12\">\n                " + html2 + "\n            </div>\n        </div>                \n    ";
    }
    function row_thirds_split(widths, html1, html2, html3) {
        return "\n        <div class=\"row\">\n            <div class=\"col-lg-" + widths[0] + " col-xs-12\">\n                " + html1 + "\n            </div>\n            <div class=\"col-lg-" + widths[1] + " col-xs-12\">\n                " + html2 + "\n            </div>\n            <div class=\"col-lg-" + widths[2] + " col-xs-12\">\n                " + html3 + "\n            </div>\n        </div>                \n    ";
    }
    // function formGroup(label, html) {
    //     return `
    //     <div class="input-group">
    //         <div class="form-group">
    //             <!-- <label class="col-xs-2">${label}:</label> -->
    //             <!-- <div class="col-xs-10">${html}</div> -->
    //             ${html}
    //         </div>
    //     </div>
    //     `;
    // }
    function radioBoxes(label, values, icons_if_phone) {
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
    // function toggle(text: string, checked: boolean, width_in_pixels: number = 41) {
    //     let doCheck = "";
    //     let styles = "display: none;";
    //     if (checked) {
    //         doCheck = " checked";
    //         styles = "display: inline-block;";
    //     }
    //     let html =`
    //         <div class="btn-group" data-toggle="buttons">
    //             <label class="btn btn-primary active toggle_box" style="width:${width_in_pixels}px;"> <!-- style="padding-left: 35px; padding-right: 35px;"> -->
    //                 <input type="checkbox" autocomplete="off"${doCheck}><div class="glyphicon glyphicon-ok" style="${styles}" aria-hidden=true></div> &nbsp;${text}
    //             </label>
    //         </div>
    //     `;
    //     return html;
    // }
    function setRadioState(id, varsToUse, jQuery) {
        setTimeout(function () {
            // Get all the labels and make them default colored, no checkboxes.
            var labels = jQuery("." + id + "-labels");
            labels.removeClass("btn-primary");
            labels.addClass("btn-default");
            // labels.find(".glyphicon-ok").hide();
            labels.removeClass("active"); // these don't look so great IMHO
            labels.removeClass("focus");
            // Now find the one that should be checked.
            var labelToUse = labels.find("#" + id + varsToUse[id]).closest("label");
            labelToUse.removeClass('btn-default');
            labelToUse.addClass("btn-primary");
            // labelToUse.find(".glyphicon-ok").show();
            // Also make sure associated radio input is checked.
            var inputToUse = labelToUse.find('input');
            inputToUse.prop("checked", "checked");
        }, 0);
    }
    function setGUIState(jQuery) {
        var varsToUse = jQuery.parseJSON(localStorage.getItem("proteinvr_params"));
        // Set the various radio states
        for (var key in UserVars.paramNames) {
            if (UserVars.paramNames.hasOwnProperty(key)) {
                var key2 = key.toLowerCase();
                setRadioState(key2, varsToUse, jQuery);
            }
        }
        // Always set looking to MouseMove. This because simplifying UI.
        varsToUse["looking"] = UserVars.looking["MouseMove"];
        // Control moving button visibiliy depending on other issues.
        var buttonbarMoving = jQuery(".buttonbar-moving");
        var buttonbarLooking = jQuery(".buttonbar-looking");
        if ((varsToUse["viewer"] == UserVars.viewers["VRHeadset"]) || (varsToUse["device"] == UserVars.devices["Mobile"])) {
            buttonbarMoving.show();
            buttonbarLooking.hide();
            // make sure no pointerlock used in this scenario.
            varsToUse["looking"] = UserVars.looking["Click"];
            UserVars.saveLocalStorageParams(varsToUse);
        }
        else {
            buttonbarMoving.hide();
            buttonbarLooking.show();
        }
    }
    exports.setGUIState = setGUIState;
    function addJavaScript(onSettingsPanelClosed, engine, jQuery) {
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
                setGUIState(jQuery);
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
        // jQuery.getScript( "js/screenfull.min.js" ).done(function( script, textStatus ) {
        // This does need to be registered on the window. If you do it
        // through a click in babylonjs, browsers will reject the
        // full-screen request.
        jQuery("#start_game_button").click(function () {
            jQuery("#settings_panel").fadeOut(1000);
            this.onSettingsPanelClosed();
            console.log(UserVars.getParam("viewer") == UserVars.viewers["Screen"]);
            this.engine.switchFullscreen(UserVars.getParam("viewer") == UserVars.viewers["Screen"]);
            // // if ((UserVars.getParam("display") === UserVars.displays["FullScreen"]) && (screenfull.enabled)) {
            // if (screenfull.enabled) {
            //     jQuery("body").on('click', function(e) {
            //         // If you're using VR and the user clicks, make sure you're full screen.
            //         // This is because the browser automatically goes windowed when you
            //         // Note that all clicks will now call this function... could
            //         // effect performance.
            //         if (screenfull.isFullscreen === false) {
            //             screenfull.request();
            //         }
            //     });
            //     screenfull.request();
            // }
            // if (UserVars.getParam("looking") == UserVars.looking["MouseMove"]) {
            //     // console.log("Usingp ointerlock...");
            //     PointerLock.pointerLock();
            // }
            jQuery("canvas").focus(); // to make sure keypresses work.
        }.bind({
            onSettingsPanelClosed: onSettingsPanelClosed,
            engine: engine
        }));
        // Broadcast button
        // PVRGlobals.broadcastID = Math.floor(100000000 * Math.random()).toString();
        // addBroadcastModal();
        // jQuery("#broadcast_game_button").click(function() {
        //     jQuery('#broadcast_modal').modal('show');
        // });
        // Show the broadcast button if "?id=" is not in the url.
        // if (window.location.href.indexOf("?id=") === -1) {
        //     jQuery("#broadcast_game_button").show();
        // }
        // });
    }
    function addBroadcastModal() {
        var broadcastURL = window.location.href + '?id=' + PVRGlobals.broadcastID;
        jQuery("body").append("\n        <div class=\"modal fade\" id=\"broadcast_modal\" tabindex=\"-1\" role=\"dialog\">\n            <div class=\"modal-dialog\" role=\"document\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button>\n                        <h4 class=\"modal-title\">Broadcast ProteinVR Session</h4>\n                    </div>\n                    <div class=\"modal-body\">\n                        <div id=\"hardware-msg\" class=\"alert alert-info\">\n                            Give your students the URL below so they can accompany you in the virtual-reality world. Then click the \"Start\" button to enter the world yourself.\n                        </div>\n                        <div class=\"input-group\">\n                            <span class=\"input-group-addon\" id=\"url_text\">URL:</span>\n                            <input type=\"text\" value=\"" + broadcastURL + "\" class=\"form-control\" id=\"broadcast-url\" aria-describedby=\"url_text\">\n                        </div>\n                    </div>\n                    <div class=\"modal-footer\">\n                        <button type=\"button\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n                        <button id=\"start_game_from_modal\" type=\"button\" class=\"btn btn-primary\">Start</button>\n                    </div>\n                </div>\n            </div>\n        </div>");
        jQuery("#start_game_from_modal").click(function () {
            jQuery('#broadcast_modal').modal('hide');
            PVRGlobals.teacherBroadcasting = true;
            jQuery("#start_game_button").click();
        });
        jQuery('#broadcast_modal').on('shown.bs.modal', function () {
            jQuery('#broadcast-url').focus();
        });
        // Start trying to get a tinyurl link instead
        jQuery.ajax({
            url: "js/url-shortener/shortener.php?url=" + broadcastURL,
            dataType: 'text'
        }).done(function (newUrl) {
            jQuery("#broadcast-url").val(newUrl);
        });
    }
});
