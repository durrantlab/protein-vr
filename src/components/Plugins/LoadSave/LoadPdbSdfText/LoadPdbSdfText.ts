import * as Parent from "../LoadSaveParent";
import { PanelComponent, setAssociatedPlugin } from "./PanelComponent";
import * as VRML from "../../../Mols/3DMol/VRML";
import { store } from "../../../Vars/VueX/VueXStore";
import * as SimpleModalComponent from "../../../UI/Vue/Components/OpenPopup/SimpleModalComponent";

export class LoadPdbSdfText extends Parent.LoadSaveParent {
    public pluginTitle = "Text<div class='emoji'>📂</div>";
    public pluginSlug = "pdb-sdf-text";

    /**
     * Runs once the user interface has been loaded. Children classes should
     * overwrite this function.
     * @returns void
     */
    public onUserInterfaceDone(): void {}

    /**
     * Runs when the user starts the load process. Most parameters should be
     * accessed as class variables.
     * @param  {*} [pdbSdfText=undefined]  Any data to pass to the load/save
     *                                     process.
     * @returns void
     */
     public startLoad(pdbSdfText: any = undefined): void {
        this.loadPdbOrSdfFromFile(pdbSdfText);
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
