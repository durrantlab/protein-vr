///<reference path="proteinvr/Definitions/require.d.ts" />

// requirejs configuration file

require.config({
    paths: {
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min'
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

// This require function starts the app
require(['proteinvr/main', 'jquery'], (main, jQuery) => {
    main.start(jQuery);
});