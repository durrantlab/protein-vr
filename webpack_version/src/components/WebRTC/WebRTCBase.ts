declare var Peer: any;

export class WebRTCBase {
    // Some functions are common to both senders and receivers.
    public peerId: string = null;
    protected peer: any = null;

    constructor() {
        this.createPeerObj();
        this.setupWebRTCCloseFuncs();
    }

    private createPeerObj(): void {
        // Create own peer object with connection to shared PeerJS server
        this.peer = new Peer(null, {
            debug: 2,
        });
    }

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
