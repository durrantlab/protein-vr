// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


(function(context) {
    // Determine whether warning should be displayed. Do this fast.
    var warnings = document.getElementsByClassName("will-erase");
    for (var i = 0; i < warnings.length; i++) {
        var warning = warnings[i];
        if (window["PVR_warning"] === true) {
            warning.style.display = "inline-block";
        } else {
            warning.style.display = "none";
        }
    }
    delete window["PVR_warning"];

    // Load in the html for the default environment options (local).
    let firstHTML = new Promise((resolve, reject) => {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                let data = JSON.parse(this.responseText);
                var html = '';

                for (var e of data) {
                    let selectedTxt = "";

                    if (localStorage.getItem("environ") === e["path"]) {
                        // User previous selected this environment. Use it
                        // again by default.
                        selectedTxt = "selected ";
                    }

                    html += '<option ' + selectedTxt + 'value="' + e["path"] + '">' + e["description"] + '</option>';
                }

                resolve(html);
            }
        };
        xhttp.open("GET", "environs/environments_list.json", true);
        xhttp.send();
    });

    // Also load html of external (more complex) environments. Note that you
    // can't use durrantlab.com, because redirects invalidate CORS. I'm going
    // to disable this feature for now. Only scenes that are packaged with
    // ProteinVR itself will be accessible.
    // let remoteBaseUrl = "https://durrantlab.pitt.edu/apps/protein-vr/environments/";
    // let secondHTML = new Promise((resolve, reject) => {
    //     jQuery.getJSON(remoteBaseUrl + "environments_list.json").done((data) => {
    //         html = "";
    //         for (var e of data) {
    //             html += '<option value="' + e["path"] + '">' + e["description"] + ' (Complex)</option>';
    //         }
    //         resolve(html);
    //     }).fail(function() {
    //         resolve("");  // could use reject too.
    //     });;
    // });

    // When both are resady, add them to the dom.
    // Promise.all([firstHTML, secondHTML]).then((htmls) => {
    firstHTML.then((html) => {
        var environmentSelect = document.getElementById("environments");
        // environmentSelect.append(htmls[0] + htmls[1]);
        environmentSelect.innerHTML = html;

        // Get jquery objects for the form elements.
        var urlOrPDB = document.getElementById("urlOrPDB");
        var shadowsObj = document.getElementById("molecular-shadows");
        var hardwareScalingObj = document.getElementById("set-hardware-scaling-level");
        var submitButton = document.getElementById("submit");

        // Set the values of those form elements if they are in local
        // storage. Decided not to save url for security reasons.
        // if (localStorage.getItem("url") !== null) {
        //     urlOrPDB.val(localStorage.getItem("url"));
        // }
        if (localStorage.getItem("shadows") !== null) {
            shadowsObj.checked = localStorage.getItem("shadows") === "true";
        }

        if (localStorage.getItem("hardwareScaling") !== null) {
            hardwareScalingObj.checked = localStorage.getItem("hardwareScaling") === "true";
        } else {
            hardwareScalingObj.checked = true;  // default
        }

        if (window["webXRPolyfill"]["nativeWebXR"] !== true) {
            var divs = document.getElementsByClassName("enhance-resolution-container");
            for (var i = 0; i < warnings.length; i++) {
                var div = divs[i];
                div.style.display = "inline-block";
            }
        }

        urlOrPDB.focus();

        submitButton.onclick = () => {
            // Get the form values.
            var url = urlOrPDB.value
            var environmentSelectOption = environmentSelect.options[environmentSelect.selectedIndex]; // .find("option:selected");
            var environ = environmentSelectOption.value;
            var shadows = shadowsObj.checked;
            var hardwareScaling = hardwareScalingObj.checked;

            // Save them so they are the same when you reload. Decided
            // not to save url for security reasons (could be
            // proprietary).
            // localStorage.setItem('url', url);
            localStorage.setItem('environ', environ);
            localStorage.setItem('shadows', shadows);
            localStorage.setItem('hardwareScaling', hardwareScaling);

            // Constricut the redirect url and redirect.
            let curUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            let newUrl = curUrl + "?s=" + url + "&e=" + environ + "&sh=" + shadows.toString() + "&hs=" + hardwareScaling.toString();
            window.location.href = newUrl;
        };

        urlOrPDB.onkeypress = (e) => {
            if (e.charCode === 13) {
                submitButton.click();
            }
        };
    });

    var links = document.getElementsByClassName("link-sim");
    var linksLen = links.length;
    for (var i = 0; i < linksLen; i++) {
        var link = links[i];
        link.onclick = function(event) {
            event.preventDefault()

            var href = this.dataset["href"];
            var copy = this.dataset["copy"];
            if (copy === undefined) { copy = href; }

            urlOrPDB.value = copy;

            if ((href.slice(0, 4) === "http") || (href.indexOf(".sdf") !== -1)) {
                window.open(href, '_blank');
            }
        }
    }
})(this);
