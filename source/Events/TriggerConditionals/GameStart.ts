import parent from "./TriggerConditionalParent";

declare var BABYLON;
declare var jQuery;

class GameStart extends parent {
    public canvasJQuery = undefined;
    
    constructor(params: any){
        super(params);
    }

    public check() :boolean{
        let gameBegun = false;
        this.canvasJQuery = jQuery("#renderCanvas");

        gameBegun = this.canvasJQuery.ready(function(){
            return true;
        })
        return gameBegun;
    }
}

export default GameStart;