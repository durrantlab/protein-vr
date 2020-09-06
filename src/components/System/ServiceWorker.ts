/**
 * Sets up the service worker.
 * @returns void
 */
export function setupServiceWorker(): void {
    // Get server workers (for progressive web app). Makes for better experience,
    // especially on iOS. See
    // https://webpack.js.org/guides/progressive-web-application/
    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register(
                "service-worker.js",
                {scope: "./"}
            ).then(registration => {
                console.log("SW registered: ", registration);
            }).catch(registrationError => {
                console.log("SW registration failed: ", registrationError);
            });
        });
    }
}
