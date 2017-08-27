///<reference path="Definitions/require.d.ts" />
require.config({
    paths: {
        // jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min',
        // jquery: 'https://code.jquery.com/jquery-3.2.1',
        jquery: 'js/jquery-1.7.1.min'
    },
    // shim: {
    //     bootstrap: {
    //         deps: ['jquery']
    //     }
    // }, 
    urlArgs: "bust=" + (new Date()).getTime()
});
// This require function starts the app
require(['jquery', /*'babylon',*/ /* 'babylonObjLoader', */ './main'], function (jQuery, /*BABYLON,*/ main) {
    // console.log(jQuery);
    // console.log(BABYLON);
    // console.log(main);
    main.start();
});
