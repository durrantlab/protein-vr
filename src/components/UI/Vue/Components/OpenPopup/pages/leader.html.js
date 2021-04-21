// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


(function(context) {
    // Get the URL for following.
    let url = window.location.href.split("?")[0] + "?f=" + window["PVR_webRTCID"];
    delete window["PVR_webRTCID"];

    // Display the URL.
    var leaderURLVal = document.getElementById("leaderURL");
    leaderURLVal.value = url;
    leaderURLVal.focus();
    setTimeout(() => {
        leaderURLVal.select();
    }, 0);

    // Also update the QR code.
    window["QRCode"]["toDataURL"](url, function (err, url) {
        var leaderURLImg = document.getElementById("leaderURLQRCode");
        leaderURLImg.src = url;
    });

})(this);
