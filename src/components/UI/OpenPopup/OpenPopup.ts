declare var jQuery: any;

let bootstrapLoaded = false;

/** @type {Function} */
// let modalFunc: any;

let msgModal: any;
let myTitle: any;
// let myIFrame: any;
// let iFrameContainer: any;
let msgContainer: any;
let footer: any;

/**
 * Opens a modal.
 * @param  {string}  title     The tittle.
 * @param  {string}  val       The URL. A message otherwise.
 * @param  {boolean} isUrl     Whether val is a url.
 * @param  {boolean} closeBtn  Whether to include a close button. Defaults to
 *                             false if isUrl, true otherwise.
 * @returns void
 */
export function openModal(title: string, val: string, isUrl = true, closeBtn?: boolean): void {
    // Load the css if needed.
    if (!bootstrapLoaded) {
        bootstrapLoaded = true;

        // Add the css
        document.head.insertAdjacentHTML( "beforeend", "<link rel=stylesheet href=pages/css/bootstrap.min.css>" );

        // Add the DOM for a modal
        document.body.insertAdjacentHTML("beforeend", `
            <!-- The Modal -->
            <div class="modal fade" id="msgModal" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">

                    <!-- Modal Header -->
                    <div class="modal-header">
                        <h4 class="modal-title">Modal Heading</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>

                    <!-- Modal body -->
                    <div class="modal-body">
                        <!-- TODO: Check if works on both iPhone and Firefox. Used to be overflow-y:auto;overflow-x:hidden; -->
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
        openUrlModalContinue(title, val, isUrl, closeBtn);
    } else {
        openUrlModalContinue(title, val, isUrl, closeBtn);
    }
}

/**
 * A follow-up function for opening the url modal.
 * @param  {string}  title     The title.
 * @param  {string}  val       The URL if isUrl. A message otherwise.
 * @param  {boolean} isUrl     Whether val is a url.
 * @param  {boolean} closeBtn  Whether to include a close button. Defaults to
 *                             false if isUrl, true otherwise.
 * @returns void
 */
function openUrlModalContinue(title: string, val: string, isUrl: boolean, closeBtn: boolean): void {
    if (msgModal === undefined) {
        msgModal = jQuery("#msgModal");
        myTitle = msgModal.find("h4.modal-title");
        // iFrameContainer = msgModal.find("#iframe-container");
        msgContainer = msgModal.find("#msg-container");
        // myIFrame = iFrameContainer.find("iframe");
        footer = msgModal.find("#modal-footer");
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

    msgModal.modal();
}

// For debugging...
// window["openModal"] = openModal;