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
        this.peer = new Peer(null, {
            debug: 2,
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
