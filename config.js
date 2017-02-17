///<reference path="source/Definitions/require.d.ts" />
// requirejs configuration file
require.config({
    // baseUrl: 'source',
    paths: {
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min'
    }
});
// start app
require(['source/main', 'jquery'], function (main, jQuery) {
    main.start(jQuery);
});
