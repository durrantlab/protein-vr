///<reference path="Definitions/require.d.ts" />

// Certain variables/namespaces should be available from everywhere. Attached
// them to the window.
interface MyWindow extends Window {
    Core: any;
    jQuery: any;
}
declare var window: MyWindow;

// requirejs configuration file
require.config({
    paths: {
        jquery: 'https://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min'
    },
    urlArgs: "bust=" + (new Date()).getTime()
});

// This require function starts the app
require(['../main', 'jquery', "./Core/Core", "./Core/Setup"], (main, jQuery, Core, Setup) => {
    window.Core = Core.default;  // not sure why the default is needed here.
    window.jQuery = jQuery;
    let setEvents = main.start();

    // Setup the VR program.
    Setup.default.setup(setEvents);  // again with the default. Why needed?

    // console.log("Sys vars should be setup!");
    // console.log(UserVars);


});