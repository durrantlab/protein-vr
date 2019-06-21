declare var jQuery;

let botstrapLoaded = false;
let modalFunc;

export function openUrlModal(title: string, url: string) {
    // Load the css if needed.
    if (!botstrapLoaded) {
        botstrapLoaded = true;

        // Add the css
        document.head.insertAdjacentHTML( "beforeend", "<link rel=stylesheet href=help/css/bootstrap.min.css>" );

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
        // jQuery.getScript( "help/scripts/popper.min.js", ( data, textStatus, jqxhr ) => {
        jQuery.getScript( "help/scripts/bootstrap.min.js", ( data, textStatus, jqxhr ) => {
            modalFunc = jQuery.prototype.modal;  // Save for later use.
            openUrlModalContinue(title, url);
        });
        // });
    } else {
        openUrlModalContinue(title, url);
    }
}

function openUrlModalContinue(title: string, url: string) {
    jQuery.prototype.modal = modalFunc;
    let myModal = jQuery("#myModal");
    myModal.find("h4.modal-title").html(title);
    myModal.find("iframe").attr("src", url);
    myModal.modal();
}

// window["openUrlModal"] = openUrlModal;
