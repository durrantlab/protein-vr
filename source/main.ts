/// <reference path="BabylonSetup.ts" />

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
     * Start the VR App.
     */
    export function start(): void {
        World.setup();
    }
}

// Start the VR program.
World.start();
