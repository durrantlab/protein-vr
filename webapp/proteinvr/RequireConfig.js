///<reference path="Definitions/require.d.ts" />
// I know it's bad practice to polute the global namespace, but some variables
// are just far easier to use when declared globally.
var PVRGlobals = {
    // The BABYLON engine.
    engine: undefined,
    // The BABYLON scene.
    scene: undefined,
    // The canvas where the 3D graphics are being rendered.
    canvas: undefined,
    camera: undefined,
    // Whether or not to run the current app in debug mode. Whether or not to
    // run in debug mode (shows certain messages in the console, etc.)
    debug: false,
    // A JSON object that maps a mesh name to the mesh object.
    meshesByName: {},
    // The current frame number.
    frameNum: 0,
    // Previous camera position
    previousPos: undefined,
    // jQuery
    jQuery: undefined,
    screenfull: undefined,
    // A list of functions to run in the render loop.
    extraFunctionsToRunInLoop_BeforeCameraLocFinalized: [],
    // A list of functions to run in the render loop, after camera placed
    // above ground and everything (finalized)
    extraFunctionsToRunInLoop_AfterCameraLocFinalized: []
};
console.log('window loaded?');
console.log(window);
// requirejs configuration file
require.config({
    paths: {
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
        bootstrap: '../js/bootstrap-3.3.7/dist/js/bootstrap.min'
    },
    shim: {
        bootstrap: {
            deps: ['jquery']
        }
    },
    urlArgs: "bust=" + (new Date()).getTime()
});
// This require function starts the app
require(['../main', 'jquery', "bootstrap", "./Core/Core", "./Core/Setup"], function (main, jQuery, bootstrap, Core, Setup) {
    // window.Core = Core.default;  // not sure why the default is needed here.
    PVRGlobals.jQuery = jQuery;
    // Get custom events from main.ts
    var setEvents = main.start(Core);
    // Setup the VR program.
    Setup.setup(setEvents); // again with the default. Why needed?
});
