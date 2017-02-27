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
        super(params);

        //listen for keypress event
        let action = this.parameters["action"];
        document.addEventListener(this.parameters['event'], function listener(event :KeyboardEvent){
            // call action event
            action.do();
        });
    }

    /*
        This method is effectively useless, only kept here because it is required to extend TriggerConditionalParent
    */
    public check() :boolean{
        console.log("Entered check function");
        return true;
    }
}

export default KeyPress;