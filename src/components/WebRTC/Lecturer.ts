// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Functions for leader mode, that the leader (lecturer) uses.

import * as CommonCamera from "../Cameras/CommonCamera";
// import * as OpenPopup from "../UI/Vue/Components/OpenPopup/OpenPopup";
import * as WebRTCBase from "./WebRTCBase";
import * as SimpleModalComponent from "../UI/Vue/Components/OpenPopup/SimpleModalComponent";
import * as LazyLoadJS from "../System/LazyLoadJS";

export let isLecturerBroadcasting = false;

let lect: any;

export class Lecturer extends WebRTCBase.WebRTCBase {
    private conns: any = [];  // The connections (there could be multiple ones
                              // because this is the lecturer).

    constructor() {
        // undefined because you want proteinvr to generate an id.
        super(undefined);

        // Set in the WebRTCBase constructor.
        this.peerOpenPromise.then(() => {
            // So you've got an open peer. Go ahead and setup the connection
            // and close callbacks.
            this.setupWebRTCCallbacks();
        })
    }

    /**
     * Send data to a remote webrtc partner.
     * @param  {*} data  The data to send.
     * @returns void
     */
    public sendData(data: any): void {
        data = JSON.stringify(data);

        if (WebRTCBase.DEBUG === true) {
            console.log("WEBRTC: Send:", data);
        }

        /** @type {number} */
        const connsLen = this.conns.length;
        for (let i = 0; i < connsLen; i++) {
            const conn = this.conns[i];
            conn["send"](data);
        }
    }

    /**
     * Sets up the webrtc callback functions.
     * @returns void
     */
    private setupWebRTCCallbacks(): void {
        // Below only needed on lecturer. It's when a connection is received.
        this.peer["on"]("connection", (c: any) => {
            this.conns.push(c);
            // gotConnResolve();
            if (WebRTCBase.DEBUG === true) {
                console.log(
                    "WEBRTC: Lecturer: added a connection"
                );
            }
        });

        this.peer["on"]("close", () => {
            /** @type {number} */
            const connsLen = this.conns.length;
            for (let i = 0; i < connsLen; i++) {
                this.conns[i] = null;
            }
            WebRTCBase.webRTCStandardErrorMsg();
        });
    }
}

/**
 * Start broadcasting information like the current camera location and
 * position.
 * @returns void
 */
export function startBroadcast(): void {
    isLecturerBroadcasting = true;

    // Contact the peerjs server
    lect = new Lecturer();
    let qrCodeReady = LazyLoadJS.lazyLoadJS("./js/qrcode.min.js");

    Promise.all([lect.peerOpenPromise, qrCodeReady]).then((params: any) => {
        // So window["QRCode"] now available everywhere.

        let id: string = params[0];

        window["PVR_webRTCID"] = id;

        // OpenPopup.openModal({
        //     title: "Leader",
        //     content: "pages/leader.html",
        //     // isUrl: true,
        //     hasCloseBtn: true
        // });

        SimpleModalComponent.openSimpleModal({
            title: "Leader",
            content: "pages/leader.html",
            hasCloseBtn: true,
            showBackdrop: true,
            unclosable: false
        }, true);
    });


    // Periodically send the information about the representations.
    setInterval(() => {
        const pos = CommonCamera.getCameraPosition();
        const rotQua = CommonCamera.getCameraRotationQuaternion();

        const rotFac = 1.0;
        const val = [pos.x, pos.y, pos.z, rotFac * rotQua.x, rotFac * rotQua.y, rotFac * rotQua.z, rotFac * rotQua.w];
        lect.sendData({
            "type": "locrot",
            "val": val,
        });
    }, 100);

    // Periodically send the current url (to sync initial representations with
    // remote).
    setInterval(() => {
        lect.sendData({
            "type": "initialUrl",
            "val": window.location.href
        });
    }, 2000);
}

/**
 * Sends the data to the student so they can run VisStyles.toggleRep in their
 * ProteinVR instance.
 * @param  {Array<*>}            filters        Can include strings (lookup
 *                                              sel in selKeyWordTo3DMolSel).
 *                                              Or a 3DMoljs selection object.
 * @param  {string}              repName        The representative name. Like
 *                                              "Surface".
 * @param  {string}              colorScheme    The name of the color scheme.
 * @param  {Function|undefined}  finalCallback  Callback to run once the mesh
 *                                              is entirely done.
 * @returns void
 */
export function sendToggleRepCommand(filters: any[], repName: string, colorScheme: string): void {
    lect.sendData({
        "type": "toggleRep",
        "val":{
            "filters": filters,
            "repName": repName,
            "colorScheme": colorScheme
        }
    });
}

/**
 * Sends the data to the student so they can run Rotations.axisRotation.
 * @param  {string} axis  The axis to rotate about.
 * @returns void
 */
export function sendUpdateMolRotCommand(axis: string): void {
    lect.sendData({
        "type": "molAxisRotation",
        "val": axis
    });
}
/**
 * Send the data to the student re. undoing any rotations.
 * @returns void
 */
export function sendUndoRotCommand(): void {
    lect.sendData({
        "type": "molUndoRot",
        "val": undefined
    });
}
