import * as UserVars from "../Settings/UserVars";

// Note that babylonjs will likely have functions like this built in in the
// future. This is a temporary fix.

declare var PVRGlobals;
declare var BABYLON;

export function addAnimations() {
    // Load in information re. the scene
    let jQuery = PVRGlobals.jQuery;

    // Check to make sure animations are enabled.
    if (UserVars.getParam("animations") !== UserVars.animations["Moving"]) {
        return;
    }

    jQuery.ajax({
        url: UserVars.getParam("scenePath") + "morph_data.json",
        dataType: "json"
    }).done(function(morphData) {
        for (var meshName in morphData) {
            if (morphData.hasOwnProperty(meshName)) {
                // Get all the targets of this morph manager
                let targets = morphData[meshName];

                // Get the mesh itself that will be morphing.
                let m = PVRGlobals.meshesByName[meshName];

                // You need to redo its geometry to make it updatable.
                // See http://www.html5gamedevs.com/topic/28457-solved-update-imported-mesh-positions-for-morphing/
                m.updateMeshPositions(function(positions) {return positions;}, true);
                let temp = m.getVerticesData(BABYLON.VertexBuffer.PositionKind);
                m.setVerticesData(BABYLON.VertexBuffer.PositionKind, temp, true);
                m.freezeNormals();

                // Make a morph manager
                var manager = new BABYLON.MorphTargetManager();
                m.morphTargetManager = manager;

                // Go through all the targets, make a new object, set that as
                // target in morphmanager
                PVRGlobals.allMorphTargets[meshName] = {};

                for (var targetName in targets) {
                    if (targets.hasOwnProperty(targetName)) {
                        let target = targets[targetName];

                        var morphTarget = new BABYLON.MorphTarget(targetName, 0.0);
                        morphTarget.setPositions(target);
                        //morphTarget.influence = 0.25;

                        manager.addTarget(morphTarget);
                        PVRGlobals.allMorphTargets[meshName][targetName] = morphTarget;
                    };
                };
            };
        };
    });
}

export function setToBase(meshName: string) {
    for (var targetName in PVRGlobals.allMorphTargets[meshName]) {
        if (PVRGlobals.allMorphTargets[meshName].hasOwnProperty(targetName)) {
            PVRGlobals.allMorphTargets[meshName][targetName].influence = 0.0;
        }
    }
}

// export function setInfluence(meshName: string, targetName: string, influence: number) {
//     // get the influences of the various targets

// }