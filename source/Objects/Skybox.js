var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ObjectParent", "../Core/Core"], function (require, exports, ObjectParent_1, Core_1) {
    "use strict";
    /**
     * The Skybox namespace is where all the functions related to the skybox
     * are stored.
     */
    var Skybox = (function (_super) {
        __extends(Skybox, _super);
        function Skybox() {
            _super.apply(this, arguments);
        }
        /**
         * This function checks a mesh to see if it is marked as this type of
         * mesh. You can mark a mesh as this type of mesh using the VR Blender
         * plugin.
         * @param {any} m     The mesh.
         * @param {any} json  The associated json file, which contains the
         *                    information about whether or not the mesh is
         *                    marked as this type of mesh.
         * @returns {boolean} Whether or not the provided mesh matches the object
         *     described in the json.
         */
        Skybox.prototype.objectMatch = function (m, json) {
            if (json.s === "1") {
                // It's a skybox.
                m.checkCollisions = false; // No need to check collisions on
                // a skybox.
                m.infiniteDistance = true; // Make it so the skybox is always
                // far away.
                m.renderingGroupId = 0; // Set the rendering group id to be
                // 0, so other objects are always
                // rendered in front.
                m.material.backFaceCulling = false; // No need to render the
                // outside of the skybox,
                // since the camera will
                // always be inside it.
                m.material.disableLighting = true; // The skybox doesn't
                // interact with lights.
                // Remove reflections, because the skybox is an image texture,
                // and the sun doens't reflect off the sky.
                m.material.specularColor = new BABYLON.Color3(0, 0, 0);
                m.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
                // m.isPickable = true;  // Uncomment this if you want to know
                // the location of an image on the
                // skybox.
                Skybox.skyboxMesh = m;
                return true;
            }
            return false;
        };
        /**
         * This function checks a mesh to see if it is NOT marked as this type of
         * mesh.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as this type of mesh.
         */
        Skybox.prototype.objectNoMatch = function (m, json) {
            // If it's not the skybox, set the rendering group id to 1. So
            // it will be displayed in front of the skybox.
            this.setRenderingGroupId(m, 1);
        };
        /**
         * Applies images to the skybox. Sometimes it's much easier to just
         * get the skybox from image files directly, rather than making them
         * in Blender.
         * @param {string} dir The directory where the skybox images are
         *                     stored, including the beginning of the jpg file
         *                     that is common to all files.
         */
        Skybox.applyBoxImgs = function (dir) {
            // See https://doc.babylonjs.com/tutorials/Environment#skybox for
            // filename convention.
            // Create a new material for the skybox.
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", Core_1.default.scene);
            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.disableLighting = true;
            skyboxMaterial.reflectionTexture =
                new BABYLON.CubeTexture(dir, Core_1.default.scene);
            skyboxMaterial.reflectionTexture.coordinatesMode =
                BABYLON.Texture.SKYBOX_MODE;
            if (Skybox.skyboxMesh !== undefined) {
                Skybox.skyboxMesh.material = skyboxMaterial;
            }
            else {
                console.log("ERROR: You tried to apply a skybox, but there is no skybox object imported from blender.");
            }
        };
        return Skybox;
    }(ObjectParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Skybox;
});
