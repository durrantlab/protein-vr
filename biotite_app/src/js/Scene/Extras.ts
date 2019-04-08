import * as GUI from "./GUI";
import * as jQuery from "./jQuery";
import * as Vars from "./Vars";
import * as Optimizations from "./VR/Optimizations";
import * as Pickables from "./VR/Pickables";
import * as VRVoiceCommands from "./VR/VoiceCommands";

declare var BABYLON;

export let shadowGenerator;

/**
 * Load in the extra molecule meshes.
 * @returns void
 */
export function setup(): void {
    // Set up the shadow generator.
    setupShadowGenerator();

    jQuery.getJSON("scene_info.json", (data) => {
        // Make UVs work
        BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;

        // Deactivate menu if appropriate.
        if (data["menuActive"] === false) {
            Vars.vrVars.menuActive = false;
        }

        let assetsManager = new BABYLON.AssetsManager(Vars.scene);

        for (let idx in data["objIDs"]) {
            if (data["objIDs"].hasOwnProperty(idx)) {
                let objID = data["objIDs"][idx];
                let meshTask = assetsManager.addMeshTask(objID, "", "./", objID + ".gltf");
                meshTask.onSuccess = (task) => {
                    // console.log(task);
                    // Get the meshes.
                    for (let uniqStrID in task.loadedMeshes) {
                        if (task.loadedMeshes.hasOwnProperty(uniqStrID)) {
                            let uniqIntID = parseInt(uniqStrID, 10);
                            let mesh = task.loadedMeshes[uniqIntID];

                            setupMesh(
                                mesh, objID, data["shadowQuality"], uniqIntID,
                            );
                        }
                    }

                    // task.loadedMeshes[0].position = BABYLON.Vector3.Zero();
                };
            }
        }

        assetsManager.onProgress = (remainingCount, totalCount, lastFinishedTask) => {
            Vars.engine.displayLoadingUI();  // Keep it up while progressing...
            let msg = "Loading molecular meshes... " + remainingCount + " of " + totalCount + " remaining.";
            Vars.engine.loadingUIText = msg;
        };

        assetsManager.onFinish = (tasks) => {
            setupShadowCatchers();

            // Give it a bit to let one render cycle go through. Hackish,
            // admittedly.
            setTimeout(Optimizations.updateEnvironmentShadows, 1000);
        };

        // console.log(Vars.scene.getWaitingItemsCount());
        assetsManager.load();

        if (Vars.vrVars.menuActive) {
            GUI.setup(data);
        }
    });
}

/**
 * Gets the blur and darkness to use on shadows and molecule lighting.
 * @returns Object<string,number>
 */
function getBlurDarknessFromLightName(): any {
    let light = Vars.scene.lights[0];

    // Set some default values for the shadows.
    let blur = 64;
    let darkness = 0.9625;  // Lower numbers are darker.

    // Now overwrite those values if reason to do so in the name of the light.
    let blurMatches = light.name.match(/blur_([0-9\.]+)/g);
    if (blurMatches !== null) {
        blur = parseFloat(blurMatches[0].substr(5));
    }

    let darknessMatches = light.name.match(/dark_([0-9\.]+)/g);
    if (darknessMatches !== null) {
        darkness = parseFloat(darknessMatches[0].substr(5));
    }

    return {blur, darkness};
}

/**
 * Setup the shadow generator that casts a shadow from the molecule meshes.
 * @returns void
 */
function setupShadowGenerator(): void {
    // Get the light that will cast the shadows.
    let light = Vars.scene.lights[0];

    let shadowInf = getBlurDarknessFromLightName();

    // Set up the shadow generator.
    shadowGenerator = new BABYLON.ShadowGenerator(4096, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.setDarkness(shadowInf.darkness);

    // If using kernal, do below.
    shadowGenerator.useKernelBlur = true;  // Very good shadows, but more expensive.
    shadowGenerator.blurKernel = shadowInf.blur;  // Degree of bluriness.

    // If not using kernal, do below
    // shadowGenerator.blurScale = 7;  // Good for surfaces and ribbon.
    // shadowGenerator.blurBoxOffset = 5;

    // Will make debugging easier.
    window.shadowGenerator = shadowGenerator;

    // Old parameters not used:
    // shadowGenerator.usePoissonSampling = true;  // Good but slow.
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
function setupMesh(mesh: any, objID: string, shadowQuality: string, uniqIntID: number): void {
    if (mesh.material !== undefined) {
        if (shadowQuality !== "Skip") {
            // So using shadows baked from blender.

            // Save the side orientation before removing mesh.
            let oldMatOrien = mesh.material.sideOrientation;

            // Remove existing material
            mesh.material.dispose();
            mesh.material = null;

            // Make sure not alpha blended.
            mesh.hasVertexAlpha = false;
            mesh.visibility = true;

            // Create new material
            let mat = new BABYLON.StandardMaterial("molMat" + uniqIntID.toString(), Vars.scene);
            mat.diffuseColor = new BABYLON.Color3(1, 1, 1);
            mat.specularColor = new BABYLON.Color3(0, 0, 0);
            mat.opacityTexture = null;
            mat.sideOrientation = oldMatOrien;

            // mat.diffuseTexture.hasAlpha = false;
            let texName = objID + ".png";
            let tex = new BABYLON.Texture(  // lightmapTexture
                texName, Vars.scene,
            );
            tex.vScale = -1;
            mat.emissiveTexture = tex;

            mat.disableLighting = true;
            mat.sideOrientation = BABYLON.Material.ClockWiseSideOrientation;
            mat.backFaceCulling = false;

            // Add it to the mesh
            mesh.material = mat;

            // Freeze the material (improves optimization).
            Optimizations.freezeMeshProps(mesh);
        } else {
            // Not using baked shadows. Add a small emission color so the dark
            // side of the protein isn't too dark.
            let lightingInf = getBlurDarknessFromLightName();

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
    }

    // This is required to position correctly.
    mesh.scaling.z = -1;
    if (uniqIntID > 0) {
        mesh.scaling.x = -1;
    }

    // Make it so it casts a shadow.
    shadowGenerator.getShadowMap().renderList.push(mesh);

    // Make it pickable
    Pickables.addPickableMolecule(mesh);
}

/**
 * Sets up the shadow-catcher mesh.
 * @returns void
 */
function setupShadowCatchers(): void {
    // Go through and find the shdow catchers
    for (let idx in Vars.scene.meshes) {
        if (Vars.scene.meshes.hasOwnProperty(idx)) {
            let mesh = Vars.scene.meshes[idx];
            if ((mesh.name.toLowerCase().indexOf("shadowcatcher") !== -1) || (
                mesh.name.toLowerCase().indexOf("shadow_catcher") !== -1)) {

                // Make the material
                mesh.material = new BABYLON.ShadowOnlyMaterial("shadow_catch" + idx.toString(), Vars.scene);
                mesh.material.activeLight = Vars.scene.lights[0];
                // mesh.material.alpha = 0.1;

                // It can receive shadows.
                mesh.receiveShadows = true;
            }
        }
    }
}
