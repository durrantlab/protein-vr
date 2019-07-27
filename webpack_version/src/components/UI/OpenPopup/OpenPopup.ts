declare var jQuery: any;

let botstrapLoaded = false;

/** @type {Function} */
let modalFunc: any;

/**
 * Opens a modal.
 * @param  {string} title  The tittle.
 * @param  {string} url    The URL.
 * @returns void
 */
export function openUrlModal(title: string, url: string): void {
    // Load the css if needed.
    if (!botstrapLoaded) {
        botstrapLoaded = true;

        // Add the css
        document.head.insertAdjacentHTML( "beforeend", "<link rel=stylesheet href=pages/css/bootstrap.min.css>" );

        // Add the DOM for a modal
        document.body.insertAdjacentHTML("beforeend", `
            <!-- The Modal -->
            <div class="modal fade" id="myModal" role="dialog">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">

                    <!-- Modal Header -->
                    <div class="modal-header">
                        <h4 class="modal-title">Modal Heading</h4>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>

                    <!-- Modal body -->
                    <div class="modal-body">
                        <div class="embed-responsive embed-responsive-1by1">
                            <iframe class="embed-responsive-item" src=""></iframe>
                        </div>
                    </div>

                    <!-- Modal footer -->
                    <!-- <div class="modal-footer">
                        <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
                    </div> -->
                </div>
            </div>
        `);

        // Add the javascript
        // jQuery.getScript( "pages/scripts/popper.min.js", ( data, textStatus, jqxhr ) => {
        // jQuery.getScript( "pages/scripts/bootstrap.min.js", (data: any, textStatus: any, jqxhr: any) => {
            // debugger;
            // modalFunc = jQuery.prototype.modal;  // Save for later use.
            openUrlModalContinue(title, url);
        // });
        // });
    } else {
        openUrlModalContinue(title, url);
    }
}

/**
 * A follow-up function for opening the url modal.
 * @param  {string} title  The title.
 * @param  {string} url    The url.
 * @returns void
 */
function openUrlModalContinue(title: string, url: string): void {
    // debugger;
    // jQuery.prototype.modal = modalFunc;
    let myModal = jQuery("#myModal");
    myModal.find("h4.modal-title").html(title);
    myModal.find("iframe").attr("src", url);
    myModal.modal();
}

// window["openUrlModal"] = openUrlModal;
