import * as Vars from "./Vars";

declare var BABYLON;

/**
 * Setup lights.
 * @returns void
 */
export function setup(): void {
    const light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), Vars.scene);
    const light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), Vars.scene);
}