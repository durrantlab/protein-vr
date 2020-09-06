import * as Parent from "../LoadSaveParent";
import { PanelComponent, setAssociatedPlugin } from "./PanelComponent";
import { store } from "../../../Vars/VueX/VueXStore";

export class New extends Parent.LoadSaveParent {
    public pluginTitle = "New<div class='emoji'>📂</div>";
    public pluginSlug = "new";

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
        window.location.href = this.makeUrl({});
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
