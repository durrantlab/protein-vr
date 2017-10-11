///<reference path="../../Definitions/require.d.ts" />

// Leave this config code here in case you need it in the future...
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
require(['../main'], (main) => {
    /*
    Run the main start function.

    :param ??? main: The main object.
    */

    // Start the game...
    main.start();
});