import parent from "./TriggerConditionalParent";

declare var BABYLON;
declare var jQuery;

class KeyPress extends parent {
    public canvasJQuery = undefined;

    constructor(params: any){
        super(params);
    }

    public check() :boolean{
        let keyPressed = false;
        this.canvasJQuery = jQuery("#renderCanvas");
        
        keyPressed = this.canvasJQuery.keypress(function(){
            return true;
        });

        return keyPressed;
    }
}