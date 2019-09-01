import * as SceneLoader from "./components/Scene/LoadAndSetup";
import 'bootstrap';
import * as Styles from "./styles/style.css";
import * as UrlVars from "./components/Vars/UrlVars";

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

document.getElementById("renderCanvas").classList.add(Styles.renderCanvas);
document.getElementById("container").classList.add(Styles.container);

UrlVars.readEnvironmentNameParam();

SceneLoader.load();
