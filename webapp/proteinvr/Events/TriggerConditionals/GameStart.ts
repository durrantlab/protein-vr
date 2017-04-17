import parent from "./TriggerConditionalParent";

declare var BABYLON;
// declare var jQuery;

class GameStart extends parent {
    public canvasJQuery = undefined;
    public $ = undefined;
    constructor(params: any, jQuery?: any){
        super(params);
    }

    
    public check() :boolean{
    /**
     * useless method, required to extend parent class
     */
        return true;
    }

    public asyncSetup() :any{
    /**
     * This method sets up the asycnronous function to be called in event.ts
     * 
     * :returns: An object containing the 'listener' target and the event to be listened for.
     * :rtype: :any: `object`
     */
        return {
            "target": "document", 
            "event": "ready"
        };
    }
}

export default GameStart;