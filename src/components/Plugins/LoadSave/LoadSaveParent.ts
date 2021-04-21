// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// All load/save plugins must inherit this one. Provides a standard interface.
// I'm going to put a _ in front of the functions that should not be changed,
// just to keep things organized.
import {VueComponentParent} from "../../UI/Vue/Components/VueComponentParent";
import {PluginParent} from "../PluginParent";

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

        /**
         * Runs when the tab header is clicked.
         * @returns void
         */
        onTabHeaderClick(): void {}
    }
}
