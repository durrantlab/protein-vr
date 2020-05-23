import * as Parent from "./Parent";

var FileSaver = require('file-saver');

export class SceneFile extends Parent.LoadSaveParent {
    public pluginTitle = "ProteinVR Scene";
    public pluginSlug = "proteinvr-scene";

    /**
     * Provides html describing the user interface (bootstrap4). Children
     * classes should overwrite this function.
     * @returns string  The html.
     */
    public userInterface(): string {
        return `
            <h5>Load ProteinVR Scene</h5>
            ${this._superFileWiget("proteinvr-scene-file")}
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
            ${this._userInterfaceShadowsHardwareScaling()}
            <h5>Save ProteinVR Scene</h5>` +
            this._button("save-proteinvr-scene", "Save File");
    }

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {
        // Setup the save scene button.
        var saveButton = document.getElementById("save-proteinvr-scene");

        // @ts-ignore
        saveButton.onclick = () => {
            this._startLoadSave();
        };
    }

    /**
     * Runs when the user starts the load or save process. No parmeters. These
     * must be accessed as class variables. Children classes should overwrite
     * this function.
     * @returns void
     */
    public startLoadSave(): void {
        var blob = new Blob(
            [window.location.href.split("?", 2)[1]],
            {type: "text/plain;charset=utf-8"}
        );
        FileSaver.saveAs(blob, "my-scene.proteinvr");
    }
}
