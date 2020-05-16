// All load/save plugins must inherit this one. Provides a standard interface.
// I'm going to put a _ in front of the functions that should not be changed,
// just to keep things organized.

export class LoadSaveParent {
    //// First, things that child classes should overwrite. ////

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
     * this function.
     * @returns void
     */
    public startLoadSave(): void {
        alert("Starting load or save.");
    }

    //// Now things that child classes should not overwrite. ////

    // A variable that describes the type of plugin.
    public _type: string = "loadSave";

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
            <div class="container-fluid">
                <div class="row will-erase" style="display:none;">
                    <div class="col-md-12">
                        <div style="display:none;" class="will-erase alert alert-warning" role="alert">
                            If you open a new molecule, your current molecule will be replaced!
                        </div>
                        <hr class="mt-3 mb-4" style="border-top:0;" />
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
                <button id="submit" class="btn btn-primary">
                    Load
                </button>
                <hr />
                <p>
                    ProteinVR is brought to you by the <a href="http://durrantlab.com"
                    target="_blank">Durrant Lab</a> at the University of Pittsburgh. If
                    you use ProteinVR in your research, please cite:
                </p>
                <p>
                    Cassidy KC, Šefčík J, Raghav Y, Chang A, Durrant JD (2020) <a
                    href="https://journals.plos.org/ploscompbiol/article?id=10.1371/journal.pcbi.1007747"
                    target="_blank">ProteinVR: Web-based molecular visualization in
                    virtual reality</a>. PLoS Comput Biol 16(3): e1007747.
                </p>
            </div>`;
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
    }
}
