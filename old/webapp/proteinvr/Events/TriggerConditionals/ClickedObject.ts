import parent from "./TriggerConditionalParent";
import * as MouseState from "../../Core/MouseState";

declare var BABYLON;
declare var PVRGlobals;
var jQuery = PVRGlobals.jQuery;


interface CheckInterface{
    triggerMesh: any;
    action: any;
}

class ClickedObject extends parent {
    public canvasJQuery = undefined;

    constructor(params: CheckInterface){
        /**
         * This is the constructor.
         * 
         * :param CheckInterface params: The expected parameters for this module
         */
        super(params);

        //assign parameters to variables because 'this' refers to the render canvas inside ananymous function
        let target = this.parameters['triggerMesh'];
        let action = this.parameters['action'];

        // There's a new click detection system. Use that here...
        MouseState.mouseClickDownFunctions.push(function(results) {
            if (results.mesh == target) {
                console.log('mesh clicked!');

                action.do(results.worldLoc);

            }
        });
    }

    /**
     * this method is not used because of the asynchronous nature of the triggerMesh
     * 
     * In place of a boolean method, the action is triggered from an event listener within the constructor
     */
    public checkIfTriggered() :boolean {
        return true;
    }
}

export default ClickedObject;