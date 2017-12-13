define(["require", "exports", "../Spheres/SphereCollection", "./Audio"], function (require, exports, SphereCollection, Audio_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var _triggers = [];
    function create(triggers) {
        for (let i = 0; i < triggers.length; i++) {
            let trigger = triggers[i];
            let frameIdx = trigger[0];
            let cmd = trigger[1];
            if (cmd.toUpperCase().slice(-4) === ".MP3") {
                _triggers.push(new Audio_1.AudioTrigger(frameIdx, cmd));
            } // HERE DO ONES THAT START WITH HTTP LATER...
        }
    }
    exports.create = create;
    function checkAll() {
        // Should run on every sphere change.
        for (let i = 0; i < _triggers.length; i++) {
            let trigger = _triggers[i];
            trigger.check(SphereCollection.getIndexOfCurrentSphere());
        }
    }
    exports.checkAll = checkAll;
});
