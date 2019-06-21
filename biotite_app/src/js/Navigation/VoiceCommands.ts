// import * as jQuery from "../jQuery";
import * as Optimizations from "../Scene/Optimizations";
import * as Vars from "../Vars";
import * as Navigation from "./Navigation";

declare var annyang;
declare var Fuse;
declare var BABYLON;
declare var jQuery;

export let moleculeNameInfos;

let uniqModelNames = [];
let uniqRepresentations = [];
// let uniqModelNamesFuseLib;
// let uniqRepresentationsFuseLib;
let isAnnyangAlreadyLoaded = false;
let alreadyGaveInstructions = false;

/**
 * Setup the voice commands.
 * @param  {*} data
 * @returns void
 */
export function setup(data): void {
    if (!isAnnyangAlreadyLoaded) {
        // Not loaded yet, so first load javascript
        jQuery.getScript("js/annyang.min.js", () => {
            _setup(data);
            isAnnyangAlreadyLoaded = true;
        });
    } else {
        // Javascript file is already loaded.
        _setup(data);
    }
}

function _setup(data) {
    let commands = {};

    // Populates the moleculeNameInfos variable if necessary.
    if (moleculeNameInfos === undefined) {
        setMoleculeNameInfos(data);
    }

    // Populate hide and show commands.
    for (let i = 0; i < 3; i++) {
        let cmd = ["hide", "show", "high"][i];
        let isVisible = cmd === "show";

        for (let modelNameIdx in uniqModelNames) {
            if (uniqModelNames.hasOwnProperty(modelNameIdx)) {
                let modelName = uniqModelNames[modelNameIdx];
                if (modelName !== "") {
                    commands[cmd + " " + modelName] = () => {
                        interpretHideShowCommands([modelName], isVisible);
                    };
                }
            }
        }

        for (let repIdx in uniqRepresentations) {
            if (uniqRepresentations.hasOwnProperty(repIdx)) {
                let rep = uniqRepresentations[repIdx];
                if (rep !== "") {
                    commands[cmd + " " + rep] = () => {
                        interpretHideShowCommands([rep], isVisible);
                    };
                }
            }
        }

        for (let modelNameIdx in uniqModelNames) {
            if (uniqModelNames.hasOwnProperty(modelNameIdx)) {
                let modelName = uniqModelNames[modelNameIdx];
                if (modelName !== "") {
                    for (let repIdx in uniqRepresentations) {
                        if (uniqRepresentations.hasOwnProperty(repIdx)) {
                            let rep = uniqRepresentations[repIdx];
                            if (rep !== "") {
                                commands[cmd + " " + modelName + " " + rep] = () => {
                                    interpretHideShowCommands([modelName, rep], isVisible);
                                };
                            }
                        }
                    }
                }
            }
        }

        // Make "surface" work, like "surfaces".
        commands[cmd + " surface"] = () => { interpretHideShowCommands(["Surfaces"], isVisible); };
    }

    // Add teleport commands.
    commands["teleport"] = () => { Navigation.actOnStareTrigger(); };
    commands["click"] = () => { Navigation.actOnStareTrigger(); };
    commands["move"] = () => { Navigation.actOnStareTrigger(); };
    commands["look"] = () => { Navigation.actOnStareTrigger(); };
    commands["hiya"] = () => { Navigation.actOnStareTrigger(); };

    if (annyang) {
        annyang.debug();
        annyang.removeCommands();
        annyang.addCommands(commands);
        // annyang.start({ "autoRestart": true });

        // Commented out below because people might also be having
        // conversations while using the system...
        // annyang.addCallback("resultNoMatch", (userSaid, commandText, phrases) => {
        //    speech.speak("Sorry, I didn't understand.");
        // });

        annyang.start();
    }

    // Let the user know what voice commands are available.
    if (!alreadyGaveInstructions) {
        speech.speak("The show and hide commands control visualization. For example, " +
              "show proteen or hide ribbon. The teleport command moves your " +
              "position to the stair point sphere.");
        alreadyGaveInstructions = true;
    }
}

/**
 * Capitalize a string.
 * @param  {string} strng The original string.
 * @returns string  The capitalized string.
 */
function capitalize(strng: string): string {
    return strng.substring(0, 1).toUpperCase() + strng.substring(1);
}

/**
 * Converts an objID (from data) to a key for moleculeNameInfos. Effectively,
 * this discards the info about the component (protein vs. compound)
 * @param  {string}            objID From data.
 * @returns Object<string, *>  The converted string.
 */
