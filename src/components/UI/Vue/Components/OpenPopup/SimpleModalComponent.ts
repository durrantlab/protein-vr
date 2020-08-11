import {VueComponentParent} from "../../../Vue/VueComponentParent";
import {store} from "../../../Vue/VueX/VueXStore";

// import {getPluginsOfType} from "../../Plugins";
// import * as LoadSavePlugin from "../../../Plugins/LoadSave/Parent";

// @ts-ignore
import templateHtml from "./SimpleModalComponent.template.htm";

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
        "onReady"(): void {

        },
        "onClose"(): void {
            if (this.$store.state["simpleModal"]["onCloseCallback"] !== null) {
                this.$store.state["simpleModal"]["onCloseCallback"]();
            }
        }
    };

    public computed = {};

    public props = {
        // "title": {"default": ""},
        // // "content": {"default": ""},
        // "isUrl": {"default": false},
        // "hasCloseBtn": {"default": false},
        // "unclosable": {"default": false},
        // "showBackdrop": {"default": false},
        // "skinny": {"default": false},
        // "btnText": {"default": ""},
        // "onCloseCallback": {"default": undefined},
        // "onReadyCallBack": {"default": undefined}
    };

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

    public data = function(): any {
        return {};
    }

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
