// Functions to handle molecule shadows.

import * as Vars from "../Vars";

declare var BABYLON: any;

export let shadowGenerator: any;

/**
 * Setup the shadow generator that casts a shadow from the molecule meshes.
 * @returns void
 */
export function setupShadowGenerator(): void {
    // Get the light that will cast the shadows.
    let light = Vars.scene.lights[0];

    /** @type {Object<string,number>} */
    let shadowInf = getBlurDarknessFromLightName();
    shadowInf.T = 0;
    shadowInf.blur = 2;

    // Set up the shadow generator.
    // Below gives error on iphone sometimes...
    if (!Vars.IOS) {
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
        // window.shadowGenerator = shadowGenerator;

        // Old parameters not used:
        // shadowGenerator.usePoissonSampling = true;  // Good but slow.
    } else {
        console.log("iOS, so not generating shadows... causes an error... See https://forum.babylonjs.com/t/issues-between-shadowgenerator-and-ios-osx/795");
    }
}

/**
 * Gets the blur and darkness to use on shadows and molecule lighting.
 * @returns Object<string,number>
 */
export function getBlurDarknessFromLightName(): any {
    let light = Vars.scene.lights[0];

    // Set some default values for the shadows.
    let blur = 64;
    let darkness = 0.9625;  // Lower numbers are darker.

    // Now overwrite those values if reason to do so in the name of the light.
    let blurMatches = light.name.match(/blur_([0-9\.]+)/g);
    if (blurMatches !== null) {
        blur = +blurMatches[0].substr(5);
    }

    /** @type Array<string> */
    let darknessMatches = light.name.match(/dark_([0-9\.]+)/g);
    if (darknessMatches !== null) {
        darkness = +darknessMatches[0].substr(5);
    }

    return {blur, darkness};
}

/**
 * Sets up the shadow-catcher mesh.
 * @returns void
 */
export function setupShadowCatchers(): void {
    // Go through and find the shdow catchers
    /** @type {number} */
    let len = Vars.scene.meshes.length;
    for (let idx = 0; idx < len; idx++) {
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
