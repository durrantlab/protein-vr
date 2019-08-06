import * as CommonCamera from "../Cameras/CommonCamera";
import * as OpenPopup from "../UI/OpenPopup/OpenPopup";
import * as WebRTCBase from "./WebRTCBase";
import * as Vars from "../Vars";
import * as Navigation from "../Navigation/Navigation";

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

    public sendData(data: any): void {
        /** @type {number} */
        let connsLen = this.conns.length;
        for (let i = 0; i < connsLen; i++) {
            let conn = this.conns[i];
            conn.send(data);
            // console.log(data + " sent");
        }
    }

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
        // if (Vars.vrVars.navMode === Navigation.NavMode.VRWithControllers) {
            // Strangely, activeCamera.leftCamera.rotationQuaternion faces the
            // opposite direction of activeCamera.rotationQuaternion, if VR
            // camera.
            // rotFac = -1.0;
        // }
        // console.log("Actually, up and down work. I think it's just rotation around up axis.");

        let val = [pos.x, pos.y, pos.z, rotFac * rotQua.x, rotFac * rotQua.y, rotFac * rotQua.z, rotFac * rotQua.w];
        lect.sendData({
            "type": "locrot",
            "val": val,
        });
    }, 100);
}

// window["startBroadcast"] = startBroadcast;

export function tmp() {
    console.log("moo. Why is this here?");
}
