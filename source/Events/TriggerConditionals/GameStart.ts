import parent from "./TriggerConditionalParent";

declare var BABYLON;
// declare var jQuery;

class GameStart extends parent {
    public canvasJQuery = undefined;
    public $ = undefined;
    constructor(params: any, jQuery?: any){
        super(params);
        this.$ = jQuery;
    }

    /**
     * useless method, required to extend parent class
     */
    public check() :boolean{
        return true;
    }

    public asyncSetup() :any{
        return {
            "target": "document", 
            "event": "ready"
        };
    }
}

export default GameStart;