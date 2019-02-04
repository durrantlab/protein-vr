// This module includes functions to manage which meshes in the scene are
// pickable.
define(["require", "exports", "./Vars"], function (require, exports, Vars) {
    "use strict";
    exports.__esModule = true;
    var pickableMeshes = [];
    var pickableButtons = [];
    var pickableMolecules = [];
    var PickableCategory;
    (function (PickableCategory) {
        PickableCategory[PickableCategory["None"] = 0] = "None";
        PickableCategory[PickableCategory["Ground"] = 1] = "Ground";
        PickableCategory[PickableCategory["Button"] = 2] = "Button";
        PickableCategory[PickableCategory["Molecule"] = 3] = "Molecule";
    })(PickableCategory = exports.PickableCategory || (exports.PickableCategory = {}));
    function setCurPickedMesh(mesh) {
        exports.curPickedMesh = mesh;
    }
    exports.setCurPickedMesh = setCurPickedMesh;
    function setup() {
        pickableMeshes.push(Vars.vars.groundMesh);
    }
    exports.setup = setup;
    function addPickableButton(mesh) {
        pickableMeshes.push(mesh);
        pickableButtons.push(mesh);
    }
    exports.addPickableButton = addPickableButton;
    function addPickableMolecule(mesh) {
        pickableMeshes.push(mesh);
        pickableMolecules.push(mesh);
    }
    exports.addPickableMolecule = addPickableMolecule;
    function checkIfMeshPickable(mesh) {
        return pickableMeshes.indexOf(mesh) !== -1;
    }
    exports.checkIfMeshPickable = checkIfMeshPickable;
    function getCategoryOfCurMesh() {
        if (exports.curPickedMesh === undefined) {
            return PickableCategory.None;
        }
        else if (exports.curPickedMesh === Vars.vars.groundMesh) {
            return PickableCategory.Ground;
        }
        else if (pickableButtons.indexOf(exports.curPickedMesh) !== -1) {
            return PickableCategory.Button;
        }
        else if (pickableMolecules.indexOf(exports.curPickedMesh) !== -1) {
            return PickableCategory.Molecule;
        }
        else {
            return PickableCategory.None;
        }
    }
    exports.getCategoryOfCurMesh = getCategoryOfCurMesh;
});
