// Functions that are common to the main classes of Lecturer.ts and
// Student.ts.

import * as OpenPopup from "../UI/OpenPopup/OpenPopup";

declare var Peer: any;

export let DEBUG = false;

export class WebRTCBase {
    // Some functions are common to both senders and receivers.
    public peerId: string = null;
    protected peer: any = null;

    constructor() {
        this.createPeerObj();
        this.setupWebRTCCloseFuncs();
    }

    /**
     * Creates a peer.js object for use in leader mode.
     * @returns void
     */
    private createPeerObj(): void {
        // Create own peer object with connection to shared PeerJS server
        // let idToUse = "pvr" + Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);  // null and it gets picked for you.

        const wrds = ["act", "add", "age", "ago", "aid", "aim", "air", "all",
                    "and", "any", "arm", "art", "ask", "bag", "ban", "bar",
                    "bed", "bet", "big", "bit", "box", "bus", "but", "buy",
                    "can", "cap", "car", "cat", "ceo", "cow", "cry", "cup",
                    "day", "dig", "dna", "rna", "dog", "dry", "due", "ear",
                    "eat", "egg", "end", "era", "etc", "eye", "fan", "far",
                    "fee", "few", "fit", "fix", "fly", "for", "fun", "gap",
                    "get", "guy", "hat", "hey", "hip", "hit", "hot", "how",
                    "ice", "its", "jet", "job", "joy", "key", "kid", "lab",
                    "law", "lay", "let", "lie", "lot", "low", "map", "may",
                    "mix", "net", "new", "nod", "nor", "not", "now", "nut",
                    "odd", "off", "oil", "old", "one", "our", "out", "owe",
                    "own", "pan", "pay", "per", "pet", "pie", "pop", "put",
                    "raw", "red", "rid", "row", "run", "say", "sea", "see",
                    "set", "sit", "six", "ski", "sky", "sue", "sun", "tap",
                    "tax", "ten", "the", "toe", "too", "top", "toy", "try",
                    "two", "use", "via", "war", "way", "wet", "who", "why",
                    "win", "yes", "yet", "you"];
        let idToUse = "pvr" + this.randomNumStr();
        idToUse += wrds[Math.floor(Math.random() * wrds.length)] + this.randomNumStr();
        // idToUse += wrds[Math.floor(Math.random() * wrds.length)] + this.randomNumStr();
        idToUse = idToUse.replace(/\./g, "");

        // Remove some ambiguous ones.
        // for (let c of ["1", "l", "O", "0"]) {
        //     idToUse = idToUse.replace(c, "");
        // }

        this.peer = new Peer(idToUse, {
            "debug": 2,
            "config": {'iceServers': [
                {"urls": 'stun:0.peerjs.com'},
                {"urls": 'stun:stun.l.google.com:19302'},
                {"urls": 'stun:durrantlab.com/apps/proteinvr/stun'}  // not yet implemented
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
            webRTCStandardErrorMsg();
            if (DEBUG === true) { console.log("Connection lost. Please reconnect"); }

            // Workaround for peer.reconnect deleting previous id
            this.peer.id = this.peerId;
            this.peer._lastServerId = this.peerId;
            this.peer.reconnect();
        });

        this.peer.on("error", (err: any) => {
            webRTCErrorMsg(err);
        });
    }

    private randomNumStr(): string {
        return Math.random().toString().replace(/\./g, "").replace(/0/g, "").slice(0, 3);
    }
}

/**
 * Throw a generic error message to let the user know that the connection has
 * failed.
 * @param  {string} details  An additional message to display, beyond the
 *                           default one.
 * @returns void
 */
export function webRTCErrorMsg(details = ""): void {
    let msg = "<p>ProteinVR has encountered an error while running in leader mode. ";
    if (details !== "") {
        msg += " Here are the details:</p>";
        msg += "<p><pre>" + details + "</pre></p>";
    } else {
        msg += "</p>";
    }

    OpenPopup.openModal("Leader Error", msg, false);
}

/**
 * Show the standard "please refresh" error message.
 * @returns void
 */
export function webRTCStandardErrorMsg(): void {
    webRTCErrorMsg("Leader connection destroyed. Please refresh.");
}