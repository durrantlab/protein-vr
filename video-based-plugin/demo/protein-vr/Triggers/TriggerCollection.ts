import * as Globals from "../config/Globals";
import * as SphereCollection from "../Spheres/SphereCollection";
import { AudioTrigger } from "./Audio";

var _triggers: any[] = [];

export function create(triggers) {
    for (let i=0; i<triggers.length; i++) {
        let trigger = triggers[i];
        let frameIdx = trigger[0];
        let cmd: string = trigger[1];
        if (cmd.toUpperCase().slice(-4) === ".MP3") {
            _triggers.push(new AudioTrigger(frameIdx, cmd));
        } // HERE DO ONES THAT START WITH HTTP LATER...
    }
}

export function checkAll() {
    // Should run on every sphere change.
    for (let i=0; i<_triggers.length; i++) {
        let trigger = _triggers[i];
        trigger.check(SphereCollection.getIndexOfCurrentSphere());
    }
}