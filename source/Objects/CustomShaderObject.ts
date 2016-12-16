import parent from "./ObjectParent";
import Shaders from "../Shader/Shader";

class CustomShaderObject extends parent{
    /**
     * The CustomShaderObject namespace is where functions and variables related
     * to objects with custom shaders are stored.
     */

    public objectMatch(m: any, json: any): boolean {
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

        if (json.cs !== "") {
            // Dispose of any old material
            if (m.material !== null) {
                let oldMat = m.material;
                m.material = null;
                oldMat.dispose();
            }

            // Create the new shader
            let shaderToUse = Shaders.shadersLibrary[json.cs];

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
    }

    public objectNoMatch(m: any, json: any): void { 
        /**
         * This function checks a mesh to see if it is NOT marked as this type of
         * mesh.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as this type of mesh.
         */

        return; 
    }
}

export default CustomShaderObject;