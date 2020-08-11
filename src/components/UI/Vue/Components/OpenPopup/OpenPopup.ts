// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.
// import 'bootstrap';
// import * as VueXStore from '../Vue/VueX/VueXStore';

declare var jQuery: any;

let bootstrapLoaded = false;

/** @type {Function} */
// let modalFunc: any;

let msgModal: any;
let myTitle: any;
let modalDialog: any;
let msgContainer: any;
let footer: any;
// export let modalCurrentlyOpen: boolean = false;
let showBackdrop = true;
let resolveFunc;
let skinnyModal = false;

export interface IOpenModal {
    title: string;
    content: string;
    // isUrl?: boolean; // TODO: JDD. Delete after confirm work.
    hasCloseBtn?: boolean;
    unclosable?: boolean;
    showBackdrop?: boolean;
    skinny?: boolean;
    btnText?: string;
    onCloseCallback?: any;
    onReadyCallBack?: any
}

// /**
//  * Set values of open-modal parameters that are not specified elsewhere.
//  * @param  {IOpenModal} params  The parameters.
//  * @returns IOpenModal  The parameters, with the missing values filled in.
//  */
// function setMissingToDefaults(params: IOpenModal): IOpenModal {
//     // params.isUrl = params.isUrl === undefined ? true : params.isUrl;  // TODO: JDD. Delete after confirm work.
//     params.hasCloseBtn = params.hasCloseBtn === undefined ? undefined : params.hasCloseBtn;
//     params.unclosable = params.unclosable === undefined ? false : params.unclosable;
//     params.showBackdrop = params.showBackdrop === undefined ? true : params.showBackdrop;
//     params.skinny = params.skinny === undefined ? false : params.skinny;
//     params.onCloseCallback = params.onCloseCallback === undefined ? undefined : params.onCloseCallback;
//     params.onReadyCallBack = params.onReadyCallBack === undefined ? undefined : params.onReadyCallBack;
//     params.btnText = params.btnText === undefined ? "Close" : params.btnText;

//     return params;
// }

/**
 * Opens the modal.
 * @param  {IOpenModal} params  The parameters required to open this modal.
 * @returns Promise  A promise that is fulfilled when done.
 */
export function openModal(params: IOpenModal): Promise<any> {
    // params = setMissingToDefaults(params);

    showBackdrop = params.showBackdrop;
    skinnyModal = params.skinny;

    // Load the css if needed.
    return new Promise((resolve, reject) => {
        resolveFunc = resolve;

        // VueXStore.store.commit("openModal", params);

        resolveFunc();

        // Below is old code.
        return;

        if (!bootstrapLoaded) {
            bootstrapLoaded = true;

            // Add the css. Now in index.html. It's better here than in html
            // header.
            // document.head.insertAdjacentHTML("beforeend", "<link rel=stylesheet href=pages/css/bootstrap.min.css>");

            // Add the DOM for a modal
            document.body.insertAdjacentHTML("beforeend", `
                <!-- The Modal -->
                <div class="modal fade" id="msgModal" role="dialog">
                    <div class="modal-dialog" role="document">
                        <div class="modal-content">

                        <!-- Modal Header -->
                        <div class="modal-header">
                            <h4 class="modal-title">Modal Heading</h4>
                            <button id="modal-close-button" type="button" class="close" data-dismiss="modal">&times;</button>
                        </div>

                        <!-- Modal body -->
                        <div class="modal-body">
                            <!-- <div id="iframe-container" style="height:350px;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch">
                                <iframe frameBorder="0" src="" style="width:100%;height:100%;"></iframe>
                            </div> -->
                            <span id="msg-container"></span>
                        </div>

                        <!-- Modal footer -->
                        ${
                            (params.btnText !== "") ? `
                            <div id="modal-footer" class="modal-footer">
                                <button type="button" class="btn btn-primary modal-close-btn" data-dismiss="modal">${params.btnText}</button>
                            </div>`
                            : ''
                        }
                    </div>
                </div>
                <!-- <link rel="stylesheet" type="text/css" href="pages/css/style.css"> -->
            `);

            // Note re. traditional bootstrap iframe. I'm using a different format
            // to make sure iphone compatible.
            // <!-- <div id="iframe-container" class="embed-responsive embed-responsive-1by1">
            //     <iframe class="embed-responsive-item" src=""></iframe>
            // </div> -->

            // Add the javascript
            openUrlModalContinue(params);
        } else {
            openUrlModalContinue(params);
        }
    });
}

/**
 * A follow-up function for opening the url modal.
 * @param  {IOpenModal} params  The parameters required to open this modal.
 * @returns void
 */
