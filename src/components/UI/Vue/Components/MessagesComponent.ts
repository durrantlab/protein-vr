// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import {VueComponentParent} from "./VueComponentParent";
import * as VueXStore from "../../../Vars/VueX/VueXStore";

// Shows little pop-up messages on load. Not modals.

// @ts-ignore
import {templateHtml} from "./MessagesComponent.template.htm.ts";

let msgHideTimeout;

declare var jQuery;

export class MessagesComponent extends VueComponentParent {
    public tag = "messages";
    public methods = {};

    public computed = {
        /**
         * Get the messages.
         * @returns string[]  The messages.
         */
        "messages"(): string[] {
            return this.$store.state["messages"]["messages"];
        }
    };

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {
            "messages": []
        },
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {};
    }

    mounted() {}
}

/**
 * Adds a message.
 * @param  {string} msg  The new message.
 * @returns void
 */
export function addMessage(msg: string): void {
    let msgs = VueXStore.store.state["messages"]["messages"];
    msgs.push(msg);
    VueXStore.storeOutsideVue.commit("setVar", {
        moduleName: "messages",
        varName: "messages",
        val: msgs
    });

    if (msgHideTimeout === undefined) {
        let startTimerToRemoveMsg = () => {
            msgHideTimeout = setTimeout(() => {
                let msgs = VueXStore.store.state["messages"]["messages"];
                if (msgs.length === 0) {
                    clearTimeout(msgHideTimeout);
                    msgHideTimeout = undefined;
                } else {
                    // Tried do use vue transitions, but too much trouble.
                    let msgDiv = jQuery("#msg-0.msg");
                    msgDiv["slideUp"](500, () => {
                        msgs.shift();
                        VueXStore.storeOutsideVue.commit("setVar", {
                            moduleName: "messages",
                            varName: "messages",
                            val: msgs
                        });

                        // Need to reshow first one (much trial and error to
                        // discover this problem).
                        let msgDiv = jQuery("#msg-0.msg");
                        msgDiv.show();
                        startTimerToRemoveMsg();
                    });
                }
            }, 8000)
        }
        startTimerToRemoveMsg();

        // setTimeout(() => {
        //     jQuery(".msg")["first"]()["slideUp"](1000);
        // }, 1000)
    }

    // setInterval(() => {
    //     console.log(jQuery);
    //     debugger;
    //     window["jQuery"] = jQuery;
    // }, 5000)

    // let msg = jQuery("#msg");
    // msg.fadeIn(500);

    // setTimeout(() => {
    //     msg.fadeOut(500);
    // }, 8000);
}
