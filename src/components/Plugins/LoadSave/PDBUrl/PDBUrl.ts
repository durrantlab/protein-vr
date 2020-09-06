import * as Parent from "../LoadSaveParent";
// import { IgnorePlugin } from "webpack";
import { PanelComponent, setAssociatedPlugin } from "./PanelComponent";
import { store } from "../../../Vars/VueX/VueXStore";
// import { debug } from "../../../PromiseStore";

export class PDBUrl extends Parent.LoadSaveParent {
    // private urlOrPDB;
    private environmentSelect: HTMLElement;

    public pluginTitle = "Web<div class='emoji'>📂</div>";
    public pluginSlug = "pdb-url";

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {}

    /**
     * Runs when the user starts the load process. Most parameters should be
     * accessed as class variables.
     * @param  {*} [data=undefined]  Any data to pass to the load/save
     *                               process.
     * @returns void
     */
    public startLoad(data: any = undefined): void {
        // Get the form values.
        let url = store.state["pdbUrlPanel"]["urlOrPDB"];

        // Save them so they are the same when you reload. Decided not to save
        // url for security reasons (could be proprietary).
        // localStorage.setItem('url', url);

        // Construct the redirect url and redirect.
        let params = {"s": url}
        window.location.href = this.makeUrl(params);
    }

    /**
     * Gets the PanelComponent class.
     * @returns *  The class.
     */
    public vuePanelComponent(): any {
        setAssociatedPlugin(this);
        return PanelComponent;
    }
}
