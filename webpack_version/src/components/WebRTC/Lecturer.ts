// Functions for follow-the-leader mode, that the leader (lecturer) uses.

import * as CommonCamera from "../Cameras/CommonCamera";
import * as OpenPopup from "../UI/OpenPopup/OpenPopup";
import * as WebRTCBase from "./WebRTCBase";

export let isLecturerBroadcasting: boolean = false;

let lect: any;

export class Lecturer extends WebRTCBase.WebRTCBase {
    public idReady: any = null;
    public gotConn: any = null;
    private conns: any = [];  // The connections (there could be multiple ones
                              // because this is the lecturer).

    constructor() {
        super();
        let gotConnResolve: any;
        this.gotConn = new Promise((resolve: any, reject: any) => {
            gotConnResolve = resolve;
        });
        this.idReady = new Promise((idReadyResolve: any, reject: any) => {
            this.setupWebRTCCallbacks(idReadyResolve, gotConnResolve);
        });
    }

    /**
     * Send data to a remote webrtc partner.
     * @param  {*} data  The data to send.
     * @returns void
     */
    public sendData(data: any): void {
        /** @type {number} */
        let connsLen = this.conns.length;
        for (let i = 0; i < connsLen; i++) {
            let conn = this.conns[i];
            conn.send(data);
        }
    }

    /**
     * Sets up the webrtc callback functions.
     * @param  {Function(string)} idReadyResolve  The function to call when
     *                                            peer.js is open.
     * @param  {Function()}       gotConnResolve  The function to call when
     *                                            the connection is resolved.
     * @returns void
     */
    private setupWebRTCCallbacks(idReadyResolve: any, gotConnResolve: any): void {
        this.peer.on("open", (id: string) => {
            // Workaround for peer.reconnect deleting previous id
            if (this.peer.id === null) {
                WebRTCBase.webRTCErrorMsg("Received null id from peer open.");
                this.peer.id = this.peerId;
            } else {
                this.peerId = this.peer.id;
            }
            idReadyResolve(this.peerId);
            console.log(this.peerId);
        });

        // Below only needed on lecturer. It's when a connection is received.
        this.peer.on("connection", (c: any) => {
            this.conns.push(c);
            gotConnResolve();
            console.log("Lecturer: added a connection");
        });

        this.peer.on("close", () => {
            /** @type {number} */
            let connsLen = this.conns.length;
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

    lect.idReady.then((id: string) => {
        OpenPopup.openModal(
            "Follow the Leader", "pages/follow-the-leader.html?f=" + id, true, true
        );
    });

    // Periodically send the information about the representations.
    setInterval(() => {
        let pos = CommonCamera.getCameraPosition();
        let rotQua = CommonCamera.getCameraRotationQuaternion();

        let rotFac = 1.0;
        let val = [pos.x, pos.y, pos.z, rotFac * rotQua.x, rotFac * rotQua.y, rotFac * rotQua.z, rotFac * rotQua.w];
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
 * @param  {string} axis The axis to rotate about.
 * @returns void
 */
export function sendUpdateMolRotCommand(axis: string): void {
    lect.sendData({
        "type": "molAxisRotation",
        "val": axis
    });
}

export function sendUndoRotCommand(): void {
    lect.sendData({
        "type": "molUndoRot",
        "val": undefined
    });
}

// For debugging...
// window["startBroadcast"] = startBroadcast;
