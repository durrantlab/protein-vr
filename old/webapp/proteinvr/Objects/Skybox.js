var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./ObjectParent"], function (require, exports, ObjectParent_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Skybox = (function (_super) {
        __extends(Skybox, _super);
        function Skybox() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Skybox.prototype.objectMatch = function (m) {
            /**
            This function checks a mesh to see if it is marked as this type of
            mesh. You can mark a mesh as this type of mesh using the VR Blender
            plugin.
    
            :param any m: The mesh.
    
            :param any json: The associated json file, which contains the
                       information about whether or not the mesh is
                       marked as this type of mesh.
    
            :returns: Whether or not the provided mesh matches the object
                      described in the json.
            :rtype: :any:`bool`
            */
            // if (json.s === "1") {
            if (m.name === "sky") {
                // It's a skybox.
                m.checkCollisions = false; // No need to check collisions on
                // a skybox.
                m.infiniteDistance = true; // Make it so the skybox is always
                // far away.
                m.renderingGroupId = 0; // Set the rendering group id to be
                // 0, so other objects are always
                // rendered in front.
                m.material.backFaceCulling = true; // No need to render the
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
        Skybox.prototype.objectNoMatch = function (m) {
            /**
            This function checks a mesh to see if it is NOT marked as this type of
            mesh.
    
            :param any m: The mesh.
            
            :param any json: The associated json file, which contains the
                       information about whether or not the mesh is
                       marked as this type of mesh.
            */
            // If it's not the skybox, set the rendering group id to 1. So
            // it will be displayed in front of the skybox.
            this.setRenderingGroupId(m, 1);
        };
        Skybox.applyBoxImgs = function (dir) {
            /**
            Applies images to the skybox. Sometimes it's much easier to just
            get the skybox from image files directly, rather than making them
            in Blender.
    
            :param str dir: The directory where the skybox images are
                   stored, including the beginning of the png file
                   that is common to all files.
            */
            // See https://doc.babylonjs.com/tutorials/Environment#skybox for
            // filename convention.
            // Create a new material for the skybox.
            var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", PVRGlobals.scene);
            skyboxMaterial.backFaceCulling = true;
            skyboxMaterial.disableLighting = true;
            skyboxMaterial.reflectionTexture =
                new BABYLON.CubeTexture(dir, PVRGlobals.scene);
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
    exports.default = Skybox;
});
