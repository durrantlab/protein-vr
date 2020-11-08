// All load/save plugins must inherit this one. Provides a standard interface.
// I'm going to put a _ in front of the functions that should not be changed,
// just to keep things organized.
import {VueComponentParent} from "../../UI/Vue/Components/VueComponentParent";
import {store} from "../../Vars/VueX/VueXStore";
import {PluginParent} from "../PluginParent";

// interface IMakeUrl {
//     useShadows: boolean,
//     useHardwareScaling: boolean,
//     url: string,
//     environ: string,
//     styles?: string,  // st
// }

// st0=All--Protein--Cartoon--Spectrum&st1=All--Ligand--Stick--Element&cx=1.5257&cy=2.3093&cz=-0.7067&crx=0&cry=0&crz=0&crw=1&e=environs/night/&sh=false&hs=true

interface PluginWithVueComponent extends PluginParent {}

export abstract class LoadSaveParent extends VueComponentParent implements PluginWithVueComponent {
    // A variable that describes the type of plugin.
    public type: string = "loadSave";

    abstract pluginTitle = "";
    abstract pluginSlug = "";

    abstract methods = {
        /**
         * Runs when the user starts the load or save process. Children
         * classes should overwrite this function. But they should almost
         * always start by calling
         * LoadSaveUtils.shadowsHardwareScalingVueXToLocalStorage().
         * @param  {*} [data=undefined]  Any data to pass to the load/save
         *                               process.
         * @returns void
         */
        startLoadOrSave(data: any): void {},

    }
}
