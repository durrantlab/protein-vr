///<reference path="external/require/require.d.ts" />

declare var jQuery;
declare var MobileDetect;

require.config({
    // paths: {
    //     // jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
    //     jquery: '../js/jquery.min',
    //     bootstrap: '../js/bootstrap-3.3.7/dist/js/bootstrap.min'
    // },
    // shim: {
    //     bootstrap: {
    //         deps: ['jquery']
    //     }
    // },
    "urlArgs": "bust=" + (new Date()).getTime(),  // prevent caching for debugging.
});

// This require function starts the app
require(["Game"], (Game) => {
    Game.start("renderCanvas");
});
