import * as OpenPopup from "../../UI/OpenPopup/OpenPopup";
import * as Plugins from "../../Plugins/Plugins";
import * as LoadSavePluigin from "../../Plugins/LoadSave/Parent";

export function open(): void {
    // Get the user interfaces.
    let plugins: LoadSavePluigin.LoadSaveParent[] = Plugins.getPluginsOfType("loadSave");
    let htmlTabHeaders = '';
    let htmlTabContents = '';
    let activeClass = " active";
    const pluginsLen = plugins.length;
    for (let i = 0; i < pluginsLen; i++) {
        let plugin = plugins[i];
        htmlTabHeaders += `
            <li class="nav-item">
                <a
                    class="nav-link${activeClass}"
                    id="${plugin.pluginSlug}-tab"
                    data-toggle="tab" href="#${plugin.pluginSlug}"
                    role="tab" aria-controls="${plugin.pluginSlug}"
                    aria-selected="true">${plugin.pluginTitle}</a>
            </li>`;
        htmlTabContents += `
            <div
                class="tab-pane fade show${activeClass}"
                id="${plugin.pluginSlug}" role="tabpanel"
                aria-labelledby="${plugin.pluginSlug}-tab">${plugin._userInterface()}</div>`;
        activeClass = "";
    }
    let html = `
        <nav>
            <ul class="nav nav-tabs" id="loadSaveTabs" role="tablist">
                ${htmlTabHeaders}
            </ul>
        </nav>
        <div class="tab-content" id="loadSaveTabContent">
            ${htmlTabContents}
        </div>
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
        </p>`;

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
