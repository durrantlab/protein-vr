import * as Parent from "../LoadSaveParent";
// import { PanelComponent, setAssociatedPlugin } from "./PanelComponent.ts.delme";
import * as LoadSaveUtils from "../LoadSaveUtils";

// @ts-ignore
import {templateHtml} from "./PanelComponent.template.htm.ts";

export class LoadPdbSdfText extends Parent.LoadSaveParent {
    public pluginTitle = "Text<div class='emoji'>📂</div>";
    public pluginSlug = "pdb-sdf-text";
    public tag = "pdb-sdf-text-panel";

    public methods = {
        /**
         * Starts the load process on button click.
         * @returns void
         */
        "startLoad"(): void {
            this.startLoadOrSave(this["fileContents"]);
        },

        /**
         * Runs when the user starts the load process.
         * @param  {*} [pdbSdfText=undefined]  Any data to pass to the load/save
         *                                     process.
         * @returns void
         */
        startLoadOrSave(pdbSdfText: any = undefined): void {
            LoadSaveUtils.shadowsHardwareScalingVueXToLocalStorage();
            LoadSaveUtils.loadPdbOrSdfFromFile(pdbSdfText);
        },

        /**
         * Fires when the pdb or url text changes.
         * @param  {string} txt  The new text.
         * @returns void
         */
        "onChangeText"(txt: string): void {
            this["fileContents"] = txt;
        },

        /**
         * Populate the text field with a sample SDF file.
         * @returns void
         */
        "addSdfText"(): void {
            this["fileContents"] = `85871450
Basketeen

 20 24  0  0  1  0  0  0  0  0999 V2000
    1.8163    0.0643   -0.3187 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.9502   -0.1106   -1.0129 C   0  0  0  0  0  0  0  0  0  0  0  0
    3.0493   -1.4466   -1.6124 C   0  0  3  0  0  0  0  0  0  0  0  0
    2.8864   -2.6320   -0.6396 C   0  0  3  0  0  0  0  0  0  0  0  0
    2.1100   -3.3634   -1.7367 C   0  0  3  0  0  0  0  0  0  0  0  0
    0.8342   -3.1834   -0.9426 C   0  0  3  0  0  0  0  0  0  0  0  0
    1.5544   -2.4024    0.1526 C   0  0  3  0  0  0  0  0  0  0  0  0
    0.9047   -1.0902   -0.3937 C   0  0  3  0  0  0  0  0  0  0  0  0
    0.5816   -1.8517   -1.6740 C   0  0  3  0  0  0  0  0  0  0  0  0
    1.8897   -2.0166   -2.4489 C   0  0  3  0  0  0  0  0  0  0  0  0
    1.6310    0.9143    0.3130 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.7693    0.5873   -0.9838 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.9863   -1.5138   -2.1827 H   0  0  0  0  0  0  0  0  0  0  0  0
    3.7402   -3.1286   -0.1811 H   0  0  0  0  0  0  0  0  0  0  0  0
    2.4383   -4.2688   -2.2256 H   0  0  0  0  0  0  0  0  0  0  0  0
    0.1034   -3.9525   -0.7351 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.4794   -2.7188    1.1907 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.0759   -0.7414   -0.0442 H   0  0  0  0  0  0  0  0  0  0  0  0
   -0.3861   -1.7892   -2.1622 H   0  0  0  0  0  0  0  0  0  0  0  0
    1.8708   -1.9602   -3.5344 H   0  0  0  0  0  0  0  0  0  0  0  0
  1  2  2  0  0  0  0
  1  8  1  0  0  0  0
  1 11  1  0  0  0  0
  2  3  1  0  0  0  0
  2 12  1  0  0  0  0
  3  4  1  0  0  0  0
  3 10  1  0  0  0  0
  3 13  1  0  0  0  0
  4  5  1  0  0  0  0
  4  7  1  0  0  0  0
  4 14  1  0  0  0  0
  5  6  1  0  0  0  0
  5 10  1  0  0  0  0
  5 15  1  0  0  0  0
  6  7  1  0  0  0  0
  6  9  1  0  0  0  0
  6 16  1  0  0  0  0
  7  8  1  0  0  0  0
  7 17  1  0  0  0  0
  8  9  1  0  0  0  0
  8 18  1  0  0  0  0
  9 10  1  0  0  0  0
  9 19  1  0  0  0  0
 10 20  1  0  0  0  0
M  END
$$$$`;
        }
    };

    public computed = {};

    public props = {};

    public watch = {};

    public template = templateHtml;

    public vueXStore = {
        state: {},
        mutations: {}
    }

    /**
     * Returns the data associated with this component.
     * @returns * The data object.
     */
    public data = function(): any {
        return {
            "fileContents": ""
        };
    }

    /**
     * Function that runs when Vue component loaded.
     */
    public mounted = function(): void {};
}
