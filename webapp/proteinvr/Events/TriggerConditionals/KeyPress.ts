import parent from "./TriggerConditionalParent";

declare var BABYLON;
declare var jQuery;

interface CheckInterface{
    event: string;
    action: any;
}

class KeyPress extends parent {
    public canvasJQuery = undefined;

    constructor(params: CheckInterface){
        /**
         * This is the constructor.
         * 
         * :param CheckInterface params: The expected parameters for this module
         */
        super(params);

        //listen for keypress event
        let action = this.parameters["action"];
        document.addEventListener(this.parameters['event'], function listener(event :KeyboardEvent){
            // call action event
            action.do();
        });
    }

    
    public check() :boolean{
        /**
         * This method is effectively useless, only kept here because it is required to extend TriggerConditionalParent
         * This method should not be executed, all logic is contained in the constructor
         * 
         * :returns: true
         * :rtype: :boolean:
         */
    
        console.log("Entered check function");
        return true;
    }
}

export default KeyPress;