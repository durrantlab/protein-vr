import * as CommonCamera from "../Cameras/CommonCamera";
import * as WebRTCBase from "./WebRTCBase";
import * as Vars from "../Vars";

declare var BABYLON: any;

export class Student extends WebRTCBase.WebRTCBase {
    private dataReceivedFunc: any;
    private conn: any = null;  // The connection (just one).

    constructor(dataReceivedFunc: any) {
        super();
        this.dataReceivedFunc = dataReceivedFunc;
        this.setupWebRTCCallbacks();
    }

    public joinExistingSession(id: string): void {
        // Close old connection
        if (this.conn) {
            this.conn.close();
        }

        // Create connection to destination peer specified in the input field
        this.conn = this.peer.connect(id, {
            reliable: true,
        });

        this.setConnectionCallbacks();

        this.conn.on("open", () => {
            console.log("Connected to: " + this.conn.peer);
        });
    }

    private setupWebRTCCallbacks() {
        this.peer.on("close", () => {
            this.conn = null;
            console.log("Connection destroyed. Please refresh");
        });
    }

    private setConnectionCallbacks(): void {
        // Handle incoming data (messages only since this is the signal
        // sender)
        this.conn.on("data", (data: any) => {
            this.dataReceivedFunc(data);
        });

        this.conn.on("close", () => {
            console.log("Connection closed");
        });
    }
}

let stud;

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

    let stud = new Student((data: any) => {
        // console.log("stud1 got data", data);
        let type = data["type"];
        let val = data["val"];
        switch (type) {
            case "locrot":
                targetCameraPosition = new Float32Array([val[0], val[1], val[2]]);
                targetCameraRotationQuaternion = new Float32Array([val[3], val[4], val[5], val[6]]);
                break;
            default:
                break;
        }
    });
    stud.joinExistingSession(id);

    // Start moving the camera in sync
    Vars.scene.registerBeforeRender(() => {
        let cameraLoc = new Float32Array(CommonCamera.getCameraPosition().asArray());
        let newPos = moveVecTowards(
            cameraLoc,
            targetCameraPosition
        );
        let newPosAsVec = BABYLON.Vector3.FromArray(newPos);
        CommonCamera.setCameraPosition(newPosAsVec);

        let cameraRotQuat = new Float32Array(CommonCamera.getCameraRotationQuaternion().asArray());
        let newRot = moveVecTowards(
            cameraRotQuat,
            targetCameraRotationQuaternion
        )
        let newRotAsVec = BABYLON.Quaternion.FromArray(newRot);
        CommonCamera.setCameraRotationQuaternion(newRotAsVec);

        // CommonCamera.setCameraPosition(
        //     moveVecTowards(
        //         CommonCamera.getCameraPosition(),
        //         targetCameraPosition,
        //         0.05, 0.1
        //     )
        // );
    });
}

/**
 * Moves a vector towards the target vector. Gets applied to both the camera
 * position and rotation.
 * @param  {any} curVec     The current vector.
 * @param  {any} targetVec  The target vector.
 */
function moveVecTowards(curVec: any, targetVec: any) {
    let numEntries = curVec.length;

    // Now get the distance between curVec and this newPos.
    let deltaPos = new Float32Array(numEntries);
    for (let i = 0; i < numEntries; i++) { deltaPos[i] = targetVec[i] - curVec[i]; }

    let fac = 0.02;
    let animRatio = Vars.scene.getAnimationRatio();

    // A variable that will contain the new position
    let newPos = new Float32Array(numEntries);

    // Scale the delta and add it to the curVec. That's the newPos.
    for (let i = 0; i < numEntries; i++) { newPos[i] =  curVec[i] + animRatio * fac * deltaPos[i]; }

    return newPos;
}
