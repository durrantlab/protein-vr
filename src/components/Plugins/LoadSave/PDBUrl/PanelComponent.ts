import { VueComponentParent } from "../../../UI/Vue/VueComponentParent";
import { store } from "../../../UI/Vue/VueX/VueXStore";

declare var jQuery;

// @ts-ignore
import templateHtml from "./PanelComponent.template.htm";
import { LoadSaveParent } from "../Parent";

export let associatedPlugin: LoadSaveParent;
export function setAssociatedPlugin(plugin: LoadSaveParent): void {
    associatedPlugin = plugin;
}

export class PanelComponent extends VueComponentParent {
    public tag = "pdb-url-panel";
    public methods = {
        "submitPDBUrl"(): void {
            associatedPlugin._startLoadSave();
        },
        "onChangePDBUrl"(val: string): void {
            store.commit("setVar", {
                moduleName: "pdbUrlPanel",
                varName: "urlOrPDB",
                val: val
            });
        },
        "setUrl"(s: string): void {
            store.commit("setVar", {
                moduleName: "pdbUrlPanel",
                varName: "urlOrPDB",
                val: s
            });

            if ((s.slice(0, 4) === "http") || (s.indexOf(".sdf") !== -1)) {
                window.open(s, '_blank');
            }
        },
        "onKeypress"(e: KeyboardEvent): void {
            if (e.charCode === 13) {
                associatedPlugin._startLoadSave();
            }
        },
        "changeEnvironment"(val: string): void {
            this.$store.commit("setVar", {  // default
                moduleName: "pdbUrlPanel",
                varName: "environment",
                val: val
            });
        }
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "urlOrPDB": "",
            "environment": ""
        },
        mutations: {}
    }

    public data = function(): any {
        return {
            "environOptions": []
        };
    }

    public mounted = function(): void {
        // Load in the html for the default environment options (local).
        let firstHTML = new Promise((resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    let data = JSON.parse(this.responseText);
                    let options = [];

                    for (var e of data) {
                        options.push({
                            "value": e["path"],
                            "description": e["description"]
                        });
                    }

                    resolve(options);
                }
            };
            xhttp.open("GET", "environs/environments_list.json", true);
            xhttp.send();
        });

        // Also load html of external (more complex) environments. Note that you
        // can't use durrantlab.com, because redirects invalidate CORS. I'm going
        // to disable this feature for now. Only scenes that are packaged with
        // ProteinVR itself will be accessible.
        // let remoteBaseUrl = "https://durrantlab.pitt.edu/apps/protein-vr/environments/";
        // let secondHTML = new Promise((resolve, reject) => {
        //     jQuery.getJSON(remoteBaseUrl + "environments_list.json").done((data) => {
        //         html = "";
        //         for (var e of data) {
        //             html += '<option value="' + e["path"] + '">' + e["description"] + ' (Complex)</option>';
        //         }
        //         resolve(html);
        //     }).fail(function() {
        //         resolve("");  // could use reject too.
        //     });;
        // });

        // Set focus when the modal opens.
        jQuery("#load-save-modal").on('shown.bs.modal', function (e) {
            document.getElementById('urlOrPDB').focus();
        });

        // When both sources of environments (local and remote) are ready, add
        // them.
        firstHTML.then((options: any[]) => {
            this["environOptions"] = options;

            let environment = options[0]["value"];  // First one.
            let environFromLocStor = localStorage.getItem("environ");
            if (environFromLocStor !== null) {
                // User previous selected this environment. Use it
                // again by default.
                environment = environFromLocStor;
                // selected = true;
                // oneSelected = true;
            }

            this.$store.commit("setVar", {  // default
                moduleName: "pdbUrlPanel",
                varName: "environment",
                val: environment
            });
        });
    };
}
