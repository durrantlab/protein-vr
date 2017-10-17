define(["require", "exports", "../config/Globals"], function (require, exports, Globals) {
    class SphereMaterial {
        constructor(textureFilename, transparency = false, callBack = function () { }) {
            this.material = undefined;
            this._transparency = false;
            let scene = Globals.get("scene");
            let BABYLON = Globals.get("BABYLON");
            this._transparency = transparency;
            let dirname = textureFilename.indexOf("/") === -1 ? "" : textureFilename.match(/.*\//)[0];
            let basename = textureFilename.replace(/.*\//, "");
            // NOTE TO WILLIAM: This is loading all babylon files up front. Only
            // do this if global variable lazyLoadViewerSpheres is false.
            BABYLON.SceneLoader.Append(dirname, basename + ".babylon", scene, () => {
                scene.executeWhenReady(() => {
                    // Search through the materials to find the one with the id
                    // that == basename
                    let tmpMaterialToGetTexture = undefined;
                    for (let i = 0; i < scene.materials.length; i++) {
                        let mat = scene.materials[i];
                        if (mat.id === basename) {
                            tmpMaterialToGetTexture = mat;
                            break;
                        }
                    }
                    if (tmpMaterialToGetTexture === undefined) {
                        console.log("ERROR!");
                        debugger;
                    }
                    let texture = tmpMaterialToGetTexture.emissiveTexture;
                    this.material = new BABYLON.StandardMaterial("mat" + Math.random().toString(), scene);
                    this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                    this.material.specularColor = new BABYLON.Color3(0, 0, 0);
                    this.material.diffuseTexture = null;
                    this.material.emissiveTexture = texture; // videoTexture;
                    if (this._transparency) {
                        this.material.opacityTexture = texture;
                    }
                    this.material.backFaceCulling = false;
                    // Dispose of unneeded stuff
                    tmpMaterialToGetTexture.dispose();
                    // aScene.dispose();  // gives an error.
                    callBack();
                });
            });
        }
    }
    exports.SphereMaterial = SphereMaterial;
});
