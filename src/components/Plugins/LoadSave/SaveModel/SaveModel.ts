// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as Parent from "../LoadSaveParent";
import * as VRML from "../../../Mols/3DMol/VRML";
// import { store } from "../../../Vars/VueX/VueXStore";
// import * as SimpleModalComponent from "../../../UI/Vue/Components/OpenPopup/SimpleModalComponent";
// import * as LoadSaveUtils from "../LoadSaveUtils";
// import * as UrlVars from "../../../Vars/UrlVars";
import * as Vars from "../../../Vars/Vars";

declare var BABYLON;

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";
import * as StatusComponent from "../../../UI/Vue/Components/StatusComponent";
import { lazyLoadJS } from "../../../System/LazyLoadJS";
import { downloadTxtFile } from "../LoadSaveUtils";

const exportedMeshName = "ProteinVRExport";
let meshesToExportStartStr = "MeshFrom3DMol";

/**
 * Convert a mesh with submeshes to a list of meshes, where each new mesh is a
 * submesh of the original.
 * @param  {any} mesh  The list of submeshes, now meshes.
 * @returns any
 */
function deconstructMesh(mesh: any): any[] {
    // adapted from see
    // https://doc.babylonjs.com/toolsAndResources/utilities/Deconstruct_Mesh
    if (mesh["subMeshes"].length > 1) {
        var otherVertexData = BABYLON["VertexData"]["ExtractFromMesh"](mesh, true, true);
        var indices = otherVertexData["indices"];
        var normals = otherVertexData["normals"];
        var positions = otherVertexData["positions"];
        var uvs = otherVertexData["uvs"];
        var colors = otherVertexData["colors"];

        var newMeshArray = [];
        for (var index = 0; index < mesh["subMeshes"].length; index++) {
            var newVertexData = new BABYLON["VertexData"]();

            var newI = indices.slice(mesh["subMeshes"][index]["indexStart"], mesh["subMeshes"][index]["indexStart"]+mesh["subMeshes"][index]["indexCount"]);
            var newN = normals.slice(mesh["subMeshes"][index]["verticesStart"] * 3, mesh["subMeshes"][index]["verticesStart"] * 3 + mesh["subMeshes"][index]["verticesCount"] * 3);
            var newP = positions.slice(mesh["subMeshes"][index]["verticesStart"] * 3, mesh["subMeshes"][index]["verticesStart"] * 3 + mesh["subMeshes"][index]["verticesCount"] * 3);
            var newU = uvs ? uvs.slice(mesh["subMeshes"][index]["verticesStart"] * 2, mesh["subMeshes"][index]["verticesStart"] * 2 + mesh["subMeshes"][index]["verticesCount"] * 2) : undefined;
            var newC = colors ? colors.slice(mesh["subMeshes"][index]["verticesStart"] * 4, mesh["subMeshes"][index]["verticesStart"] * 4 + mesh["subMeshes"][index]["verticesCount"] * 4) : undefined;
            for (var subIndex = 0; subIndex < newI.length; subIndex++) {
                newI[subIndex] = newI[subIndex] - mesh["subMeshes"][index]["verticesStart"];
            }
            newVertexData["indices"] = newI;
            newVertexData["normals"] = newN;
            newVertexData["positions"] = newP;
            newVertexData["uvs"] = newU;
            newVertexData["colors"] = newC;

            var meshSubclass = new BABYLON["Mesh"](mesh["name"] + '-' + index, Vars.scene);

            newVertexData["applyToMesh"](meshSubclass);

            newMeshArray.push(meshSubclass);
        }
        return newMeshArray;
    } else {
        return [mesh];
    }
}

/**
 * Takes all the molecule meshes, considers their submeshes, and turns
 * all that into a single regular mesh.
 * @returns any  The combined mesh.
 */
function mergeMolMeshes(): any {
    let molMeshes = Vars.scene["meshes"].filter(m => m["name"].slice(0, meshesToExportStartStr.length) === meshesToExportStartStr);

    const molMeshesLen = molMeshes.length;
    let molMeshParts = [];
    for (let i = 0; i < molMeshesLen; i++) {
        const molMesh = molMeshes[i];
        molMeshParts.push(...deconstructMesh(molMesh));
    }
    var newMolMesh = BABYLON["Mesh"]["MergeMeshes"](molMeshParts, true, true, false, false, false);
    newMolMesh["name"] = exportedMeshName;
    newMolMesh["id"] = exportedMeshName;
    // newMolMesh.material = molMeshes[0].material;
    return newMolMesh;
}

export class SaveModel extends Parent.LoadSaveParent {
    public pluginTitle = "Model<div class='emoji'>💾</div>";
    public pluginSlug = "proteinvr-save-model";
    public tag = "proteinvr-save-model-panel";

