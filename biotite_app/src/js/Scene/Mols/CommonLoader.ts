// Functions common to all loaded molecules, regardless of source.

import * as Load from "../Load";
import * as Vars from "../Vars";
import * as Optimizations from "../VR/Optimizations";
import * as Pickables from "../VR/Pickables";
import * as Shadows from "./Shadows";

declare var BABYLON;

export function beforeLoading() {
    // Set up the shadow generator.
    Shadows.setupShadowGenerator();

    // Make UVs work
    BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
}

/**
 * @param  {Object<string,*>} sceneInfoData The data from scene_info.json.
 * @returns void
 */
export function afterLoading(sceneInfoData: any): void {
    Shadows.setupShadowCatchers();  // Related to extras, so keep it here.

    // Do you need to make the ground glass instead of invisible? See
    // scene_info.json, which can have transparentGround: true.
    if ((sceneInfoData["transparentGround"] !== undefined) && (sceneInfoData["transparentGround"] === true)) {
        if (Vars.vrVars.groundMesh) {
            Vars.vrVars.groundMesh.visibility = 1;

            let transparentGround = new BABYLON.StandardMaterial("transparentGround", Vars.scene);

            transparentGround.diffuseColor = new BABYLON.Color3(1, 1, 1);
            transparentGround.specularColor = new BABYLON.Color3(0, 0, 0);
            transparentGround.emissiveColor = new BABYLON.Color3(0, 0, 0);
            transparentGround.alpha = Vars.TRANSPARENT_FLOOR_ALPHA;
            // transparentGround.ambientColor = new BABYLON.Color3(0.23, 0.98, 0.53);

            Vars.vrVars.groundMesh.material = transparentGround;

            // let glass = new BABYLON.PBRMaterial("glass", Vars.scene);
            // glass.reflectionTexture = hdrTexture;
            // glass.refractionTexture = hdrTexture;
            // glass.linkRefractionWithTransparency = true;
            // glass.indexOfRefraction = 0.52;
            // glass.alpha = 0; // Fully refractive material
            // Vars.vrVars.groundMesh.material = glass;
        } else {
            console.log("Warning: Vars.vrVars.groundMesh not defined.");
        }
    }

    // Finish up all scene preparations.
    Load.loadingAssetsDone();
}

/**
 * Sets up a molecule mesh.
 * @param  {*}      mesh           The mesh.
 * @param  {string} objID          A string identifying this mesh.
 * @param  {*}      shadowQuality  The shadow quality. Like "Skip".
 * @param  {number} uniqIntID      A unique numerical id that identifies this
 *                                 mesh.
 * @returns void
 */
export function setupMesh(mesh: any, objID: string, shadowQuality: string, uniqIntID: number): void {
    if ((mesh.material !== undefined) && (mesh.material !== null)) {
        // if (shadowQuality !== "Skip") {
        //     // So using shadows baked from blender.

        //     // Save the side orientation before removing mesh.
        //     let oldMatOrien = mesh.material.sideOrientation;

        //     // Remove existing material
        //     mesh.material.dispose();
        //     mesh.material = null;

        //     // Make sure not alpha blended.
        //     mesh.hasVertexAlpha = false;
        //     mesh.visibility = true;

        //     // Create new material
        //     let mat = new BABYLON.StandardMaterial("molMat" + uniqIntID.toString(), Vars.scene);
        //     mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
        //     mat.specularColor = new BABYLON.Color3(0, 0, 0);
        //     mat.opacityTexture = null;
        //     mat.sideOrientation = oldMatOrien;

        //     // mat.diffuseTexture.hasAlpha = false;
        //     let texName = objID + ".png";
        //     let tex = new BABYLON.Texture(  // lightmapTexture
        //         texName, Vars.scene,
        //     );
        //     tex.vScale = -1;
        //     mat.emissiveTexture = tex;

        //     mat.disableLighting = true;
        //     mat.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
        //     mat.backFaceCulling = false;

        //     // Add it to the mesh
        //     mesh.material = mat;

        //     // Freeze the material (improves optimization).
        //     Optimizations.freezeMeshProps(mesh);
        // } else {

        // Not using baked shadows. Add a small emission color so the dark
        // side of the protein isn't too dark.
        let lightingInf = Shadows.getBlurDarknessFromLightName();

        // Experience:
        // In Couch scene, background luminosity of 0.01 is good. There shadow darkness was 0.9625
        // In House scene, background luminosity of 0.0025 is good. There shadow darkness was 0.35.
        // Let's play around with a scheme for guessing at the right background luminosity.

        let backgroundLum;
        if (lightingInf.darkness > 0.95) {
            backgroundLum = 0.01;
        } else if (lightingInf.darkness < 0.4) {
            backgroundLum = 0.0025;
        } else {
            // Scaled
            // (0.95, 0.01)
            // (0.4, 0.0025)
            // let m = 0.013636363636363637;  // (0.01 - 0.0025) / (0.95 - 0.4);
            // let b = -0.0029545454545454545;  // 0.01 - 0.013636363636363637 * 0.95;
            backgroundLum = 0.013636363636363637 * lightingInf.darkness - 0.0029545454545454545;
        }

        mesh.material.emissiveColor = new BABYLON.Color3(backgroundLum, backgroundLum, backgroundLum);
        // let ssao = new BABYLON.SSAORenderingPipeline("ssaopipeline", Vars.scene, 0.75);

        // Enable transparency (for fading in and out).
        // mesh.material.transparencyMode = BABYLON.PBRMaterial.PBRMATERIAL_ALPHABLEND;

        // Freeze the material (improves optimization).
        Optimizations.freezeMeshProps(mesh);
    }
    // }

    // This is required to position correctly.
    mesh.scaling.z = -1;
    if (uniqIntID > 0) {
        mesh.scaling.x = -1;
    }

    // Make it so it casts a shadow.
    if (Shadows.shadowGenerator) {
        Shadows.shadowGenerator.getShadowMap().renderList.push(mesh);
    }

    // Make it pickable
    Pickables.addPickableMolecule(mesh);
}
