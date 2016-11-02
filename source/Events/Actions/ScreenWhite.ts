import Timers from "../Timers";
import parent from "./ActionParent";

declare var BABYLON;
declare var jQuery;

// interface DoInterface {
//     mesh: any;
//     milliseconds: number;
// }

/**
 * A class to fade the screen to white.
 */
class ScreenWhite extends parent {

    public canvasJQuery = undefined;

    /**
     * The constructor.  super(params) passes params to the parent class'
     *     constructor.
     * @param  {DoInterface} params The parameters for this class. Use an
     *                              interface to make sure the correct 
     *                              parameters are always used.
     */
    constructor(params) { // : DoInterface) {
        super(params);
    }

    /**
     * Perform the action.
     */
    public do(): void {
        // Fog suddenly gets thicker.
        //this.scene().FOGMODE_EXP2;
        this.canvasJQuery = jQuery("#renderCanvas");

        Timers.addTimer({
            name: "ScreenWhite" + Math.random().toString(),
            durationInMiliseconds: 200, //milliseconds,
            interpValStart: 1.0,
            interpValEnd: 0.0,
            tickCallback: function(val) {
                // this.material.alpha = val;
                //this.customShader.alpha = val;
                //this.scene().fogDensity = val;
                this.canvasJQuery.css("opacity", val);

            }.bind(this),
            doneCallback: function() {
                // this.material.alpha = 0;
                //this.customShader.alpha = 0;
                //this.material.alphaMode = BABYLON.Engine.ALPHA_COMBINE;
                //this.scene().fogDensity = 10.0;
                this.canvasJQuery.css("opacity", 1);
            }.bind(this)
        });
    }
}

export default ScreenWhite;
