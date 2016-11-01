var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define(["require", "exports", "./ObjectParent", "../Shader/Shader"], function (require, exports, ObjectParent_1, Shader_1) {
    "use strict";
    /**
     * The CustomShaderObject namespace is where functions and variables related
     * to objects with custom shaders are stored.
     */
    var CustomShaderObject = (function (_super) {
        __extends(CustomShaderObject, _super);
        function CustomShaderObject() {
            _super.apply(this, arguments);
        }
        /**
         * This function checks a mesh to see if it is marked as having a custom
         * shader. These shaders are defined in main.ts.
         * @param {any} m     The mesh.
         * @param {any} json  The associated json, which contains the
         *                    information about whether or not the mesh is
         *                    marked as this type of mesh.
         * @returns {boolean} Whether or not the provided mesh matches the object
         *     described in the json.
         */
        CustomShaderObject.prototype.objectMatch = function (m, json) {
            if (json.cs !== "") {
                // Dispose of any old material
                if (m.material !== null) {
                    var oldMat = m.material;
                    m.material = null;
                    oldMat.dispose();
                }
                // Create the new shader
                var shaderToUse = Shader_1.default.shadersLibrary[json.cs];
                // Updat the mesh's material
                m.material = shaderToUse.material;
                // Associate this shader with the mesh too so you can more easily
                // access shader-related variables.
                // TODO: Implement this shader object as a legitimate BABYLONJS
                // material.
                m.customShader = shaderToUse;
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
        CustomShaderObject.prototype.objectNoMatch = function (m, json) { return; };
        return CustomShaderObject;
    }(ObjectParent_1.default));
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = CustomShaderObject;
});
