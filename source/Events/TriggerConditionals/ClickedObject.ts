import parent from "./TriggerConditionalParent";

declare var BABYLON;
declare var jQuery;

class ClickedObject extends parent {
    public canvasJQuery = undefined;

    constructor(params){
        super(params);
    }

    public check() :boolean {
        let picked = false;
        this.canvasJQuery = jQuery("#renderCanvas");

        let pickResult = this.canvasJQuery.click(function(){
            this.canvasJQuery.pick(this.canvasJQuery.pointerX, this.canvasJQuery.pointerY);
        });

        if (pickResult.pickedMesh) {
            picked = true;
        }
        return picked;
    }
}