// All load/save plugins must inherit this one. Provides a standard interface.
// I'm going to put a _ in front of the functions that should not be changed,
// just to keep things organized.

export class LoadSaveParent {
    //// First, things that child classes should overwrite. ////

    public pluginTitle = "";
    public pluginSlug = "";
    private superFileWigetId = undefined;

    /**
     * Provides html describing the user interface (bootstrap4). Children
     * classes should overwrite this function.
     * @returns string  The html.
     */
    public userInterface(): string {
        return "";
    }

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {
        // Child class should overwrite this.
        alert("User interface done.");
    }

    /**
     * Runs when the user starts the load or save process. No parmeters. These
     * must be accessed as class variables. Children classes should overwrite
     * this function. But they should call _startLoadSave(), which wrapps
     * around this function, not startLoadSave() directly.
     * @returns void
     */
    public startLoadSave(): void {
        alert("Starting load or save.");
    }

    //// Now things that child classes should not overwrite. ////

    // A variable that describes the type of plugin.
    public _type: string = "loadSave";
    public _shadowsObj;
    public _hardwareScalingObj;

    /**
     * Combines a standard header and footer with the user-provided html
     * interface.
     * @returns string  HTML code.
     */
    public _userInterface(): string {
        return this._userInterfaceHeader() +
               this.userInterface() +
               this._userInterfaceFooter();
    }

    /**
     * The HTML header that all plugin children will use.
     * @returns string  HTML code.
     */
    private _userInterfaceHeader(): string {
        return `
            <div class="container-fluid" style="padding-top:15px;">
                <div class="row will-erase" style="display:none;">
                    <div class="col-md-12">
                        <div style="display:none;" class="will-erase alert alert-warning" role="alert">
                            If you open a new molecule, your current molecule will be replaced!
                        </div>
                        <hr class="mt-3 mb-4" style="border-top:0;" />
                    </div>
                </div>`;
    }

    public _formWrapper(content: string): string {
        return `
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        ${content}
                    </div>
                </div>
            </div>`;
    }

    /**
     * The HTML footer that all plugin children will use.
     * @returns string  HTML code.
     */
    private _userInterfaceFooter(): string {
        return `
            <hr class="mt-3 mb-3" style="border-top:0;" />
                ${this._button("submit", "Load")}
            </div>`;
    }

    public _button(id: string, txt: string, cls: string = "primary"): string {
        return this._formWrapper(`
            <button id="${id}" class="btn btn-${cls}">
                ${txt}
            </button>`
        );
    }

