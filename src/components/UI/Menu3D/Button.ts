// This file is part of ProteinVR, released under the 3-Clause BSD License.
// See LICENSE.md or go to https://opensource.org/licenses/BSD-3-Clause for
// full details. Copyright 2019 Jacob D. Durrant.


import * as Pickables from "../../Navigation/Pickables";
import * as Vars from "../../Vars/Vars";
import * as Menu3D from "./Menu3D";

declare var BABYLON: any;

const btnScale = new BABYLON.Vector3(0.75, 0.75, 0.75);

interface IButtonWrapper {
    panel: any;
    trueTxt: string;
    falseTxt: string;
    default: boolean;
    name: string;
    clickFunc: any;
    initFunc?: any;
    level: number;
    color?: string;
}

export class ButtonWrapper {
    /** @type {Function} */
    public clickFunc: any;

    public button: any;

    /** @type {number} */
    public level: number;

    /** @type {boolean} */
    public value: boolean;

    private textBlock: any;

    /** @type {string} */
    private trueTxt: string;

    /** @type {string} */
    private falseTxt: string;

    private containingMesh: any;
    private defaultMat: any;
    private greenMat: any;
    private yellowMat: any;
    private redMat: any;

    /**
     * The constructor.
     * @param  {Object<string,*>} params
     * @constructor
     */
    constructor(params: IButtonWrapper) {
        // Make the button
        this.button = new BABYLON.GUI.HolographicButton(params.name);
        params.panel.addControl(this.button);

        // Make the possible materials (different colors).
        this.makeColorMats();

        // Change button color if appropriate.
        if (params.color !== undefined) {
            this.updateColor(params.color);
        }

        // Save the level.
        this.level = params.level;

        // Make a text block
        this.textBlock = new BABYLON.GUI.TextBlock();
        this.textBlock.color = "white";
        this.textBlock.resizeToFit = true;

        // Save the value and text, etc.
        this.value = params.default;
        this.trueTxt = params.trueTxt;
        this.falseTxt = params.falseTxt;
        this.clickFunc = params.clickFunc;

        // Update the text.
        this.updateTxt();

        this.button.scaling = btnScale.clone();

        // Make the button clickable. No. It is the sphere that will trigger
        // this... So commented out.
        // this.button.onPointerClickObservable.add((e) => {
            // this.toggled();
        // });

        // Make a mesh that surrounds the button. It actually triggers the
        // click.
        this.containingMesh = BABYLON.Mesh.CreateSphere(
            params.name + "-container-mesh", 2, Vars.BUTTON_SPHERE_RADIUS, Vars.scene,
        );
        this.containingMesh.position = this.button.node.absolutePosition;
        this.containingMesh.visibility = 0;
        this.containingMesh.scaling = btnScale.clone();

        // Add a clicking function to the mesh.
        this.containingMesh.clickFunc = () => {
            this.toggled();
        };

        // Add the mesh to the list of ones that are pickable.
        Pickables.addPickableButton(this.containingMesh);

        if (params.initFunc !== undefined) {
            params.initFunc(this);
        }
    }

    /**
     * Updates the button color.
     * @param color string
     */
    public updateColor(color: string): void {
        switch (color) {
            case "default":
                this.button.mesh.material = this.defaultMat;
                break;
            case undefined:  // Also default
                this.button.mesh.material = this.defaultMat;
                break;
            case "green":
                this.button.mesh.material = this.greenMat;
                break;
            case "yellow":
                this.button.mesh.material = this.yellowMat;
                break;
            case "red":
                this.button.mesh.material = this.redMat;
                break;
            default:
        }
    }

    /**
     * Determines if this button is visible.
     * @param  {boolean} [val=] Whether this button is visible.
     * @returns void
     */
    public isVisible(val?: boolean): void {
        if (val === undefined) {
            // A getter
            return this.button.isVisible;
        } else {
            // A setter. Note that this doesn't affect visibility on meshes
            // (they could be entirely transparent).
            this.button.isVisible = val;
            this.containingMesh.isVisible = val;
        }
    }

    /**
     * Toggle whether this button is visible.
     * @returns void
     */
    public toggled(): void {
        // Play the sound.
        Menu3D.clickSound.setPosition(this.containingMesh.position.clone());
        Menu3D.clickSound.play();

        // Switch value.
        /** @type {boolean} */
        this.value = !this.value;

        // Fire the user-defined trigger.
        this.clickFunc(this);

        // Update the text.
        this.updateTxt();
    }

    /**
     * Sets the text on this button.
     * @param {string=} txt  The text to update. If undefined, gets it based
     *                       on the value, trueTxt, and falseTxt variables.
     * @returns void
     */
    public updateTxt(txt?: string): void {
        if (txt === undefined) {
            this.textBlock.text = this.value ? this.trueTxt : this.falseTxt;
        } else {
            this.textBlock.text = txt;
            this.trueTxt = txt;
            this.falseTxt = txt;
        }

        this.textBlock.text = this.wrap(this.textBlock.text, 25);

        this.button.content.dispose();
        this.button.content = this.textBlock;
    }

    /**
     * Wrap the text to keep it from getting too long.
     * @param {stirng} s  The string to wrap.
     * @param {number} w  The width.
     * @returns {string} The wrapped text.
     */
    private wrap(s: string, w: number): string {
        return s.replace(
            new RegExp(`(?![^\\n]{1,${w}}$)([^\\n]{1,${w}})\\s`, "g"), "$1\n",
        );
    }

    /**
     * Make variously colored materials for the different kinds of menu
     * buttons.
     * @returns void
     */
    private makeColorMats(): void {
        /** @const {number} */
        const colorDelta = 0.1;

        this.defaultMat = this.button.mesh.material;

        this.greenMat = this.button.mesh.material.clone();
        this.greenMat.albedoColor = new BABYLON.Color3(0.3, 0.35 + colorDelta, 0.4);

        this.yellowMat = this.button.mesh.material.clone();
        this.yellowMat.albedoColor = new BABYLON.Color3(0.3 + colorDelta, 0.35 + colorDelta, 0.4);

        this.redMat = this.button.mesh.material.clone();
        this.redMat.albedoColor = new BABYLON.Color3(0.3 + colorDelta, 0.35, 0.4);
    }
}
