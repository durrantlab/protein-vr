// A place to put variables that need to be accessed from multiple places.

declare var BABYLON;

export let canvas;
export let engine;
export let scene;
export let renderLoopFuncs = [];

export function setup() {
    canvas = document.getElementById("renderCanvas");

    // Generate the BABYLON 3D engine
    engine = new BABYLON.Engine(canvas, true);

    engine.enableOfflineSupport = false;  // no manifest errors

    scene = new BABYLON.Scene(engine);
}

export function setScene(newScene) {
    scene = newScene;
}
