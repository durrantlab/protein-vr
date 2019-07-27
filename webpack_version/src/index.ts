import * as SceneLoader from "./components/Scene/LoadAndSetup";
import 'bootstrap';
import * as Styles from "./styles/style.css";

document.getElementById("renderCanvas").classList.add(Styles.renderCanvas);
document.getElementById("bdy").classList.add(Styles.htmlBody);
document.getElementById("loadingContainer").classList.add(Styles.loadingContainer);
document.getElementById("loading").classList.add(Styles.htmlBody);


SceneLoader.load();




// import * as test from "./test";
// import { Vector3 } from "../node_modules/@babylonjs/core/Maths/math";
// import * as BabylonSetup from "./components/BabylonSetup";
// import * as Ground from "./components/Ground/Ground";
// import * as Water from "./components/Water";
// import * as Skybox from "./components/Skybox";
// import * as Lights from "./components/Lights";
// import * as BABYLON from "../node_modules/babylonjs/babylon";

// declare var $: any;

// function start(): void {
//     BabylonSetup.setup();
//     Lights.setup(new BABYLON.Vector3(100, 0, 0));

//     Ground.generate({
//         minX: -100,
//         maxX: 100,
//         minY: -100,
//         maxY: 100,
//         resolution: 512+1,
//         minHeight: 0,
//         maxHeight: 50,
//         randomSeed: 5
//     });

//     Skybox.setup();
//     Water.setup();

//     setTimeout(() => {console.log(Skybox.skyBoxMesh)}, 5000);



// //   const element = document.createElement('div');

//   // Lodash, currently included via a script, is required for this line to work
//   // element.innerHTML = _.join(['Hello', 'webpack'], ' ');
// //   test.moose();

// //   element.innerHTML = `<input type="text"><span id="moose" class="${styles.moose}">Hello. I am a strange person.</span>`

// //   $("#moose").html("yoyo");
// // $(document).ready(() => {
// //     console.log($("#moose").html("DFdf"));
// // })
// //   alert("hello");

// // console.log(Vector3);

// //   return element;
// }

// // document.body.appendChild(component());

// start();
