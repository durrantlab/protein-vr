// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import {VueComponentParent} from "../VueComponentParent";
import 'bootstrap';  // Note that this is important.

// @ts-ignore
import {templateHtml} from "./ModalComponent.template.htm.ts";
import { canvas, engine } from "../../../../Vars/Vars";

export var modalCurrentlyOpen = false;

// Keep track of all modals so you can close them all when a new one is opened.
let allModals = [];

export class ModalComponent extends VueComponentParent {
    public tag = "modal";
    public methods = {};

    public computed = {
        /**
         * Determines whether modal should be skinny.
         * @returns string  The appropriate class.
         */
        "skinnyClass"(): string {
            return this["skinny"] ? "skinny-modal" : "";
        },

        /**
         * Determines whether to stylize the modal per isUrl.
         * @returns string  The appropriate css style.
         */
        "msgContainerStyles"(): string {
            return this["isUrl"] ? "" : "text-align: initial;";
        }
    };

    public props = {
        "id": {"required": true},  // : {"default": "msgModal"},
        "title": {"required": true},  // : {"default": ""},
        // "isUrl": {"required": true},  // : {"default": false},
        "hasCloseBtn": {"required": true},  // : {"default": false},
        "unclosable": {"required": true},  // : {"default": false},
        "showBackdrop": {"required": true, "default": true},  // : {"default": false},
        "skinny": {"required": true},  // : {"default": false},
        "btnText": {"required": true},  // : {"default": ""},
        "open": {"required": true, "default": false}

        // Note that below no longer implemented. onClose and onReady are emitted instead.
        // "onCloseCallback": {"required": true},  // : {"default": undefined},
        // "onReadyCallBack": {"required": true},  // : {"default": undefined}
    };

    public watch = {
        /**
         * Whether to open or close the modal.
         * @param  {boolean} val  true to open, false to close.
         */
        "open": function(val: boolean) {
            if (val === true) {
                // Always close all modals before opening a new one.
                closeAllModals().then(() => {
                    // Make sure no older backdrops present.
                    jQuery(".modal-backdrop").hide();

                    // Deal with unclosable modals.
                    if (this["unclosable"] === true) {
                        this.modalOptions = {"backdrop": "static", "keyboard": false};
                        this.modalObj.on('shown.bs.modal', (e) => {
                            jQuery(".modal-backdrop.show").css("opacity", 1);
                        });

                        // This is unclosable. So no need to worry about
                        // restoring any previous settings once closed.
                    }

                    // Deal with the backdrop too, and keep track of opens and
                    // closes.
                    this.modalObj.on('shown.bs.modal', (e) => {
                        // Need to redefine backdropDOM every time (because it
                        // gets removed, I think).
                        let backdropDOM = jQuery(".modal-backdrop");
                        if (this["showBackdrop"] === true) {
                            backdropDOM.css("background-color", "rgb(0,0,0)");
                        } else {
                            backdropDOM.css("background-color", "transparent");
                        }

                        // Also trigger onReady.
                        this["$emit"]("onReady");

                        modalCurrentlyOpen = true;
                    });

                    this.modalObj["modal"](this.modalOptions);
                });
            } else {
                this.modalObj["modal"]("hide");
            }
        }
    };

    public template = templateHtml;

    public vueXStore = {
        state: {},
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            modalOptions: {},
            modalObj: undefined
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {
        this.modalObj = jQuery("#" + this["id"]);

        // Keep track so you can close them all en masse in the future.
        allModals.push(this.modalObj);

        // Make it draggable without jquery-ui. Inspired by
        // https://stackoverflow.com/questions/12571922/make-bootstrap-twitter-dialog-modal-draggable
        this.modalObj.find(".modal-header").on("mousedown", function(e) {
            var draggable = jQuery(this);
            var x = e.pageX - draggable.offset().left,
                y = e.pageY - draggable.offset().top;
                jQuery("body").on("mousemove.draggable", function(e) {
                draggable.closest(".modal-dialog").offset({
                    "left": e.pageX - x,
                    "top": e.pageY - y
                });
            });
            jQuery("body").one("mouseup", function() {
                jQuery("body").off("mousemove.draggable");
            });
            draggable.closest(".modal").one("bs.modal.hide", function() {
                jQuery("body").off("mousemove.draggable");

                // Every once in a while, on iOS, the backdrop doesn't end up
                // removed, and you can't click on the buttons. Just to be on
                // the safe side, manually remove it after a bit.
                setTimeout(() => {
                    jQuery(".modal-backdrop").hide();
                }, 100);
            });
        });

        // Keep track of opens and closes.
        this.modalObj.on('hidden.bs.modal', (e) => {
            modalCurrentlyOpen = false;
    
            // Use ref to engine to get canvas' Tab Index and set it
            canvas.tabIndex = engine.canvasTabIndex;  
            canvas.focus();
            
            this["$emit"]("onClose");
        });
    }
}

/**
 * Close all the modals. This runs before opening any modal, so there can only
 * be one modal open at a time.
 * @returns Promise  A promise that is fulfilled when they are all closed.
 */
export function closeAllModals(): Promise<any> {
    const allModalsLen = allModals.length;
    let promises = [];
    for (let i = 0; i < allModalsLen; i++) {
        const modal = allModals[i];
        promises.push(
            new Promise((resolve, reject) => {
                modal["modal"]("hide");

                // A little hackish, but I don't want ot add another
                // 'hidden.bs.modal' listener.
                setTimeout(() => {
                    resolve(undefined);
                }, 250);
            })
        );
    }

    return Promise.all(promises);
}

/**
 * Determines whether any modal is currently open.
 * @returns boolean  true if one is open, false otherwise.
 */
export function anyModalOpen(): boolean {
    return allModals.map(m => m.hasClass("show")).reduce((a, b) => a || b);
}
