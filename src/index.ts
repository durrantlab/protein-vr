// Copyright 2019 Jacob D. Durrant

import * as LoadAndSetup from "./components/Scene/LoadAndSetup";
import 'bootstrap';
import * as UrlVars from "./components/Vars/UrlVars";
import * as Vars from "./components/Vars/Vars";

// Report version
console.log("ProteinVR " + Vars.VERSION);
document.title = "ProteinVR " + Vars.VERSION;

// Get server workers (for progressive web app). Makes for better experience,
// especially on iOS. See
// https://webpack.js.org/guides/progressive-web-application/
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register(
            'service-worker.js',
            {scope: './'}
        ).then(registration => {
            console.log('SW registered: ', registration);
        }).catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
        });
    });
}

UrlVars.readEnvironmentNameParam();

LoadAndSetup.load();