function objIDToMolNameInfo(objID: string): any {
    let txtStr = objID.replace(/.sdf/g, "").replace(/.pdb/g, "");
    txtStr = txtStr.replace(/.wrl/g, "");
    txtStr = txtStr.replace(/surfaces/g, "Surfaces");
    let prts = txtStr.split("_");
    let modelName = prts[0];
    if (modelName === "Surfaces") {
        return {
            key: "Surfaces",
            modelName,
            representation: "",
        };
    } else {
        let desc = prts[1].replace(/[A-Z]/g, (match) => {
            return "_" + match;
        });
        let descPrts = desc.split(/_/g);
        // let component = descPrts[0];  // This will be ignored in the end.
        let representation = descPrts[1];

        modelName = capitalize(modelName);
        representation = capitalize(representation);
        let key = modelName + "_" + representation;
        return {
            key,
            modelName,
            representation,
        };
    }
}

/**
 * Poplutes moleculeNameInfos.
 * @param  {Object<string,*>} data Data about the molecules.
 * @returns void
 */
export function setMoleculeNameInfos(data: any): void {
    moleculeNameInfos = {};

    for (let idx in data["objIDs"]) {
        if (data["objIDs"].hasOwnProperty(idx)) {
            let objID = data["objIDs"][idx];
            let inf = objIDToMolNameInfo(objID);

            if (moleculeNameInfos[inf.key] === undefined) {
                moleculeNameInfos[inf.key] = {
                    description: inf.key.replace(/_/g, " "),
                    meshNames: [],
                    modelName: inf.modelName,
                    representation: inf.representation,
                };
            }
            moleculeNameInfos[inf.key].meshNames.push(objID);
            if (uniqModelNames.indexOf(inf.modelName) === -1) {
                uniqModelNames.push(inf.modelName);
            }
            if (uniqRepresentations.indexOf(inf.representation) === -1) {
                uniqRepresentations.push(inf.representation);
            }
        }
    }

    // uniqRepresentationsFuseLib = new Fuse(uniqRepresentations, {});
    // uniqModelNamesFuseLib = new Fuse(uniqModelNames, {});
}

// function hideVoiceCommands(cmds: string) {

// }

// function showModelFunc(modelName: string, representation: string) {
//     let correctedModelName = uniqModelNames[uniqModelNamesFuseLib.search(modelName)];
//     let correctedRepresentation = uniqRepresentations[uniqRepresentationsFuseLib.search(representation)];
//     showOrHideModel(correctedModelName, correctedRepresentation, true);
// };

// function hideModelFunc(modelName: string, representation: string) {
//     let correctedModelName = uniqModelNames[uniqModelNamesFuseLib.search(modelName)];
//     let correctedRepresentation = uniqRepresentations[uniqRepresentationsFuseLib.search(representation)];
//     showOrHideModel(correctedModelName, correctedRepresentation, false);
// };

// function showSurfacesFunc() {
//     showOrHideModel("Surfaces", "", true);
// }

// function hideSurfacesFunc() {
//     showOrHideModel("Surfaces", "", false);
// }

// function doListsIntersect(lst1: any[], lst2: any[]): boolean {
//     let intersection = [];
//     for (let i1 in lst1) {
//         if (lst1.hasOwnProperty(i1)) {
//             let item1 = lst1[i1];
//             let inLst2 = false;
//             for (let i2 in lst2) {
//                 if (lst2.hasOwnProperty(i2)) {
//                     let item2 = lst2[i2];
//                     if (item1 === item2) {
//                         inLst2 = true;
//                         break;
//                     }
//                 }
//             }
//             if (inLst2) {
//                 intersection.push(item1);
//             }
//         }
//     }

//     return intersection.length > 0;
// }

function isLst1SubsetOfLst2(lst1: any[], lst2: any[]): boolean {
    for (let i1 in lst1) {
        if (lst1.hasOwnProperty(i1)) {
            let item1 = lst1[i1];
            if (lst2.indexOf(item1) === -1) {
                // It is not in the second list!
                return false;
            }
        }
    }

    return true;
}

