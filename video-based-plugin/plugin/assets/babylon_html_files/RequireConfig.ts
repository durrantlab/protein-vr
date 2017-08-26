///<reference path="Definitions/require.d.ts" />

declare var jQuery;

require.config({
    paths: {
        // jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
        jquery: 'https://code.jquery.com/jquery-3.2.1',
        // babylon: 'js/babylon.max',
        // babylonObjLoader: 'js/babylon.objFileLoader'
    },
    // shim: {
    //     bootstrap: {
    //         deps: ['jquery']
    //     }
    // }, 
    urlArgs: "bust=" + (new Date()).getTime()
});

// This require function starts the app
require(['jquery', /*'babylon',*/ /* 'babylonObjLoader', */ './main'], (jQuery, /*BABYLON,*/ main) => {
    console.log(jQuery);
    // console.log(BABYLON);
    console.log(main);

    main.start();
});