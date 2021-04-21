// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2021 Jacob D. Durrant.

import * as LoadAndSetup from "./components/Scene/LoadAndSetup";
// import 'bootstrap';
// import 'bootstrap/dist/css/bootstrap.min.css';

import * as UrlVars from "./components/Vars/UrlVars";
import * as Vars from "./components/Vars/Vars";
import * as ServiceWorker from "./components/System/ServiceWorker";
import * as GoogleAnalytics from "./components/System/GoogleAnalytics";
import * as DeviceOrientation from "./components/System/DeviceOrientation";
import * as Plugins from "./components/Plugins/Plugins";
import * as LoadAllVue from "./components/UI/Vue/LoadAllVue";
import * as Debugging from "./components/System/Debug/Debugging";
import * as MonitorLoadFinish from "./components/System/MonitorLoadFinish";
import { setupHooks } from "./components/Plugins/Hooks/Hooks";
// import * as PromiseStore from "./components/PromiseStore";

// @ts-ignore
window["jq"] = jQuery;

// Report version
console.log("ProteinVR " + Vars.VERSION);

// @ts-ignore
console.log("Compiled on " + BUILD_TIMESTAMP);
document.title = "ProteinVR " + Vars.VERSION;

// Wrapping everything in debug (include "pvr_do_debug" in url to enable).
// Comment out appropriate block in Debugging.ts for production.
Debugging.enableDebugging().then(() => {
    // Mark load not yet finished. Will be unset once model loads.
    MonitorLoadFinish.incrementLoadCounter();

    // Setup service worker
    ServiceWorker.setupServiceWorker();

    setupHooks();

    // Load in plugins
    Plugins.loadAll();

    // Get environment name (why needed here?)
    UrlVars.readEnvironmentNameParam();

    // Load VueJS system. You will need it whether you throw a
    // device-orientation error or if you proceed to the full system.
    LoadAllVue.load();

    // It is unfortunately necessary to explicitly request device orientation
    // on iOS13.
    DeviceOrientation.requestDeviceOrientation();

    // Begin loading
    LoadAndSetup.load();

    // PromiseStore.waitFor(["LoadMolecule"]).then(() => {
    //     alert("done");
    //     debugger;
    // });

    // Let google analytics know if running from durrantlab server.
    GoogleAnalytics.setupGoogleAnalyticsIfDurrantLab();
});
