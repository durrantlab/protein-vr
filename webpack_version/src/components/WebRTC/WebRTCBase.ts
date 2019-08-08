// Functions that are common to the main classes of Lecturer.ts and
// Student.ts.

declare var Peer: any;

export class WebRTCBase {
    // Some functions are common to both senders and receivers.
    public peerId: string = null;
    protected peer: any = null;

    constructor() {
        this.createPeerObj();
        this.setupWebRTCCloseFuncs();
    }

    /**
     * Creates a peer.js object for use in follow-the-leader mode.
     * @returns void
     */
    private createPeerObj(): void {
        // Create own peer object with connection to shared PeerJS server
        let idToUse = "pvr" + Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);  // null and it gets picked for you.

        // Remove some ambiguous ones.
        for (let c of ["1", "l", "O", "0"]) {
            idToUse = idToUse.replace(c, "");
        }

        this.peer = new Peer(idToUse, {
            "debug": 2,
            "config": {'iceServers': [
                {"url": 'stun:0.peerjs.com'},
                {"url": 'stun:stun.l.google.com:19302'},
                // {"url": 'stun:stun1.l.google.com:19302'},
                // {"url": 'stun:stun2.l.google.com:19302'},
                // {"url": 'stun:stun3.l.google.com:19302'},
                // {"url": 'stun:stun4.l.google.com:19302'},
                // {url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo'}
            ]}
        });
    }

    /**
     * Sets up the functions that are fired when peer.js disconnects or
     * produces an error.
     * @returns void
     */
    private setupWebRTCCloseFuncs(): void {
        this.peer.on("disconnected", () => {
            console.log("Connection lost. Please reconnect");

            // Workaround for peer.reconnect deleting previous id
            this.peer.id = this.peerId;
            this.peer._lastServerId = this.peerId;
            this.peer.reconnect();
        });

        this.peer.on("error", (err: any) => {
            console.log(err);
        });
    }
}
