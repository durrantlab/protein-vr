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

export function startFollowing(id: string): void {
    targetCameraPosition = new Float32Array(CommonCamera.getCameraPosition().asArray());
    targetCameraRotationQuaternion = new Float32Array(CommonCamera.getCameraRotationQuaternion().asArray());

    let stud = new Student((data: any) => {
        console.log("stud1 got data", data);
        let type = data["type"];
        let val = data["val"];
        switch (type) {
            case "locrot":
                targetCameraPosition = new Float32Array([val[0], val[1], val[2]]);
                targetCameraRotationQuaternion = new Float32Array([val[3], val[4], val[5], val[6]]);

                // CommonCamera.setCameraPosition(
                //     new BABYLON.Vector3(val[0], val[1], val[2]),
                // );
                // CommonCamera.setCameraRotationQuaternion(
                    // new BABYLON.Quaternion(val[3], val[4], val[5], val[6]),
                // );
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
            targetCameraPosition,
            2.0
        );
        let newPosAsVec = BABYLON.Vector3.FromArray(newPos);
        CommonCamera.setCameraPosition(newPosAsVec);

        let cameraRotQuat = new Float32Array(CommonCamera.getCameraRotationQuaternion().asArray());
        let newRot = moveVecTowards(
            cameraRotQuat,
            targetCameraRotationQuaternion,
            0.261799  // 15 degrees
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

function moveVecTowards(curVec: any, targetVec: any, closeVal: number) {
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


function moveVecTowardsOld2(curVec: any, targetVec: any, closeVal: number) {
    let numEntries = curVec.length;

    // A variable taht will contain the new position
    let newPos = new Float32Array(numEntries);

    // Now get the distance between curVec and this newPos.
    let deltaPos = new Float32Array(numEntries);
    for (let i = 0; i < numEntries; i++) { deltaPos[i] = targetVec[i] - curVec[i]; }

    // Get the length of that vector (current to newPos/midpoint).
    let lenVec = 0
    for (let i = 0; i < numEntries; i++) { lenVec += deltaPos[i] * deltaPos[i]; }
    lenVec = Math.sqrt(lenVec);

    // Move faster when far away.
    let animRatio = Vars.scene.getAnimationRatio();
    let speed = animRatio * 0.98;  // Fast
    if (lenVec < closeVal) {
        // Slow when you get faster.
        speed = 0.99;
    }

    // Start by guessing that the new point is half way between here and the
    // target.
    let speed2 = animRatio - speed;
    for (let i = 0; i < numEntries; i++) { newPos[i] = speed * curVec[i] + speed2 * targetVec[i]; }


    // if (lenVec === 0) {
    //     // Already there. So skip.
    //     return curVec;
    // }

    // if (lenVec > closeDist) {
    //     // Too far away... it would be too big a jump. Move towards thew
    //     // target just a bit.
    //     let animRatio = Vars.scene.getAnimationRatio();
    //     for (let i = 0; i < numEntries; i++) {
    //         newPos[i] = curVec[i] + speed * animRatio * deltaPos[i] / lenVec;
    //     }
    // }

    return newPos;
}

function moveVecTowardsOld(curVec: any, targetVec: any, speed: number, closeDist: number) {
    let numEntries = curVec.length;
    let deltaPos = new Float32Array(numEntries);
    for (let i = 0; i < numEntries; i++) {
        deltaPos[i] = targetVec[i] - curVec[i];
    }

    let lenVec = 0
    for (let i = 0; i < numEntries; i++) {
        lenVec += deltaPos[i] * deltaPos[i];
    }
    lenVec = Math.sqrt(lenVec);

    if (lenVec === 0) {
        return curVec;
    }
    if (lenVec < closeDist) {
        // You're so close. Just set it to the final position.
        return targetVec;
    }

    // Move towards thew target just a bit.
    let newPos = new Float32Array(numEntries);
    let animRatio = Vars.scene.getAnimationRatio();
    for (let i = 0; i < numEntries; i++) {
        newPos[i] = curVec[i] + speed * animRatio * deltaPos[i] / lenVec;
    }

    return newPos;
}
