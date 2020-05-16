// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

import * as LoadAndSetup from "./components/Scene/LoadAndSetup";
import 'bootstrap';
import * as UrlVars from "./components/Vars/UrlVars";
import * as Vars from "./components/Vars/Vars";
import * as ServiceWorker from "./components/System/ServiceWorker";
import * as GoogleAnalytics from "./components/System/GoogleAnalytics";
import * as DeviceOrientation from "./components/System/DeviceOrientation";
import * as Plugins from "./components/Plugins/Plugins";

// Report version
console.log("ProteinVR " + Vars.VERSION);
document.title = "ProteinVR " + Vars.VERSION;

// Setup service worker
ServiceWorker.setupServiceWorker();

// Load in plugins
Plugins.loadAll();

// Get environment name (why needed here?)
UrlVars.readEnvironmentNameParam();

// It is unfortunately necessary to explicitly request device orientation on
// iOS13.
DeviceOrientation.requestDeviceOrientation();

// Begin loading
LoadAndSetup.load();

// Let google analytics know if running from durrantlab server.
GoogleAnalytics.setupGoogleAnalyticsIfDurrantLab();
