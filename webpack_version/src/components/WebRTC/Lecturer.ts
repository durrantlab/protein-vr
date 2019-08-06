// Functions for follow-the-leader mode, that the leader (lecturer) uses.

import * as CommonCamera from "../Cameras/CommonCamera";
import * as OpenPopup from "../UI/OpenPopup/OpenPopup";
import * as WebRTCBase from "./WebRTCBase";

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
                console.log("Received null id from peer open");
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
            console.log("Connection destroyed. Please refresh");
        });
    }
}

/**
 * Start broadcasting information like the current camera location and
 * position.
 * @returns void
 */
export function startBroadcast(): void {
    // Contact the peerjs server
    let lect = new Lecturer();

    lect.idReady.then((id: string) => {
        OpenPopup.openUrlModal(
            "Mirroring URL", "pages/follow-the-leader.html?" +
            window.location.href.split("?", 2)[1] + "&webrtc=" + id,
        );
    });

    // Every three seconds send the information about the representations.
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
}

// For debugging...
// window["startBroadcast"] = startBroadcast;
