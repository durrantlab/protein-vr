// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

declare var jQuery: any;

let bootstrapLoaded = false;

/** @type {Function} */
// let modalFunc: any;

let msgModal: any;
let myTitle: any;
let backdropDOM: any;
// let myIFrame: any;
// let iFrameContainer: any;
let msgContainer: any;
let footer: any;
export let modalCurrentlyOpen: boolean = false;

/**
 * Opens a modal.
 * @param  {string}  title       The tittle.
 * @param  {string}  val         The URL. A message otherwise.
 * @param  {boolean} isUrl       Whether val is a url.
 * @param  {boolean} closeBtn    Whether to include a close button. Defaults
 *                               to false if isUrl, true otherwise.
 * @param  {boolean} unClosable  If true, modal cannot be closed. Effectively
 *                               ends the program.
 * @param  {boolean} backdrop    Whether to show the backdrop. Defaults to
 *                               true.
 * @returns A promise that is fulfilled when the modal is shown.
 */
export function openModal(title: string, val: string, isUrl = true, closeBtn?: boolean, unClosable = false, backdrop = true): Promise<any> {
    // Load the css if needed.
    return new Promise((resolve, reject) => {
        if (!bootstrapLoaded) {
            bootstrapLoaded = true;

            // Add the css. Now in index.html. It's better here than in html
            // header.
            document.head.insertAdjacentHTML("beforeend", "<link rel=stylesheet href=pages/css/bootstrap.min.css>" );

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
                        <div id="modal-footer" class="modal-footer">
                            <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
                <link rel="stylesheet" type="text/css" href="pages/css/style.css">
            `);

            // Note re. traditional bootstrap iframe. I'm using a different format
            // to make sure iphone compatible.
            // <!-- <div id="iframe-container" class="embed-responsive embed-responsive-1by1">
            //     <iframe class="embed-responsive-item" src=""></iframe>
            // </div> -->

            // Add the javascript
            openUrlModalContinue(title, val, isUrl, closeBtn, unClosable, backdrop, resolve);
        } else {
            openUrlModalContinue(title, val, isUrl, closeBtn, unClosable, backdrop, resolve);
        }
    });
}

/**
 * A follow-up function for opening the url modal.
 * @param  {string}   title       The title.
 * @param  {string}   val         The URL if isUrl. A message otherwise.
 * @param  {boolean}  isUrl       Whether val is a url.
 * @param  {boolean}  closeBtn    Whether to include a close button. Defaults
 *                                to false if isUrl, true otherwise.
 * @param  {boolean}  unClosable  If true, modal cannot be closed. Effectively
 *                                ends the program.
 * @param  {boolean}  backdrop    Whether to show the backdrop.
 * @param  {Function} resolveFunc A function that is called when the modal is shown.
 * @returns void
 */
function openUrlModalContinue(title: string, val: string, isUrl: boolean, closeBtn: boolean, unClosable: boolean, backdrop: boolean, resolveFunc: Function): void {
    if (msgModal === undefined) {
        msgModal = jQuery("#msgModal");
        myTitle = msgModal.find("h4.modal-title");
        // iFrameContainer = msgModal.find("#iframe-container");
        msgContainer = msgModal.find("#msg-container");
        // myIFrame = iFrameContainer.find("iframe");
        footer = msgModal.find("#modal-footer");

        // First time, so also set up callbacks
        msgModal.on('hidden.bs.modal', function (e) {
            modalCurrentlyOpen = false;
        });

        // Make it draggable without jquery-ui. Inspired by
        // https://stackoverflow.com/questions/12571922/make-bootstrap-twitter-dialog-modal-draggable
        jQuery(".modal-header").on("mousedown", function(e) {
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
    }

    // Immediately hide.
    // iFrameContainer.hide();

    // Clear it.
    msgContainer.html("");

    myTitle.html(title);

    if (isUrl === true) {
        // msgContainer.hide();
        // myIFrame.attr("src", val);
        if (closeBtn === undefined) {
            footer.hide();
        }

        msgContainer.css("text-align", "initial");

        // Load the HTML
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                msgContainer.html(this.responseText);

                setTimeout(() => {
                    // Now that the html is loaded, load the remote js too.
                    const script = document.createElement('script');
                    // script.onload = () => {
                    //     //do stuff with the script
                    // };
                    script.src = val.replace(".html", ".html.js");

                    document.head.appendChild(script);
                }, 0)
            }
        };
        xhttp.open("GET", val, true);
        xhttp.send();

        // jQuery.get(val, (html: string) => {
        //     msgContainer.html(html);
        // });

        // Only show once loaded.
        // myIFrame.on("load", () => {
        //     iFrameContainer.show();
        // });
    } else {
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

        msgContainer.css("text-align", "center");
        msgContainer.html(val);
        if (closeBtn === undefined) {
            footer.show();
        }
    }

    if (closeBtn === true) {
        footer.show();
    } else if (closeBtn === false) {
        footer.hide();
    }

    msgModal.unbind('shown.bs.modal');

    let options = {};
    if (unClosable === true) {
        jQuery("#modal-close-button").hide();
        msgModal.on('shown.bs.modal', function (e) {
            jQuery(".modal-backdrop.show").css("opacity", 1);
        });

        options = {"backdrop": "static", "keyboard": false}
    }

    msgModal.on('shown.bs.modal', () => {
        modalCurrentlyOpen = true;
        if (backdropDOM === undefined) {
            backdropDOM = jQuery(".modal-backdrop");
        }

        if (backdrop === true) {
            backdropDOM.css("background-color", "rgb(0,0,0)");
        } else {
            backdropDOM.css("background-color", "transparent");
        }

        resolveFunc();
    });

    // jQshow.bs.modal

    // background-color: transparent;
    msgModal.modal(options);
}

// For debugging...
// window["openModal"] = openModal;
