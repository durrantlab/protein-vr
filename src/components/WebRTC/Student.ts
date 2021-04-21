// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

// Functions for leader mode, that the follower (student) uses.

import * as CommonCamera from "../Cameras/CommonCamera";
import * as WebRTCBase from "./WebRTCBase";
import * as Vars from "../Vars/Vars";
import * as VisStyles from "../Mols/3DMol/VisStyles";
import * as Rotations from "../UI/Menus/Menu3D/Rotations";

declare var BABYLON: any;

let peerId: string;

export class Student extends WebRTCBase.WebRTCBase {
    private dataReceivedFunc: any;
    private conn: any = null;  // The connection (just one).

    /**
     * @param  {string} id                The existing id that the Lecturer is
     *                                    using.
     * @param  {any}    dataReceivedFunc  The function to run when new data is
     *                                    received.
     */
    constructor(dataReceivedFunc: any) {
        // super creates a peer object and disconnected/error callbacks.
        super(null);  // null because no assign id.
        this.dataReceivedFunc = dataReceivedFunc;
        this.setupWebRTCCallbacks();
    }

    /**
     * Joins an existing webrtc connection.
     * @param  {string} id  The peer.js id.
     * @returns void
     */
    public joinExistingSession(id: string): void {
        this.peerOpenPromise.then(() => {
            // Only proceed if the peer is ready and open.

            // Close old connection
            if (this.conn) {
                this.conn["close"]();
            }

            // Create connection to destination peer specified in the input field
            this.conn = this.peer["connect"](id, {
                "reliable": true,
            });

            this.conn["on"]("open", () => {
                if (WebRTCBase.DEBUG === true) {
                    console.log("WEBRTC: Connected to: " + this.conn["peer"]);
                }
                this.setConnectionCallbacks();
            });

            // Save peerid
            peerId = id;
        })
    }

    /**
     * Setup the webrtc callbacks.
     * @returns void
     */
    private setupWebRTCCallbacks(): void {
        this.peerOpenPromise.then(() => {
            this.peer["on"]("close", () => {
                this.conn = null;
                WebRTCBase.webRTCStandardErrorMsg();
            });
        });
    }

    /**
     * Setup the callbacks for when data is received or the connection is
     * closed.
     * @returns void
     */
    private setConnectionCallbacks(): void {
        // Handle incoming data (messages only since this is the signal
        // sender)
        this.conn["on"]("data", (data: any) => {
            if (WebRTCBase.DEBUG === true) {
                console.log("WEBRTC: Received:", data);
            }
            data = JSON.parse(data);
            this.dataReceivedFunc(data);
        });

        this.conn["on"]("close", () => {
            WebRTCBase.webRTCErrorMsg("Leader connection closed.");
        });
    }
}

let targetCameraPosition: any = null;
let targetCameraRotationQuaternion: any = null;

/**
 * Start following the leader. Receives information from remote user re.
 * camera position and rotation, and mirrors that on the present camera.
 * @param  {string} id  The remote webrtc id.
 * @returns void
 */
export function startFollowing(id: string): void {
    targetCameraPosition = new Float32Array(CommonCamera.getCameraPosition().asArray());
    targetCameraRotationQuaternion = new Float32Array(CommonCamera.getCameraRotationQuaternion().asArray());

    const stud = new Student((data: any) => {
        if (WebRTCBase.DEBUG === true) { console.log("WEBRTC: stud1 got data", data); }
        const type = data["type"];
        const val = data["val"];
        switch (type) {
            case "locrot":
                targetCameraPosition = new Float32Array([val[0], val[1], val[2]]);
                targetCameraRotationQuaternion = new Float32Array([val[3], val[4], val[5], val[6]]);
                break;
            case "initialUrl":
                // If "nanokid.sdf" in url, you need to redirect...
                if (window.location.href.indexOf("nanokid.sdf") !== -1) {
                    // Need to redirect.
                    let newUrl = val + "&f=" + peerId;

                    // Followers should never have shadows, because you never
                    // know what device your students will be viewing on.
                    newUrl = newUrl.replace(/sh=true/g, "sh=false");

                    top.location.href = newUrl;
                }
                break;
            case "toggleRep":
                VisStyles.toggleRep(
                    val["filters"],
                    val["repName"],
                    val["colorScheme"],
                    undefined
                );
                break;
            case "molAxisRotation":
                Rotations.axisRotation(val);
                break;
            case "molUndoRot":
                Rotations.undoRotate();
                break;
            default:
                break;
        }
    });

    stud.joinExistingSession(id);

    // Start moving the camera in sync
    Vars.scene.registerBeforeRender(() => {
        const cameraLoc = new Float32Array(CommonCamera.getCameraPosition().asArray());
        const newPos = moveVecTowards(
            cameraLoc,
            targetCameraPosition
        );
        const newPosAsVec = BABYLON.Vector3.FromArray(newPos);
        CommonCamera.setCameraPosition(newPosAsVec);

        const cameraRotQuat = new Float32Array(CommonCamera.getCameraRotationQuaternion().asArray());
        const newRot = moveVecTowards(
            cameraRotQuat,
            targetCameraRotationQuaternion
        );
        const newRotAsVec = BABYLON.Quaternion.FromArray(newRot);
        CommonCamera.setCameraRotationQuaternion(newRotAsVec);
    });
}

/**
 * Moves a vector towards the target vector. Gets applied to both the camera
 * position and rotation.
 * @param  {any} curVec     The current vector.
 * @param  {any} targetVec  The target vector.
 */
function moveVecTowards(curVec: any, targetVec: any) {
    const numEntries = curVec.length;

    // Distance between curVec and newPos.
    const deltaPos = new Float32Array(numEntries);
    for (let i = 0; i < numEntries; i++) { deltaPos[i] = targetVec[i] - curVec[i]; }

    const fac = 0.02;
    const animRatio = Vars.scene.getAnimationRatio();

    // New position
    const newPos = new Float32Array(numEntries);

    // Scale the delta, add to curVec.
    for (let i = 0; i < numEntries; i++) { newPos[i] =  curVec[i] + animRatio * fac * deltaPos[i]; }

    return newPos;
}
