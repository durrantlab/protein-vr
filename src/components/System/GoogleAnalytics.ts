// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.

// Send info to google analytics if running from durrantlab.com.

declare var ga;

/**
 * Sets up google analytics if running from durrant-lab servers.
 * @returns void
 */
export function setupGoogleAnalyticsIfDurrantLab(): void {
    // If the url has "durrantlab" in it, contact google analytics. Logging all
    // usage would be ideal for grant reporting, but some users may wish to run
    // versions of proteinvr on their own servers specifically to maintain privacy
    // (e.g., in case of proprietary data). Calls to google analytics in such
    // scenarios could be alarming, even though I'm only recording basic
    // demographics anyway.
    if (window.location.href.indexOf("durrantlab") !== -1) {
        setTimeout(() => {
            // Just to make sure it isn't blocking...
            (function(i, s, o, g, r, a, m) {
                i['GoogleAnalyticsObject'] = r;
                i[r] = i[r] || function() {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * new Date().getTime();
                a = s.createElement(o);
                m = s.getElementsByTagName(o)[0];
                a.async = 1;
                a.src = g;
                m.parentNode.insertBefore(a, m)
            })(window, document, 'script', 'https://www.google-analytics.com/analytics.js', 'ga');
            ga('create', 'UA-144382730-1', {
                'name': 'proteinvr'
            });

            // Remove anything after "?" (to avoid identifying what users are
            // specifically looking at).
            let eventLabel = window.location.href;
            if (eventLabel.indexOf("?") !== -1) {
                eventLabel = eventLabel.split("?")[0] + "?PARAMS_REMOVED"
            }

            // UA-144382730-1 reports to pcaviz account.
            ga('proteinvr.send', {
                "hitType": 'event',
                "eventCategory": 'proteinvr',
                "eventAction": 'pageview',
                "eventLabel": eventLabel
            });
        }, 0)
    }
}
