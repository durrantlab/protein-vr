// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import {VueComponentParent} from "../VueComponentParent";
import {store} from "../../../../Vars/VueX/VueXStore";

// @ts-ignore
import {templateHtml} from "./SimpleModalComponent.template.htm.ts";

export interface ISimpleModal {
    title: string;
    content: string;
    hasCloseBtn?: boolean;
    unclosable?: boolean;
    showBackdrop?: boolean;
    skinny?: boolean;
    btnText?: string;
    // isUrl?: boolean; // TODO: JDD. Delete after confirm work.
    // onCloseCallback?: any;
    // onReadyCallBack?: any
}

export class SimpleModalComponent extends VueComponentParent {
    public tag = "simple-modal";
    public methods = {
        /**
         * Runs once the modal has opened.
         * @returns void
         */
        "onReady"(): void {

        },

        /**
         * Runs once the modal has closed.
         * @returns void
         */
        "onClose"(): void {
            if (this.$store.state["simpleModal"]["onCloseCallback"] !== null) {
                this.$store.state["simpleModal"]["onCloseCallback"]();
            }
        }
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "showModal": false,
            "title": "",
            "hasCloseBtn": true,
            "unclosable": true,
            "showBackdrop": true,
            "skinny": true,
            "btnText": "Close",
            "content": "",
            "onCloseCallback": null
        },
        mutations: {}
    }

    public data =

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    function(): any {
        return {};
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}

/**
 * Set values of open-modal parameters that are not specified elsewhere.
 * @param  {IOpenModal} params  The parameters.
 * @returns IOpenModal  The parameters, with the missing values filled in.
 */
function setMissingToDefaults(params: ISimpleModal): ISimpleModal {
    params.hasCloseBtn = params.hasCloseBtn === undefined ? undefined : params.hasCloseBtn;
    params.unclosable = params.unclosable === undefined ? false : params.unclosable;
    params.showBackdrop = params.showBackdrop === undefined ? true : params.showBackdrop;
    params.skinny = params.skinny === undefined ? false : params.skinny;
    params.btnText = params.btnText === undefined ? "Close" : params.btnText;
    // params.isUrl = params.isUrl === undefined ? true : params.isUrl;  // TODO: JDD. Delete after confirm work.
    // params.onCloseCallback = params.onCloseCallback === undefined ? undefined : params.onCloseCallback;
    // params.onReadyCallBack = params.onReadyCallBack === undefined ? undefined : params.onReadyCallBack;

    return params;
}

/**
 * Opens a simple modal.
 * @param  {*}        params                  The modal parameters. Of type
 *                                            ISimpleModal.
 * @param  {boolean}  [interpretAsUrl=false]  Whether the modal is a url
 *                                            (iframe).
 * @param  {Function} [onCloseCallback=null]  The function to call when this
 *                                            simple modal is closed.
 */
export function openSimpleModal(params: ISimpleModal, interpretAsUrl: boolean = false, onCloseCallback: Function = null) {
    params = setMissingToDefaults(params);

    store.commit("setVar", {
        moduleName: "simpleModal",
        varName: "title",
        val: params.title
    });

    store.commit("setVar", {
        moduleName: "simpleModal",
        varName: "hasCloseBtn",
        val: params.hasCloseBtn
    });

    store.commit("setVar", {
        moduleName: "simpleModal",
        varName: "unclosable",
        val: params.unclosable
    });

    store.commit("setVar", {
        moduleName: "simpleModal",
        varName: "showBackdrop",
        val: params.showBackdrop
    });

    store.commit("setVar", {
        moduleName: "simpleModal",
        varName: "skinny",
        val: params.skinny
    });

    store.commit("setVar", {
        moduleName: "simpleModal",
        varName: "btnText",
        val: params.btnText
    });

    store.commit("setVar", {
        moduleName: "simpleModal",
        varName: "onCloseCallback",
        val: () => {
            store.commit("setVar", {
                moduleName: "simpleModal",
                varName: "showModal",
                val: false
            });

            if (onCloseCallback !== null) {
                onCloseCallback();
            }
        }
    });

    if (interpretAsUrl) {
        store.commit("setVar", {
            moduleName: "simpleModal",
            varName: "content",
            val: "<center>Loading...</center>"
        });

        store.commit("setVar", {
            moduleName: "simpleModal",
            varName: "showModal",
            val: true
        });

        // Load the HTML
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                store.commit("setVar", {
                    moduleName: "simpleModal",
                    varName: "content",
                    val: this.responseText
                });

                setTimeout(() => {
                    // Now that the html is loaded, load the remote js too.
                    const script = document.createElement('script');
                    script.src = params.content.replace(".html", ".html.js");
                    document.head.appendChild(script);
                }, 0)
            }
        };
        xhttp.open("GET", params.content, true);
        xhttp.send();
    } else {
        store.commit("setVar", {
            moduleName: "simpleModal",
            varName: "content",
            val: `<center>${params.content}</center>`
        });
        store.commit("setVar", {
            moduleName: "simpleModal",
            varName: "showModal",
            val: true
        });
    }
}
