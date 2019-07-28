import * as SceneLoader from "./components/Scene/LoadAndSetup";
import 'bootstrap';
import * as Styles from "./styles/style.css";

document.getElementById("renderCanvas").classList.add(Styles.renderCanvas);
document.getElementById("container").classList.add(Styles.container);

SceneLoader.load();
