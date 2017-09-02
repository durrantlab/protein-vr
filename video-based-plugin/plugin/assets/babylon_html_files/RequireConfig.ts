///<reference path="Definitions/require.d.ts" />

declare var jQuery;

// require.config({
//     paths: {
//         // jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
//         // jquery: 'https://code.jquery.com/jquery-3.2.1',
//         jquery: 'js/jquery-1.7.1.min',
//         // babylon: 'js/babylon.max',
//         // babylonObjLoader: 'js/babylon.objFileLoader',
//         bootstrap: 'js/bootstrap-3.3.7/dist/js/bootstrap.min'
//     },
//     shim: {
//         bootstrap: {
//             deps: ['jquery']
//         }
//     }, 
//     urlArgs: "bust=" + (new Date()).getTime()
// });

// This require function starts the app
// require(['jquery', './main', "bootstrap", /*'babylon',*/ /* 'babylonObjLoader', */ ], (jQuery, main /*BABYLON,*/ ) => {
require(['./main'], (main) => {
        // console.log(jQuery);
    // console.log(BABYLON);
    // console.log(main);

    main.start();
});