// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

import {VueComponentParent} from "../../../UI/Vue/Components/VueComponentParent";
import {store} from "../../../Vars/VueX/VueXStore";

// @ts-ignore
import {templateHtml} from "./SelectEnvironmentComponent.template.htm.ts";

export class SelectEnvironmentComponent extends VueComponentParent {
    public tag = "select-environment";
    public methods = {
        /**
         * Detects if the environment has changed.
         * @param  {string} val  The new environment variable to set.
         * @returns void
         */
        "changeEnvironment"(val: string): void {
            this.$store.commit("setVar", {  // default
                moduleName: "selectEnvironment",
                varName: "environment",
                val: val
            });
        }
    };

    public computed = {};

    public props = {
        "pluginSlug": {"required": true},
    };

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "environment": "",
            "environOptions": []
        },
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            // "environOptions": []
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {
        loadEnvironments();
    };
}

let loadEnvironmentsRun = false;

/**
 * Loads data about the available environments into the select-environment
 * component.
 * @returns void
 */
export function loadEnvironments(): void {
    // Loads environments. Outside of VueJs system.
    if (loadEnvironmentsRun === true) {
        // Already run.
        return;
    }
    loadEnvironmentsRun = true;

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

    // When both sources of environments (local and remote) are ready, add
    // them.
    firstHTML.then((options: any[]) => {
        store.commit("setVar", {  // default
            moduleName: "selectEnvironment",
            varName: "environOptions",
            val: options
        });

        let environment = options[0]["value"];  // First one.
        let environFromLocStor = localStorage.getItem("environ");
        if (environFromLocStor !== null) {
            // User previous selected this environment. Use it
            // again by default.
            environment = environFromLocStor;
            // selected = true;
            // oneSelected = true;
        }

        store.commit("setVar", {  // default
            moduleName: "selectEnvironment",
            varName: "environment",
            val: environment
        });
    });
}