    /**
     * The HTML for a checkbox widget.
     * @param  {string}    id               The id of the resulting input checkbox.
     * @param  {string}    label            The label on the checkbox.
     * @param  {string}    helpMsg          Help text.
     * @param  {boolean=}  initiallyHidden  Whether to initially hide the checkbox. False by default.
     */
    public _checkBox(id: string, label: string, helpMsg: string, initiallyHidden: boolean = false) {
        return `
            <div class="row ${id}-container"${initiallyHidden ? ' style="display:none;"' : ''}">
                <div class="col-md-12">
                    <div class="form-check">
                        <label for="${id}-label">
                            ${helpMsg}
                        </label>
                        <div id="${id}-label">
                            <input style="margin-left: 0;" type="checkbox" class="form-check-input" id="${id}">
                            <label style="padding-left: 1.5rem;" class="form-check-label" for="${id}">${label}</label>
                            <p style="height:5px;">&nbsp;</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }

    public _superFileWiget(id: string, placeholder: string = "Type a URL here, or select a file...", label: string = "Specify a file...") {
        this.superFileWigetId = id;
        return this._formWrapper(`
            <label id="${id}-label" for="${id}-container">${label}</label>
            <div id="${id}-container" class="input-group mb-3">
                <input type="text" id="${id}-text-input" placeholder="${placeholder}" class="form-control" aria-label=""><!-- aria-describedby="basic-addon2" -->
                <div class="input-group-append">
                    <span class="input-group-text" style="margin:0; padding:0; border:0; width:110px;">
                        <button class="btn btn-primary" style="position:absolute; width:110px;">Select File</button>
                        <input type="file" id="${id}-file-input" style="z-index:100; opacity:0;">
                    </span>
                </div>
            </div>
        `);
    }

    /**
     * The HTML for molecluar shadows widget used by many of the children.
     * @returns string
     */
    public _userInterfaceShadowsHardwareScaling(): string {
        return "<h5>Graphics Settings</h5>" +
            this._checkBox(
                "molecular-shadows-" + this.pluginSlug,
                "Allow Molecules to Cast Subtle Shadows",
                "Molecular shadows can slow navigation and may crash some mobile browsers."
            ) +
            this._checkBox(
                "set-hardware-scaling-level-" + this.pluginSlug,
                "Enhance Resolution in VR Mode (Recommended)",
                `<!-- can cause problems on some headsets.--><!-- (e.g.,
                    graphics in only one eye, left-eye field of view impinges
                    on right, etc.).--> Try disabling enhanced VR resolution
                    if ProteinVR sends incongruous images to each eye in VR mode.
                    <!-- VR breaks on your device. -->`,
                true
            );
    }

    /**
     * Starts the load save process. This wraps around the user-defined
     * startLoadSave() function, which children define directly. This is the
     * function that should be called (don't be conused by the _ prefix!).
     * @returns void
     */
    public _startLoadSave(): void {
        // @ts-ignore
        var shadows = this._shadowsObj.checked;
        localStorage.setItem('shadows', shadows.toString());

        // @ts-ignore
        var hardwareScaling = this._hardwareScalingObj.checked;
        localStorage.setItem('hardwareScaling', hardwareScaling.toString());

        this.startLoadSave();
    }

    /**
     * Javascript that runs whenever the user interface is loaded. The same
     * for all children that inherit this class.
     * @returns void
     */
    public _onUserInterfaceDone(): void {
        // Determine whether warning should be displayed. Do this fast.
        var warnings = document.getElementsByClassName("will-erase");
        for (var i = 0; i < warnings.length; i++) {
            var warning = warnings[i];
            if (window["PVR_warning"] === true) {
                // @ts-ignore
                warning.style.display = "inline-block";
            } else {
                // @ts-ignore
                warning.style.display = "none";
            }
        }
        delete window["PVR_warning"];

        // Setup shadow checkbox. An option regardless of which input system used.
        this._shadowsObj = document.getElementById("molecular-shadows-" + this.pluginSlug);
        if ((localStorage.getItem("shadows") !== null) && (this._shadowsObj !== null)) {
            // @ts-ignore
            this._shadowsObj.checked = localStorage.getItem("shadows") === "true";
        }

        // Also hardware scaling. An option regardless of which input system used.
        this._hardwareScalingObj = document.getElementById("set-hardware-scaling-level-" + this.pluginSlug);
        if (this._hardwareScalingObj !== null) {
            if (localStorage.getItem("hardwareScaling") !== null) {
                // @ts-ignore
                this._hardwareScalingObj.checked = localStorage.getItem("hardwareScaling") === "true";
            } else {
                // @ts-ignore
                this._hardwareScalingObj.checked = true;  // default
            }
        }

        if (window["webXRPolyfill"]["nativeWebXR"] !== true) {
            var divs = document.getElementsByClassName("set-hardware-scaling-level-" + this.pluginSlug + "-container");  // "enhance-resolution-container");
            for (var i = 0; i < divs.length; i++) {
                var div = divs[i];
                // @ts-ignore
                div.style.display = "inline-block";
            }
        }

        // Check if a super file has been included (only one per load-method
        // plugin).
        if (this.superFileWigetId !== undefined) {
            // Setup the load scene button.
            var fileInput = document.getElementById(this.superFileWigetId + "-file-input");
            fileInput.onchange = (e) => {
                var input = e.target;

                var reader = new FileReader();
                reader.onload = function() {
                    let txt = reader.result;
                    alert(txt);
                    // fileInput["src"] = dataURL;
                };
                reader.readAsText(input["files"][0]);
            };
        }
    }
}
