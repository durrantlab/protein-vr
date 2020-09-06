import * as Parent from "../LoadSaveParent";
import { PanelComponent, setAssociatedPlugin } from "./PanelComponent";
import * as VRML from "../../../Mols/3DMol/VRML";
import { store } from "../../../Vars/VueX/VueXStore";
import * as SimpleModalComponent from "../../../UI/Vue/Components/OpenPopup/SimpleModalComponent";

export class LoadSceneFile extends Parent.LoadSaveParent {
    public pluginTitle = "Scene<div class='emoji'>📂</div>";
    public pluginSlug = "proteinvr-load-scene";

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
        let urlParams = JSON.parse(data);
        let dataToLoad = urlParams["scene"];
        delete urlParams["scene"];

        this.loadPdbOrSdfFromFile(
            dataToLoad["file"], dataToLoad["type"], urlParams
        );
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
