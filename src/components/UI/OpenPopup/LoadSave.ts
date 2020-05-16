import * as OpenPopup from "../../UI/OpenPopup/OpenPopup";
import * as Plugins from "../../Plugins/Plugins";
import * as LoadSavePluigin from "../../Plugins/LoadSave/Parent";

export function open(): void {
    // Get the user interfaces.
    let plugins: LoadSavePluigin.LoadSaveParent[] = Plugins.getPluginsOfType("loadSave");
    let html = "";
    const pluginsLen = plugins.length;
    for (let i = 0; i < pluginsLen; i++) {
        html += plugins[i]._userInterface();
    }

    let onReadyCallBack = () => {
        for (let i = 0; i < pluginsLen; i++) {
            plugins[i]._onUserInterfaceDone();
            plugins[i].onUserInterfaceDone();
        }
    }

    OpenPopup.openModal({
        title: "Load and Save",
        isUrl: false,
        content: html,
        onReadyCallBack: onReadyCallBack
    });
}
