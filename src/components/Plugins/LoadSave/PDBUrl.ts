import * as Parent from "./Parent";
import { IgnorePlugin } from "webpack";

export class PDBUrl extends Parent.LoadSaveParent {
    private urlOrPDB;
    private environmentSelect: HTMLElement;
    private shadowsObj;
    private hardwareScalingObj;

    /**
     * Provides html describing the user interface (bootstrap4). Children
     * classes should overwrite this function.
     * @returns string  The html.
     */
    public userInterface(): string {
        return `
            <h5>New Scene</h5>
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label for="exampleInputEmail1">
                            Enter a PDB ID (e.g., <a class="link-sim" href="#" data-href="1XDN">1XDN</a>)
                            or PDB-/SDF-file URL (e.g., <a class="link-sim" href="#" data-href="https://files.rcsb.org/view/1XDN.pdb">https://files.rcsb.org/.../1XDN.pdb</a>,
                            <a class="link-sim" href="#" data-href="../nanokid.sdf" data-copy="nanokid.sdf">nanokid.sdf</a>).
                        </label>
                        <input type="text" class="form-control" id="urlOrPDB" placeholder="PDB ID or URL" />
                        <!-- <p class="help-block"></p> -->
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <!-- <label for="environments">Environment</label> -->
                        <label for="environments">
                            Select an environment to give context to your molecule. <!-- Or
                            <a href="#" onclick="loadMoreModels();">load complex environments</a>
                            from durrantlab.com. --> <!-- Now loading automatically. -->
                        </label>
                        <select class="form-control" id="environments"></select>
                        <!-- <p class="help-block"></p> -->
                    </div>
                </div>
            </div>
            <!-- <div class="row">
                <div class="col-md-12">
                    <div class="form-check">
                        <input style="margin-left: 0;" type="checkbox" class="form-check-input" id="privacy-mode">
                        <label style="padding-left: 1.5rem;" class="form-check-label" for="privacy-mode">Privacy Mode (Warn Before Remote Connections)</label>
                    </div>
                </div>
            </div> -->
            <hr class="mt-3 mb-4" style="border-top:0;" />
            <h5>Graphics Settings</h5>
            <!-- <div class="alert alert-warning enhance-resolution-container" style="display:none;">
                Your browser does not support WebXR. ProteinVR will try to use the
                older WebVR API instead.
            </div> -->
            <div class="row">
                <div class="col-md-12">
                    <div class="form-check">
                        <label for="shadows">
                            Molecular shadows can slow navigation and may crash some
                            mobile browsers.
                        </label>
                        <div id="shadows">
                            <input style="margin-left: 0;" type="checkbox" class="form-check-input" id="molecular-shadows">
                            <label style="padding-left: 1.5rem;" class="form-check-label" for="molecular-shadows">Allow Molecules to Cast Subtle Shadows</label>
                            <p style="height:5px;">&nbsp;</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="row enhance-resolution-container" style="display:none;">
                <div class="col-md-12">
                    <div class="form-check">
                        <label for="enhance-resolution">
                            <!-- can cause problems on some headsets.--><!-- (e.g.,
                            graphics in only one eye, left-eye field of view impinges
                            on right, etc.).--> Try disabling enhanced VR resolution
                            if ProteinVR sends incongruous images to each eye in VR mode.
                            <!-- VR breaks on your device. -->
                        </label>
                        <div id="enhance-resolution">
                            <input style="margin-left: 0;" type="checkbox" class="form-check-input" id="set-hardware-scaling-level">
                            <label style="padding-left: 1.5rem;" class="form-check-label" checked for="set-hardware-scaling-level">Enhance Resolution in VR Mode (Recommended)</label>
                            <p style="height:5px;">&nbsp;</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {
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

        this.urlOrPDB = document.getElementById("urlOrPDB");

        // When both are ready, add them to the dom.
        firstHTML.then((html: string) => {
            this.environmentSelect = document.getElementById("environments");
            // environmentSelect.append(htmls[0] + htmls[1]);
            this.environmentSelect.innerHTML = html;

            // Get jquery objects for the form elements.
            this.shadowsObj = document.getElementById("molecular-shadows");
            this.hardwareScalingObj = document.getElementById("set-hardware-scaling-level");
            var submitButton = document.getElementById("submit");

            // Set the values of those form elements if they are in local
            // storage. Decided not to save url for security reasons.
            // if (localStorage.getItem("url") !== null) {
            //     urlOrPDB.val(localStorage.getItem("url"));
            // }
            if (localStorage.getItem("shadows") !== null) {
                // @ts-ignore
                this.shadowsObj.checked = localStorage.getItem("shadows") === "true";
            }

            if (localStorage.getItem("hardwareScaling") !== null) {
                // @ts-ignore
                this.hardwareScalingObj.checked = localStorage.getItem("hardwareScaling") === "true";
            } else {
                // @ts-ignore
                this.hardwareScalingObj.checked = true;  // default
            }

            if (window["webXRPolyfill"]["nativeWebXR"] !== true) {
                var divs = document.getElementsByClassName("enhance-resolution-container");
                for (var i = 0; i < divs.length; i++) {
                    var div = divs[i];
                    // @ts-ignore
                    div.style.display = "inline-block";
                }
            }

            this.urlOrPDB.focus();

            // @ts-ignore
            submitButton.onclick = () => {
                this.startLoadSave();
            };

            this.urlOrPDB.onkeypress = (e) => {
                if (e.charCode === 13) {
                    submitButton.click();
                }
            };
        });

        var links = document.getElementsByClassName("link-sim");
        var linksLen = links.length;
        for (var i = 0; i < linksLen; i++) {
            var link = links[i];
            // @ts-ignore
            link.onclick = function(event) {
                event.preventDefault()

                var href = this.dataset["href"];
                var copy = this.dataset["copy"];
                if (copy === undefined) { copy = href; }

                // @ts-ignore
                document.getElementById("urlOrPDB").value = copy;

                if ((href.slice(0, 4) === "http") || (href.indexOf(".sdf") !== -1)) {
                    window.open(href, '_blank');
                }
            }
        }
    }

    /**
     * Runs when the user starts the load or save process. No parmeters. These
     * must be accessed as class variables. Children classes should overwrite
     * this function.
     * @returns void
     */
    public startLoadSave(): void {
        // Get the form values.
        var url = this.urlOrPDB.value

        // @ts-ignore
        var option = this.environmentSelect.options[this.environmentSelect.selectedIndex]; // .find("option:selected");
        var environ = option.value;

        // @ts-ignore
        var shadows = this.shadowsObj.checked;

        // @ts-ignore
        var hardwareScaling = this.hardwareScalingObj.checked;

        // Save them so they are the same when you reload. Decided
        // not to save url for security reasons (could be
        // proprietary).
        // localStorage.setItem('url', url);
        localStorage.setItem('environ', environ);
        localStorage.setItem('shadows', shadows.toString());
        localStorage.setItem('hardwareScaling', hardwareScaling.toString());

        // Construct the redirect url and redirect.
        let curUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        let newUrl = curUrl + "?s=" + url + "&e=" + environ + "&sh=" + shadows.toString() + "&hs=" + hardwareScaling.toString();
        window.location.href = newUrl;
    }
}
