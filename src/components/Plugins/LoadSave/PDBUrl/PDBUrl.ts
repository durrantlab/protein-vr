import * as Parent from "../Parent";
// import { IgnorePlugin } from "webpack";
import { PanelComponent, setAssociatedPlugin } from "./PanelComponent";
import { store } from "../../../UI/Vue/VueX/VueXStore";
// import { debug } from "../../../PromiseStore";

export class PDBUrl extends Parent.LoadSaveParent {
    // private urlOrPDB;
    private environmentSelect: HTMLElement;

    public pluginTitle = "PDB";
    public pluginSlug = "pdb-url";

    // /**
    //  * Provides html describing the user interface (bootstrap4). Children
    //  * classes should overwrite this function.
    //  * @returns string  The html.
    //  */
    // public userInterface(): string {
    //     return `
    //         <h5>Load PDB File</h5>
    //         <div class="row">
    //             <div class="col-md-12">
    //                 <div class="form-group">
    //                     <label for="pdbid-label">
    //                         Enter a PDB ID (e.g., <a class="link-sim" href="#" data-href="1XDN">1XDN</a>)
    //                         or PDB-/SDF-file URL (e.g., <a class="link-sim" href="#" data-href="https://files.rcsb.org/view/1XDN.pdb">https://files.rcsb.org/.../1XDN.pdb</a>,
    //                         <a class="link-sim" href="#" data-href="../nanokid.sdf" data-copy="nanokid.sdf">nanokid.sdf</a>).
    //                     </label>
    //                     <input type="text" class="form-control" id="urlOrPDB" placeholder="PDB ID or URL" />
    //                     <!-- <p class="help-block"></p> -->
    //                 </div>
    //             </div>
    //         </div>
    //         <div class="row">
    //             <div class="col-md-12">
    //                 <div class="form-group">
    //                     <!-- <label for="environments">Environment</label> -->
    //                     <label for="environments">
    //                         Select an environment to give context to your molecule. <!-- Or
    //                         <a href="#" onclick="loadMoreModels();">load complex environments</a>
    //                         from durrantlab.com. --> <!-- Now loading automatically. -->
    //                     </label>
    //                     <select class="form-control" id="environments"></select>
    //                     <!-- <p class="help-block"></p> -->
    //                 </div>
    //             </div>
    //         </div>
    //         <!-- <div class="row">
    //             <div class="col-md-12">
    //                 <div class="form-check">
    //                     <input style="margin-left: 0;" type="checkbox" class="form-check-input" id="privacy-mode">
    //                     <label style="padding-left: 1.5rem;" class="form-check-label" for="privacy-mode">Privacy Mode (Warn Before Remote Connections)</label>
    //                 </div>
    //             </div>
    //         </div> -->
    //         <!-- <hr class="mt-3 mb-4" style="border-top:0;" /> -->
    //         <!-- <div class="alert alert-warning enhance-resolution-container" style="display:none;">
    //             Your browser does not support WebXR. ProteinVR will try to use the
    //             older WebVR API instead.
    //         </div> -->` +
    //         this._userInterfaceShadowsHardwareScaling();
    // }

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {}

    /**
     * Runs when the user starts the load or save process. No parmeters. These
     * must be accessed as class variables. Children classes should overwrite
     * this function.
     * @returns void
     */
    public startLoadSave(): void {
        // Get the form values.
        let url = store.state["pdbUrlPanel"]["urlOrPDB"];
        let environ = store.state["pdbUrlPanel"]["environment"];

        // Save them so they are the same when you reload. Decided not to save
        // url for security reasons (could be proprietary).
        // localStorage.setItem('url', url);
        localStorage.setItem('environ', environ);

        // Construct the redirect url and redirect.
        let curUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        let shadows = store.state["shadowsHardwareScaling"]["useShadows"].toString();
        let hardwareScaling = store.state["shadowsHardwareScaling"]["useHardwareScaling"].toString();
        let newUrl = curUrl + "?s=" + url + "&e=" + environ + "&sh=" + shadows + "&hs=" + hardwareScaling;
        // let newUrl = curUrl + "?s=" + url + "&e=" + environ + "&sh=" + this._shadowsObj.checked.toString() + "&hs=" + this._hardwareScalingObj.checked.toString();
        window.location.href = newUrl;
    }

    // TODO: docstring
    public vuePanelComponent(): any {
        setAssociatedPlugin(this);
        return PanelComponent;
    }
}