    public methods = {
        /**
         * Saves the molecules in GLTF format.
         * @returns void
         */
        saveGLTF(): void {
            mergeMolMeshes();  // new mesh named exportedMeshName
            BABYLON["GLTF2Export"]["GLTFAsync"](
                Vars.scene,
                this["pvrModelFileName"].slice(0, this["pvrModelFileName"].length - 4),
                this.optionsGLTFAndGLB
            ).then((gltf) => {
                gltf["downloadFiles"]();

                // Delete merged mesh.
                Vars.scene["getMeshByID"](exportedMeshName)["dispose"]();
            });
        },

        /**
         * Saves the molecules in GLB format.
         * @returns void
         */
         saveGLB(): void {
            mergeMolMeshes();  // new mesh named exportedMeshName
            BABYLON["GLTF2Export"]["GLBAsync"](
                Vars.scene,
                this["pvrModelFileName"].slice(0, this["pvrModelFileName"].length - 3),
                this.optionsGLTFAndGLB
            ).then((glb) => {
                glb["downloadFiles"]();

                // Delete merged mesh.
                Vars.scene["getMeshByID"](exportedMeshName)["dispose"]();
            });
        },

        /**
         * Saves the molecules in OBJ format.
         * @returns void
         */
         saveOBJ(): void {
            let meshes = Vars.scene["meshes"].filter(
                m => m["name"].slice(0, meshesToExportStartStr.length) === meshesToExportStartStr
            );

            let obj = BABYLON["OBJExport"]["OBJ"](meshes, true, "", true);

            downloadTxtFile(obj, this["pvrModelFileName"]);

            // Hard to get materials to work.
            // let mtl = mod["OBJExport"]["MTL"](meshes[1]);
            // let blob2 = new Blob([mtl], { "type": "application/octet-stream;charset=utf-8" });
            // FileSaver["saveAs"](blob2, "moo.mtl");
        },

        /**
         * Saves the molecules in STL format.
         * @returns void
         */
         saveSTL(): void {
            // Does not include vertex colors.
            let meshes = Vars.scene["meshes"].filter(
                m => m["name"].slice(0, meshesToExportStartStr.length) === meshesToExportStartStr
            );

            // Note filename must not have stl extension.
            BABYLON["STLExport"]["CreateSTL"](
                meshes, true,
                this["pvrModelFileName"].slice(0, this["pvrModelFileName"].length - 3),
                undefined, undefined, false
            );
        },

        /**
         * Saves the molecules in VRML format.
         * @returns void
         */
         saveVRML(): void {
            // Does have colors at vertexes. Note that no merge by distance,
            // though.
            downloadTxtFile(VRML.vrmlStr, this["pvrModelFileName"]);
        },

        /**
         * Start the save process.
         * @returns void
         */
        "startSave"(): void {
            this["btnTxt"] = "Saving...";
            this["overwriteBtnDisabled"] = true;

            let That = this;

            // import(
            //     /* webpackChunkName: "babylonjs-serializers" */
            //     /* webpackMode: "lazy" */
            //     "babylonjs-serializers"

            lazyLoadJS("js/babylonjs.serializers.min.js")
            .then(() => {
                // Good to wait a bit in case you need to update
                // pvrModelFileName.
                setTimeout(() => {
                    let format = That["formatInfo"]["format"];
                    switch (format) {
                        case "GLTF":
                            That.saveGLTF();
                            break;
                        case "GLB":
                            That.saveGLB();
                            break;
                        case "OBJ":
                            That.saveOBJ();
                            break;
                        case "STL":
                            That.saveSTL();
                            break;
                        case "VRML":
                            That.saveVRML();
                            break;
                    }
                    That.$store.commit("setVar", {
                        moduleName: "loadSaveModal",
                        varName: "showLoadSaveModal",
                        val: false
                    });
                    setTimeout(() => {
                        That["btnTxt"] = "Save File";
                        That["overwriteBtnDisabled"] = false;
                        StatusComponent.setStatus("Model exported");
                    }, 1000);
                }, 1000);
            });

        },

        /**
         * Runs when the user starts the save process. Most parameters should be
         * accessed as class variables.
         * @param  {*} [pvrModelFileName=undefined]  The name of the file to save.
         * @returns void
         */
        startLoadOrSave(pvrModelFileName: any = undefined): void {},

        /**
         * Fires when the pdb or url changes.
         * @param  {string} val  The new value.
         * @returns void
         */
        "onChange"(val: string): void {
            this["pvrModelFileName"] = val;
        },

        /**
         * Detects when key is pressed.
         * @returns void
         */
        "onEnter"(): void {
            this["startSave"]();
        },

        /**
         * Runs when the tab header is clicked.
         * @returns void
         */
        onTabHeaderClick(): void {}
    };

    public computed = {
        "btnDisabled"(): boolean {
            return this["formatInfo"]["format"] === "";
        },

        "formatInfo"(): any {
            if (this["pvrModelFileName"].indexOf(".") === -1) {
                // No extetnsion yet.
                return {
                    "msg": "",
                    "format": ""
                };
            }
            let prts = this["pvrModelFileName"].split(".")
            let ext = prts[prts.length - 1].toUpperCase();
            let colorInVertMsg = 'Color information will be saved as vertex colors. In <a href="https://www.blender.org/" target="_blank">Blender</a>, use a material like this:<br /><img src="blender_mat_example.png">';
            let noColorMsg = "ProteinVR cannot include color information when exporting to this format.";
            switch (ext) {
                case "GLTF":
                    return {
                        "msg": "",
                        "format": "GLTF"
                    }
                case "GLB":
                    return {
                        "msg": "",
                        "format": "GLB"
                    }
                case "OBJ":
                    return {
                        "msg": noColorMsg,
                        "format": "OBJ"
                    }
                case "STL":
                    return {
                        "msg": noColorMsg,
                        "format": "STL"
                    }
                case "VRML":
                    return {
                        "msg": colorInVertMsg,
                        "format": "VRML"
                    }
            }
            return {
                "msg": "Extension invalid.",
                "format": ""
            };
        }
    };

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {},
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            "pvrModelFileName": "my-scene.glb",
            "btnTxt": "Save File",
            "overwriteBtnDisabled": false,
            optionsGLTFAndGLB: {
                "shouldExportNode": function (node) {
                    let toUse = node["name"].slice(0, exportedMeshName.length) === exportedMeshName;
                    return toUse;
                },
            }
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
