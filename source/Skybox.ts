/**
 * BABYLON is an external JavaScript library. This prevents Typescript from
 * throwing errors because BABYLON isn't defined in the TypeScript file.
 */
declare var BABYLON: any;

/**
 * The World namespace is where all the VR World functions and variables are
 * stored.
 */
namespace World {

    /**
     * The Skybox namespace is where all the functions related to the skybox
     * are stored.
     */
    export namespace Skybox {
        // Note: The normals of the skybox must be facing inward! Do that in
        // Blender.

        /** A variable where the skybox mesh is stored. */
        export var skyboxMesh: any;

        /**
         * This function checks a mesh to see if it's marked as the skybox
         * mesh. You can mark a mesh as a skybox mesh using the VR Blender
         * plugin.
         * @param {any} m    The mesh.
         * @param {any} json The associated json file, which contains the
         *                   information about whether or not the mesh is
         *                   marked as a skybox.
         */
        export function checkInitialMesh(m: any, json: any): void {
            if (json.s === "1") {
                // It's a skybox.
                m.checkCollisions = false;  // No need to check collisions on
                                            // a skybox.
                m.infiniteDistance = true;  // Make it so the skybox is always
                                            // far away.
                m.renderingGroupId = 0;  // Set the rendering group id to be
                                         // 0, so other objects are always
                                         // rendered in front.

                m.material.backFaceCulling = false;  // No need to render the
                                                     // outside of the skybox,
                                                     // since the camera will
                                                     // always be inside it.
                m.material.disableLighting = true;  // The skybox doesn't
                                                    // interact with lights.

                // Remove reflections, because the skybox is an image texture,
                // and the sun doens't reflect off the sky.
                m.material.specularColor = new BABYLON.Color3(0,0,0);
                m.material.diffuseColor = new BABYLON.Color3(0,0,0);
                // m.isPickable = true;  // Uncomment this if you want to know
                                         // the location of an image on the
                                         // skybox.
                World.Skybox.skyboxMesh = m;
            } else {
                // If it's not the skybox, set the rendering group id to 1. So
                // it will be displayed in front of the skybox.
                World.Utils.setRenderingGroupId(m, 1);
            }
        }

        /**
         * Applies images to the skybox. Sometimes it's much easier to just
         * get the skybox from image files directly, rather than making them
         * in Blender.
         * @param {string} dir The directory where the skybox images are
         *                     stored, including the beginning of the jpg file
         *                     that is common to all files.
         */
        export function applyBoxImgs(dir: string): void {
            // See https://doc.babylonjs.com/tutorials/Environment#skybox for
            // filename convention.

            // Create a new material for the skybox.
            let skyboxMaterial =
                new BABYLON.StandardMaterial("skyBox", World.scene);

            skyboxMaterial.backFaceCulling = false;
            skyboxMaterial.disableLighting = true;

            skyboxMaterial.reflectionTexture =
                new BABYLON.CubeTexture(dir, World.scene);

            skyboxMaterial.reflectionTexture.coordinatesMode =
                BABYLON.Texture.SKYBOX_MODE;

            if (World.Skybox.skyboxMesh !== undefined) {
                World.Skybox.skyboxMesh.material = skyboxMaterial;
            } else {
                console.log("ERROR: You tried to apply a skybox, but there is no skybox object imported from blender.");
            }
        }
    }
}