function openUrlModalContinue(params: IOpenModal): void {
    if (msgModal === undefined) {
        // This is run the first time. Like an init.
        msgModal = jQuery("#msgModal");
        modalDialog = msgModal.find(".modal-dialog");
        myTitle = msgModal.find("h4.modal-title");
        // iFrameContainer = msgModal.find("#iframe-container");
        msgContainer = msgModal.find("#msg-container");
        // myIFrame = iFrameContainer.find("iframe");
        footer = msgModal.find("#modal-footer");

        // First time, so also set up callbacks
        // msgModal.on('hidden.bs.modal', function (e) {
        //     modalCurrentlyOpen = false;
        // });

        // // Make it draggable without jquery-ui. Inspired by
        // // https://stackoverflow.com/questions/12571922/make-bootstrap-twitter-dialog-modal-draggable
        // jQuery(".modal-header").on("mousedown", function(e) {
        //     var draggable = jQuery(this);
        //     var x = e.pageX - draggable.offset().left,
        //         y = e.pageY - draggable.offset().top;
        //         jQuery("body").on("mousemove.draggable", function(e) {
        //         draggable.closest(".modal-dialog").offset({
        //             "left": e.pageX - x,
        //             "top": e.pageY - y
        //         });
        //     });
        //     jQuery("body").one("mouseup", function() {
        //         jQuery("body").off("mousemove.draggable");
        //     });
        //     draggable.closest(".modal").one("bs.modal.hide", function() {
        //         jQuery("body").off("mousemove.draggable");
        //     });
        // });

        // msgModal.on('shown.bs.modal', () => {
        //     modalCurrentlyOpen = true;
        //     resolveFunc();  // TODO: This not implemented.
        // });
    }

    // Immediately hide.
    // iFrameContainer.hide();

    // Clear it.
    msgContainer.html("");

    // myTitle.html(params.title);

    // if (params.isUrl === true) {
        // msgContainer.hide();
        // myIFrame.attr("src", val);
        // if (params.hasCloseBtn === undefined) {
        //     footer.hide();
        // }

        // msgContainer.css("text-align", "initial");

        // // Load the HTML
        // const xhttp = new XMLHttpRequest();
        // xhttp.onreadystatechange = function() {
        //     if (this.readyState === 4 && this.status === 200) {
        //         msgContainer.html(this.responseText);

        //         setTimeout(() => {
        //             // Now that the html is loaded, load the remote js too.
        //             const script = document.createElement('script');
        //             // script.onload = () => {
        //             //     // do stuff with the script
        //             // };
        //             script.src = params.content.replace(".html", ".html.js");

        //             document.head.appendChild(script);
        //         }, 0)
        //     }
        // };
        // xhttp.open("GET", params.content, true);
        // xhttp.send();

        // jQuery.get(val, (html: string) => {
        //     msgContainer.html(html);
        // });

        // Only show once loaded.
        // myIFrame.on("load", () => {
        //     iFrameContainer.show();
        // });
    // } else {
        // msgContainer.show();
        // iFrameContainer.hide();

        // On some rare occasions, a previous iframe may take too long to
        // load, so the iFramEContainer.show() can open after this hide. Put
        // in a timeout to fix this. It's hashish, but works. Slideup just to
        // make it look a little better (less like the bug that it is!).
        // setTimeout(() => {
        //     if (msgContainer.css("display") === "inline") {
        //         iFrameContainer.slideUp();
        //     }
        // }, 1000);

        // msgContainer.css("text-align", "center");
        // msgContainer.css("text-align", "initial");

        // msgContainer.html(params.content);
        // if (params.hasCloseBtn === undefined) {
        //     footer.show();
        // }
    // }

    // if (params.hasCloseBtn === true) {
    //     footer.show();
    // } else if (params.hasCloseBtn === false) {
    //     footer.hide();
    // }

    // let options = {};
    // if (params.unclosable === true) {
    //     jQuery("#modal-close-button").hide();
    //     msgModal.on('shown.bs.modal', function (e) {
    //         jQuery(".modal-backdrop.show").css("opacity", 1);
    //     });

    //     options = {"backdrop": "static", "keyboard": false};

    //     // This is unclosable. So no need to worry about restoring any
    //     // previous settings once closed.
    // }

    // msgModal.modal(options);

    // If a callback function is specified, attach that to the button. Note
    // that you should only use callback function if isUrl == false;
    // if (params.onCloseCallback !== undefined) {
    //     let modalCloseBtn = jQuery(".modal-close-btn");
    //     modalCloseBtn.unbind("click");
    //     modalCloseBtn.click(() => {
    //         params.onCloseCallback();
    //     });
    // }

    // Need to redefine backdropDOM every time (because it gets removed, I
    // think).
    // let backdropDOM = jQuery(".modal-backdrop");

    // if (showBackdrop === true) {
    //     backdropDOM.css("background-color", "rgb(0,0,0)");
    // } else {
    //     backdropDOM.css("background-color", "transparent");
    // }

    // // Also make modal skinny if necessary.
    // if (skinnyModal === true) {
    //     modalDialog.addClass("skinny-modal");
    // } else {
    //     modalDialog.removeClass("skinny-modal");
    // }

    // If a onReadyCallBack is specified...
    // if (params.onReadyCallBack !== undefined) {
    //     msgModal.on('shown.bs.modal', function (e) {
    //         params.onReadyCallBack();
    //     });
    // }
}
