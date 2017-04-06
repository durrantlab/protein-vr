import parent from "./TriggerConditionalParent";

declare var BABYLON;
declare var jQuery;


interface CheckInterface{
    triggerMesh: any;
    action: any;
}

class ClickedObject extends parent {
    public canvasJQuery = undefined;

    constructor(params: CheckInterface, Core :any){
        /**
         * This is the constructor.
         * 
         * :param CheckInterface params: The expected parameters for this module
         */
        super(params);

        //assign parameters to variables because 'this' refers to the render canvas inside ananymous function
        let target = this.parameters['triggerMesh'];
        let action = this.parameters['action'];
        jQuery('#renderCanvas').click(function(){
            let pickResult = Core.scene.pick(Core.scene.pointerX, Core.scene.pointerY);
            console.log('Something was clicked!');
            console.log(Core.meshesByName);
            if(pickResult.hit) {
                console.log(pickResult.pickedMesh);
                console.log(pickResult.pickedPoint);
            }
            if (pickResult.pickedMesh == target) {
                console.log('mesh clicked!');
                action.do(jQuery, pickResult);
            }
        });
    }

    /**
     * this method is not used because of the asynchronous nature of the triggerMesh
     * 
     * In place of a boolean method, the action is triggered from an event listener within the constructor
     */
    public check() :boolean {
        return true;
    }
}

export default ClickedObject;