export function interpretHideShowCommands(filterWrds: string[], isVisible: boolean) {
    // Go through all the keys and remove the ones that don't match the words.
    for (let i in moleculeNameInfos) {
        if (moleculeNameInfos.hasOwnProperty(i)) {
            let moleculeNameInfo = moleculeNameInfos[i];
            if (isLst1SubsetOfLst2(filterWrds,
                                   [moleculeNameInfo.modelName,
                                    moleculeNameInfo.representation])) {

                showOrHideModel(
                    moleculeNameInfo.modelName,
                    moleculeNameInfo.representation,
                    isVisible,
                );
            }
        }
    }

    // if (isVisible) {
    //     speech.speak("Ok, shown.");
    // } else  {
    //     speech.speak("Ok, hidden.");
    // }
}

export function showOrHideModel(modelName: string, representation: string, isVisible: boolean): void {
    let key = capitalize(modelName);
    if (representation !== "") {
        key += "_" + capitalize(representation);
    }

    // Remember there could be multiple meshes associated with a given key.
    // (For example, if voice command is to hide "protein"). So you need to
    // look through everything that matches.
    for (let idx in moleculeNameInfos[key].meshNames) {
        if (moleculeNameInfos[key].meshNames.hasOwnProperty(idx)) {
            let meshName = moleculeNameInfos[key].meshNames[idx];
            let mesh = Vars.scene.getMeshByName(meshName);

            mesh.isVisible = isVisible;

            // console.log(mesh.name);
            // if (isVisible) {
                // So you're making it visible.
                // BABYLON.Animation.CreateAndStartAnimation(
                    // meshName + "fadein", mesh, "visibility", 30, 220, 0.0, 1.0,
                // );

                // mesh.visibility = 0.5;
            // }
        }
    }
    Optimizations.updateEnvironmentShadows();
}

// function speak (message) {
//     if (annyang) { annyang.abort(); }

//     // Modified from https://devhints.io/js-speech and
//     // https://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working
//     // speechSynthesis.cancel();

//     // Necessary to avoid garable-collection bug. See
//     // https://stackoverflow.com/questions/23483990/speechsynthesis-api-onend-callback-not-working
//     window.utterances = [];
//     let msg = new SpeechSynthesisUtterance(message);
//     window.utterances.push(msg);

//     let voices = window.speechSynthesis.getVoices();
//     msg.voice = voices[0];
//     msg.onend = (event) => {
//         console.log("resuming...");
//         if (annyang) { annyang.start(); }
//     };

//     console.log("You; can;t trust onend. After a onInterval, you should check; if it hasn;;t; turned; on; and; turn; it; on; if needed. I think; the;");

//     window.speechSynthesis.speak(msg);
// }

/**
 * Stops the voice-command listening.
 * @returns void
 */
export function stopVoiceCommands(): void {
    annyang.abort();
}

class Speech {
    // This class adapted from https://codepen.io/anon/pen/qNwOAO and
    // https://stackoverflow.com/questions/29522985/preloading-web-speech-api-before-calling-speak
    private voices = null;

    constructor() {
        jQuery(document).ready(() => {
            if ("speechSynthesis" in window) {
                // First call to getVoices may be null...later an event indicates when it is loaded
                this.voices = window.speechSynthesis.getVoices();

                // Save voices when loaded after first call
                window.speechSynthesis.onvoiceschanged = () => {
                    this.voices = window.speechSynthesis.getVoices();
                };
            }
        });
    }

    public supported(): boolean {
        return this.voices !== null;
    }

    public speak(text: string): void {
        if (this.voices !== null) {
            let speechSynthesisUtterance = new SpeechSynthesisUtterance(text);

            speechSynthesisUtterance.rate = 1;

            // console.log(this.voices.map((v) => v.name));

            // Prefer Samantha if available.
            let samanthaVoice = this.voices.filter((voice) => {
                return voice.name.toUpperCase().indexOf("SAMANTHA") > -1;
            });
            if (samanthaVoice.length > 0) {
                speechSynthesisUtterance.voice = samanthaVoice[0];
            }

            speechSynthesisUtterance.lang = "en";
            speechSynthesisUtterance.volume = 1;

            // Step speak recognition while speaking
            if (annyang) { annyang.abort(); }

            window.speechSynthesis.speak(speechSynthesisUtterance);

            // Start it again in a bit.
            setTimeout(() => {
                if (annyang) { annyang.start(); }
            }, 2000);
          }
    }
}
let speech = new Speech();

// $("#button1").on("click", function() {
//   let speech = new Speech();

//   if (speech.supported()) {
//     speech.speak($("input").val());
//   }
// });
