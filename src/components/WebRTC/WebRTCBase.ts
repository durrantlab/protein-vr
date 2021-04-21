// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Functions that are common to the main classes of Lecturer.ts and
// Student.ts.

// import * as OpenPopup from "../UI/Vue/Components/OpenPopup/OpenPopup";
import * as SimpleModalComponent from "../UI/Vue/Components/OpenPopup/SimpleModalComponent";

declare var Peer: any;

export let DEBUG = false;

export class WebRTCBase {
    // Some functions are common to both senders and receivers.
    public peerId: string = null;
    protected peer: any = null;
    public peerOpenPromise: any = undefined;

    constructor(assignedId?: string) {
        this.peerOpenPromise = this.createPeerObj(assignedId);
        this.setupWebRTCCloseFuncs();
    }

    /**
     * Creates a peer.js object for use in leader mode.
     * @param  {string} assignedId  Use this id if specified. Otherwise,
     *                              generate one.
     * @returns Promise<any>        A promise that is resolved when the peer
     *                              is open and has returned an id.
     */
    private createPeerObj(assignedId?: string): Promise<any> {
        // Create own peer object with connection to shared PeerJS server
        // let idToUse = "pvr" + Math.random().toString(36).substring(2, 5) + Math.random().toString(36).substring(2, 5);  // null and it gets picked for you.

        if (assignedId === undefined) {
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
            assignedId = "pvr" + this.randomNumStr();
            assignedId += wrds[Math.floor(Math.random() * wrds.length)] + this.randomNumStr();
            // assignedId += wrds[Math.floor(Math.random() * wrds.length)] + this.randomNumStr();
            assignedId = assignedId.replace(/\./g, "");

            // Remove some ambiguous ones.
            // for (let c of ["1", "l", "O", "0"]) {
            //     assignedId = assignedId.replace(c, "");
            // }
        }

        this.peer = new Peer(assignedId, {
            "debug": 2,
            "config": {
                'iceServers': [
                    {"urls": 'stun:0.peerjs.com'},
                    {"urls": 'stun:stun.l.google.com:19302'},

                    // Note that durrantlab below is not properly formatted
                    // for a stun url. Causes errors if you include it. Not
                    // implemented yet anyway, so commenting out.

                    // {"urls": 'stun:durrantlab.com/apps/protein-vr/stun'}  // not yet implemented
                    // {"url": 'stun:stun1.l.google.com:19302'},
                    // {"url": 'stun:stun2.l.google.com:19302'},
                    // {"url": 'stun:stun3.l.google.com:19302'},
                    // {"url": 'stun:stun4.l.google.com:19302'},
                    // {url: 'turn:homeo@turn.bistri.com:80', credential: 'homeo'}
                ]
            }
        });

        if (DEBUG) {
            console.log("WEBRTC: Created peer object.");
        }

        return new Promise((resolve, reject) => {
            // Wait until you've got an id from the peer object before connecting
            // and doing other things. It's an async function, so tricky.
            this.peer["on"]("open", (id: string) => {
                // Workaround for peer.reconnect deleting previous id
                if (this.peer["id"] === null) {
                    webRTCErrorMsg("Received null id from peer open.");
                    this.peer["id"] = this.peerId;
                } else {
                    this.peerId = this.peer["id"];
                }

                resolve(this.peerId);

                if (DEBUG === true) {
                    console.log("WEBRTC: ", this.peerId);
                }
            });
        });
    }

    /**
     * Sets up the functions that are fired when peer.js disconnects or
     * produces an error.
     * @returns void
     */
    private setupWebRTCCloseFuncs(): void {
        this.peer["on"]("disconnected", () => {
            webRTCStandardErrorMsg();
            if (DEBUG === true) { console.log("WEBRTC: Connection lost. Please reconnect"); }

            // Workaround for peer.reconnect deleting previous id
            this.peer["id"] = this.peerId;
            this.peer["_lastServerId"] = this.peerId;
            this.peer["reconnect"]();
        });

        this.peer["on"]("error", (err: any) => {
            webRTCErrorMsg(err);
        });
    }

    /**
     * Generate a random string.
     * @returns string  The string.
     */
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
    let msg = "<p>ProteinVR has encountered an error while running in leader mode. This feature may be temporarily unavailable. ";
    if (details !== "") {
        msg += " Here are the details:</p>";
        msg += "<p><pre>" + details + "</pre></p>";
    } else {
        msg += "</p>";
    }

    // OpenPopup.openModal({
    //     title: "Leader Error",
    //     content: msg,
    //     // isUrl: false
    // });

    SimpleModalComponent.openSimpleModal({
        title: "Leader Error",
        content: msg,
        hasCloseBtn: true,
        showBackdrop: true,
        unclosable: false
    }, false);
}

/**
 * Show the standard "please refresh" error message.
 * @returns void
 */
export function webRTCStandardErrorMsg(): void {
    webRTCErrorMsg("Leader connection destroyed. Please refresh.");
}
