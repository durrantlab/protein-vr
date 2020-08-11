// // import FrontButton from "./FrontButton.vue";
// import * as LoadSave from "./LoadSave";
// import * as Menu2D from "../Menu2D";
// import * as OpenPopup from "./OpenPopup";
// import * as Vars from "../../Vars/Vars";
// import * as Lecturer from "../../WebRTC/Lecturer";
// import * as UrlVars from "../../Vars/UrlVars";
import {VueComponentParent} from "../../VueComponentParent";
// import * as OpenPopup from "../../OpenPopup/OpenPopup";

import 'bootstrap';  // Note that this is important.

// @ts-ignore
import templateHtml from "./ModalComponent.template.htm";

export var modalCurrentlyOpen = false;

export class ModalComponent extends VueComponentParent {
    public tag = "modal";
    public methods = {};

    public computed = {
        "skinnyClass"(): string {
            return this["skinny"] ? "skinny-modal" : "";
        },

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
        "open": function(val) {
            if (val === true) {
                // Deal with unclosable modals.
                if (this["unclosable"] === true) {
                    this.modalOptions = {"backdrop": "static", "keyboard": false};
                    this.modalObj.on('shown.bs.modal', (e) => {
                        jQuery(".modal-backdrop.show").css("opacity", 1);
                    });

                    // This is unclosable. So no need to worry about restoring any
                    // previous settings once closed.
                }

                // Deal with the backdrop too, and keep track of opens and closes.
                this.modalObj.on('shown.bs.modal', (e) => {
                    // Need to redefine backdropDOM every time (because it gets
                    // removed, I think).
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
            } else {
                this.modalObj["modal"]("hide");
            }
        }
    };

    public template = templateHtml;

    public vueXStore = {
        state: {
            // "modalTitle": "",
            // "modalContent": "",
            // "modalIsUrl": false,
            // "modalHasCloseBtn": false,
            // "modalIsUnClosable": false,
            // "modalShowBackdrop": false,
            // "modalIsSkinny": false,
            // "modalBtnText": "",
            // "modalOnCloseCallback": undefined,
            // "modalOnReadyCallBack": undefined
        },
        mutations: {
            // "openModal"(state: any, payload: OpenPopup.IOpenModal): void {
            //     state["modalTitle"] = payload.title;
            //     state["modalContent"] = payload.content;
            //     state["modalIsUrl"] = payload.isUrl;
            //     state["modalHasCloseBtn"] = payload.hasCloseBtn;
            //     state["modalIsUnClosable"] = payload.unclosable;
            //     state["modalShowBackdrop"] = payload.showBackdrop;
            //     state["modalIsSkinny"] = payload.skinny;
            //     state["modalBtnText"] = payload.btnText;
            //     state["modalOnCloseCallback"] = payload.onCloseCallback;
            //     state["modalOnReadyCallBack"] = payload.onReadyCallBack;

            //     // jQuery('#msgModal').modal();
            // },
        }
    }

    public data = function(): any {
        return {
            modalOptions: {},
            modalObj: undefined
        };
    }

    public mounted = function(): void {
        this.modalObj = jQuery("#" + this["id"]);

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
            });
        });

        // Keep track of opens and closes.
        this.modalObj.on('hidden.bs.modal', (e) => {
            modalCurrentlyOpen = false;
            this["$emit"]("onClose");
        });
    }
}
