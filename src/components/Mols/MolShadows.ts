// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2020 Jacob D. Durrant.

// Functions to handle molecule shadows.

import * as Vars from "../Vars/Vars";
import * as UrlVars from "../Vars/UrlVars";

declare var BABYLON: any;

export let shadowGenerator: any;

/**
 * Setup the shadow generator that casts a shadow from the molecule meshes.
 * @returns void
 */
export function setupShadowGenerator(): void {
    // Get the light that will cast the shadows.
    const light = Vars.scene.lights[0];

    /** @type {Object<string,number>} */
    const shadowInf = getBlurDarknessAmbientFromLightName();
    // shadowInf.T = 0;
    // shadowInf.blur = 2;

    // Set up the shadow generator.
    // Below gives error on iphone sometimes... And Oculus Go browser.
    if (UrlVars.checkShadowInUrl()) {
        shadowGenerator = new BABYLON.ShadowGenerator(4096, light);

        if (true) {
            // Set above to false for debugging (sharp shadow).
            // shadowInf.darkness = 0.8;

            shadowGenerator.useBlurExponentialShadowMap = true;

            // If using kernal, do below.
            shadowGenerator.useKernelBlur = true;  // Very good shadows, but more expensive.
            shadowGenerator.blurKernel = shadowInf.blur;  // Degree of bluriness.
            // shadowGenerator.blurScale = 15;
            // shadowGenerator.blurBoxOffset = 15;

            shadowGenerator.setDarkness(shadowInf.darkness);

            // If not using blurKernal, do below. It's a bit faster, but
            // doesn't look as good.
            // shadowGenerator.blurScale = 12;  // Good for surfaces and ribbon.
            // shadowGenerator.blurBoxOffset = 15;

            // Old parameters not used:
            // shadowGenerator.usePoissonSampling = true;  // Good but slow.
        }
    } else {
        // console.log("iOS, so not generating shadows... causes an error... See https://forum.babylonjs.com/t/issues-between-shadowgenerator-and-ios-osx/795");
    }
}

/**
 * Gets the blur and darkness to use on shadows and molecule lighting.
 * @returns Object<string,number>
 */
export function getBlurDarknessAmbientFromLightName(): any {
    const light = Vars.scene.lights[0];

    // Set some default values for the shadows.
    let blur = 64;
    let darkness = 0.9625;  // Lower numbers are darker.
    let ambient = undefined;

    // Now overwrite those values if reason to do so in the name of the light.
    const blurMatches = light.name.match(/blur_([0-9\.]+)/g);
    if (blurMatches !== null) {
        blur = +blurMatches[0].substr(5);
    }

    /** @type Array<string> */
    const darknessMatches = light.name.match(/dark_([0-9\.]+)/g);
    if (darknessMatches !== null) {
        darkness = +darknessMatches[0].substr(5);
    }

    const ambientMatches = light.name.match(/ambient_([0-9\.]+)/g);
    if (ambientMatches !== null) {
        ambient = +ambientMatches[0].substr(8);
    }

    return {blur, darkness, ambient};
}

/**
 * Sets up the shadow-catcher mesh.
 * @returns void
 */
export function setupShadowCatchers(): void {
    // Go through and find the shdow catchers
    /** @type {number} */
    const len = Vars.scene.meshes.length;
    for (let idx = 0; idx < len; idx++) {
        const mesh = Vars.scene.meshes[idx];
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
